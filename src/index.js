const express = require('express');
const config = require('./config');
const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);


app.use(express.static("src/public"));

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/src/public/index.html");
});

let activeUsers = [];

io.on('connection', function(socket) {
    socket.on("newuser", function(nickname) {
        socket.broadcast.emit("update", nickname + " joined the chat room.");
        socket.nickname = nickname;
        activeUsers.push({nickname});
        io.emit('activeUsers', activeUsers);
    });
    socket.on("exituser", function(nickname) {
        socket.broadcast.emit("update", nickname + " left the chat room.");
        activeUsers = activeUsers.filter(user => user.nickname !== socket.nickname);
        io.emit('activeUsers', activeUsers);
    });
    socket.on("chat", function(message) {
        socket.broadcast.emit("chat", message);
    });
});


server.listen(config.PORT, () => {
    console.log(`Server is listening on port ${config.PORT}...`)
});