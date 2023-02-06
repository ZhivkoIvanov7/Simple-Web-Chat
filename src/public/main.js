const app = document.querySelector(".app");

const socket = io();

let nname;

app.querySelector(".join-screen #join-user").addEventListener('click', () => {
    let nickname = document.getElementById("nickname").value;
    if (nickname.length === 0) {
        return alert("Nickname is required!");
    }
    socket.emit("newuser", nickname);
    nname = nickname;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");

});

app.querySelector(".chat-screen #send-message").addEventListener('click', () => {
    let message = document.getElementById("message-input").value;
    if (message.length == 0) {
        return;
    }
    let parts = message.split(" ");
    if (parts[0] === ":quit") {
        socket.emit("exituser", nname);
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".join-screen").classList.add("active");
        app.querySelector(".chat-screen #message-input").value = "";
        document.getElementById("nickname").value = "";
    } else if (parts[0] === ":nick") {
        if (parts.length >= 2) {
            nname = parts[1];
            socket.emit("nick", nname);
            app.querySelector(".chat-screen #message-input").value = "";
        }
    } else {
        renderMessage("my", {
            nickname: nname,
            text: message
        });
        socket.emit("chat", {
            nickname: nname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    }
});

app.querySelector(".chat-screen #exit-chat").addEventListener("click", () => {
    socket.emit("exituser", nname);
    window.location.href = window.location.href;
});

socket.on("whisper", function (message) {
    renderMessage("whisper", message);
});

socket.on("update", function (update) {
    renderMessage("update", update);
});

socket.on("chat", function (message) {
    renderMessage("other", message);
});

socket.on('activeUsers', users => {
    let userList = '<div><h3>Active Users:</h3>';
    users.forEach(user => {
        userList += `<div>${user.nickname}</div>`;
        userList += '</div>'
    });
    document.querySelector('.active-users').innerHTML = userList;
});
socket.emit('join', nickname);

function renderMessage(type, message) {
    let today = new Date()
    let time = today.toLocaleTimeString().replace(/.*(\d{2}:\d{2}):\d{2}.*/, "$1");

    let messageContainer = document.querySelector(".chat-screen .messages");
    if (type == "my") {
        let messageInput = document.getElementById("message-input").value;
        let parts = messageInput.split(" ");
        if (parts[0] === ":whisper") {
            if (parts.length >= 3) {
                let el = document.createElement("div");
                el.setAttribute("class", "message my-message");
                el.innerHTML = `
                <div>
                    <div class="name">${message.nickname} ${time}</div>
                    <div class="text" style="color:blue;">To:${parts.slice(1).join(" ")}</div>
                </div>
                `;
                messageContainer.appendChild(el);
            }
        } else {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
            <div>
                <div class="name">${message.nickname} ${time}</div>
                <div class="text">${message.text}</div>
            </div>
            `;
            messageContainer.appendChild(el);
        }
    } else if (type == "other") {
        let el = document.createElement("div");
        el.setAttribute("class", "message other-message");
        el.innerHTML = `
            <div>
                <div class="name">${message.nickname} ${time}</div>
                <div class="text">${message.text}</div>
            </div>
            `;
        messageContainer.appendChild(el);
    } else if (type === "whisper") {
        let el = document.createElement("div");
        el.setAttribute("class", "message whisper-message");
        el.innerHTML = `
            <div>
                <div class="name">${message.nickname} ${time}</div>
                <div class="text" style="color:red;">${message.text}</div>
            </div>
        `;
        messageContainer.appendChild(el);
    } else if (type == "update") {
        let el = document.createElement("div");
        el.setAttribute("class", "update");
        el.innerText = message;
        messageContainer.appendChild(el);
    }
    message.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
}