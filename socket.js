export default function Socketio(io) {
  let rooms = {};

  io.on("connection", (socket) => {
    console.log("New User connected:", socket.id);

    socket.on("joinRoom", (room) => {
      if (!rooms[room]) {
        rooms[room] = { players: [], board: Array(9).fill(null) };
      }

      if (rooms[room].players.length < 2) {
        rooms[room].players.push(socket.id);
        socket.join(room);
        io.to(room).emit("playerJoined", rooms[room].players);

        if (rooms[room].players.length === 2) {
          io.to(room).emit("startGame");
        }
      }
    });

    socket.on("playerMove", ({ room, index, symbol }) => {
      if (!rooms[room] || rooms[room].board[index]) return; // Prevent overwriting

      rooms[room].board[index] = symbol;
      io.to(room).emit("updateBoard", { index, symbol });

      // Check for a winner
      const winner = checkWinner(rooms[room].board);
      if (winner) {
        io.to(room).emit("gameOver", { winner });
        rooms[room].board = Array(9).fill(null); // Reset board for next game
        return;
      }

      // Check for a tie (if board is full and no winner)
      if (rooms[room].board.every((cell) => cell !== null)) {
        io.to(room).emit("gameOver", { winner: "Tie" });
        rooms[room].board = Array(9).fill(null); // Reset board
      }
    });

    socket.on("resetGame", (room) => {
      if (rooms[room]) {
        rooms[room].board = Array(9).fill(null); // Reset board
        io.to(room).emit("gameReset");
      }
    });

    socket.on("disconnect", () => {
      for (let room in rooms) {
        rooms[room].players = rooms[room].players.filter((id) => id !== socket.id);
      }
    });
  });

  // Function to check for a winner
  function checkWinner(board) {
    const winningPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6], // Diagonals
    ];

    for (let pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Return 'X' or 'O' as winner
      }
    }
    return null;
  }
}
