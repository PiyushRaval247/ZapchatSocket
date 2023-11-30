import { Server } from 'socket.io';
import dotenv from 'dotenv'

dotenv.config();
const port = process.env.SOCKET_IO_PORT
const io = new Server(port, {
    cors: {
        origin: 'https://stately-muffin-ae445f.netlify.app'
    },
});


let users = [];

const addUser = (userData, socketId) => {
    if (!users.some(user => user.sub === userData.sub)) {
        users.push({ ...userData, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user.sub === userId);
};

io.on('connection', (socket) => {
    console.log('user connected');

    // Connect
    socket.on("addUser", userData => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    });

    // Send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);

        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        } else {
            console.error('User not found for receiverId:', data.receiverId);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

// Optional: Log the server start
io.listen(9000, () => {
    console.log('Socket.IO server is listening on port 9000');
});