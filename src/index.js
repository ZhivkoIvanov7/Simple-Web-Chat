const express = require('express');
const config = require('./config');
const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);


app.use(express.static("src/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/src/public/index.html");
});

let activeUsers = [];

io.on('connection', function (socket) {
    socket.on("newuser", function (nickname) {
        socket.broadcast.emit("update", nickname + " joined the chat room.");
        socket.nickname = nickname;
        activeUsers.push({ socketId: socket.id, nickname });
        io.emit('activeUsers', activeUsers);
    });
    socket.on("exituser", function (nickname) {
        socket.broadcast.emit("update", nickname + " left the chat room.");
        activeUsers = activeUsers.filter(user => user.nickname !== socket.nickname);
        io.emit('activeUsers', activeUsers);
    });
    socket.on("chat", function (message) {
        if (message.text[0] === ':') {
            let parts = message.text.split(' ');
            switch (parts[0]) {
                case ':whisper':
                    if (parts.length >= 3) {
                        let whisperNick = parts[1];
                        let whisperMessage = parts.slice(2).join(' ');
                        let recipient = activeUsers.find(user => user.nickname === whisperNick);
                        socket.to(recipient.socketId).emit("whisper", {
                            nickname: message.nickname,
                            text: whisperMessage
                        })
                    } else {
                        socket.emit("update", ":whisper <nickname> <message>");
                    }
                    break;
                default:
                    socket.emit("update", "Unsupported command");
            }
        } else {
            socket.broadcast.emit("chat", message);
        }
    });
    socket.on("nick", function (nickname) {
        let existingUser = activeUsers.find((user) => user.nickname === nickname);
        if (existingUser) {
            socket.emit("update", "Nickname already exists. Please choose a different one.");
            return;
        }
        socket.broadcast.emit("update", socket.nickname + " changed their nickname to " + nickname);
        socket.nickname = nickname;
        activeUsers = activeUsers.map((user) => {
            if (user.socketId === socket.id) {
                user.nickname = nickname;
            }
            return user;
        });
        io.emit("activeUsers", activeUsers);
    });
});

server.listen(config.PORT, () => {
    console.log(`Server is listening on port ${config.PORT}...`)
});