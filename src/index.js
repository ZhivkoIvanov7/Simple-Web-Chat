const express = require('express');
const app = express();
const config = require('./config');

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("src/public"));

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/src/public/index.html");
});

io.on('connection', socket => {
    socket.on("newuser", nickname => {
        socket.broadcast.emit("update", nickname + "joined the conversation");
    });
    socket.on("exituser", nickname => {
        socket.broadcast.emit("update", nickname + "left the conversation");
    });
    socket.on("chat", message => {
        socket.broadcast.emit("chat", message);
    });
});

server.listen(config.PORT, () => {
    console.log(`Server is listening on port ${config.PORT}...`)
});