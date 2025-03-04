export default function Socketio(io) {
  let rooms = {};

  io.on("connection", (socket) => {
    console.log("New User connected:", socket.id);

    socket.on("joinRoom", (room) => {
      if (!rooms[room]) {
        rooms[room] = { players: [], board: Array(9).fill(null) };
      }

       // here the user id push in the rooms object  
      if (rooms[room].players.length < 2) {
        rooms[room].players.push(socket.id);
        socket.join(room);


        // cross check if there is the one players comes than
        // they server send the message to the frontend 
        if (rooms[room].players.length === 1) {
          io.to(room).emit("waitingForOpponent"); // Notify first player to wait
        }


        // if there is 2 players than start the game
        // otherwise it see the waitingfor the opponent
        if (rooms[room].players.length === 2) {
          io.to(room).emit("startGame"); // Start game when two players are connected
        }
      }
    });

    socket.on("playerMove", ({ room, index, symbol }) => {  
      if (!rooms[room] || rooms[room].board[index]) return;
      rooms[room].board[index] = symbol;
      io.to(room).emit("updateBoard", { index, symbol });
    
      const winner = checkWinner(rooms[room].board);
    
      // Ensure we check for a winner before a tie
      if (winner) {
        io.to(room).emit("gameOver", { winner });
        rooms[room].board = Array(9).fill(null); 
        return;
      }
    
      // Check for tie only if no winner is found
      if (!winner && rooms[room].board.every((cell) => cell !== null)) {
        io.to(room).emit("gameOver", { winner: "Tie" });
        rooms[room].board = Array(9).fill(null);
      }
    });
    

    socket.on("resetGame", (room) => {
      if (rooms[room]) {
        rooms[room].board = Array(9).fill(null);
        io.to(room).emit("gameReset");
      }
    });

    socket.on("disconnect", () => {
      for (let room in rooms) {
        rooms[room].players = rooms[room].players.filter((id) => id !== socket.id);
        
        if (rooms[room].players.length === 1) {
          io.to(room).emit("opponentDisconnected"); // Notify remaining player
        }
      }
    });
  });

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
