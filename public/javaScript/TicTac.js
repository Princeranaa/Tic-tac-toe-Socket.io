const socket = io();
const cells = document.querySelectorAll(".cell");
const messageDisplay = document.getElementById("message");
const room = "room1";
let currentPlayer = "X";
let isGameOver = false;

socket.emit("joinRoom", room);


// waitingForOpponent listening frontend from the server 
socket.on("waitingForOpponent", () => {
  messageDisplay.innerText = "Waiting for opponent...";
});


// startGame listening frontend from the server 
socket.on("startGame", () => {
  messageDisplay.innerText = "Game Started X goes first.";
});



cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!cell.innerText && !isGameOver) {
      socket.emit("playerMove", { room, index, symbol: currentPlayer });
    }
  });
});

socket.on("updateBoard", ({ index, symbol }) => {
  cells[index].innerText = symbol;
  currentPlayer = symbol === "X" ? "O" : "X";

  // Update message to show whose turn it is
  if (!isGameOver) {
    messageDisplay.innerText = `Player ${currentPlayer}'s Turn`;
  }
});


socket.on("gameOver", ({ winner }) => {
  isGameOver = true;
  messageDisplay.innerText = winner === "Tie" ? "It's a tie!" : `${winner} wins!`;
});

socket.on("opponentDisconnected", () => {
  isGameOver = true;
  messageDisplay.innerText = "Opponent disconnected, waiting...";
});

document.getElementById("reset").addEventListener("click", () => {
  socket.emit("resetGame", room);
});

socket.on("gameReset", () => {
  isGameOver = false;
  cells.forEach(cell => (cell.innerText = ""));
  messageDisplay.innerText = "Game restarted!";
});
