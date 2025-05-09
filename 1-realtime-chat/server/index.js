import express from 'express';
import logger from 'morgan';
import path from 'path';

import { Server } from 'socket.io';
import { createServer } from 'node:http';


const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(express.static(path.join(process.cwd(), 'client')));

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});