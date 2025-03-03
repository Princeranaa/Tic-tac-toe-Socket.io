const socket = io();
const cells = document.querySelectorAll(".cell");
const room = "room1";
let currentPlayer = "X";
let isGameOver = false;

socket.emit("joinRoom", room);

socket.on("startGame", () => {
  alert("Game Started!");
});

// Add event listeners to all cells
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!cell.innerText && !isGameOver) {
      socket.emit("playerMove", { room, index, symbol: currentPlayer });
    }
  });
});

// Listen for updates from the server
socket.on("updateBoard", ({ index, symbol }) => {
  cells[index].innerText = symbol;
  currentPlayer = symbol === "X" ? "O" : "X";
});

// Handle game over (win or tie)
socket.on("gameOver", ({ winner }) => {
  isGameOver = true;
  if (winner === "Tie") {
    alert("It's a tie!");
  } else {
    alert(`${winner} wins!`);
  }
});

// Restart button logic
document.getElementById("reset").addEventListener("click", () => {
  socket.emit("resetGame", room);
});

socket.on("gameReset", () => {
  isGameOver = false;
  cells.forEach(cell => (cell.innerText = ""));
});
