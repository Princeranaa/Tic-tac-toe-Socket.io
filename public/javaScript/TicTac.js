const socket = io();
const cells = document.querySelectorAll(".cell");
const room = "room1";
let currentPlayer = "x";


socket.emit("joinRoom", room);

socket.on("startGame", ()=> {
    alert("Game started")
});

