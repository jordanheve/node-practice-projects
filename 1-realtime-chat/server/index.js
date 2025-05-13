import express from 'express';
import logger from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import {createClient} from '@libsql/client';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
connectionStateRecovery: {},
});

const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN,
});

await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        user TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `)

io.on('connection', async (socket) => {
    console.log('A user connected');
   


    socket.on('chat message', async (msg) => {
        let result;
        
        
        try{
            const username = socket.handshake.auth.username ?? 'Anonymous';
            if (!msg) {
                console.error('Message is empty');
                return;
            }
            result = await db.execute(
                {
                    sql: 'INSERT INTO messages (message, user) VALUES (:msg, :username)',
                    args: { msg, username },
                }
            );
        }catch (error) {
            console.error('Error inserting message:', error);
            return;
        }
;
        io.emit('chat message', msg, result.lastInsertRowid.toString(), socket.handshake.auth.username ?? 'Anonymous');
    });



    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    if(!socket.recovered){
      
        try {
            const results = await db.execute(
                {
                    sql: 'SELECT * FROM messages ORDER BY created_at DESC LIMIT 10',
                }
            );
        socket.emit("chat history", results);
        }catch (error) {
            console.error('Error fetching messages:', error);
            return;
        }
       
    }

});

app.use(express.static(path.join(process.cwd(), 'client')));

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});