export default (io) => {
  let rooms = {};

  // listen from the server side
  io.on("connection", (socket) => {
    console.log("New User connected :", socket.id);

    socket.on("joinRoom", (room) => {
      //  first there is no players
      if (!rooms[room]) rooms[room] = { players: [] };
     
      

      if (rooms[room].players.length < 2) {
        rooms[room].players.push(socket.id);
        socket.join(room);

        io.to(room).emit("playerJoined", rooms[room].players);

        if (rooms[room].players.length === 2) {
          io.to(room).emit("startGame");
        }
      }
    });

    socket.on("playerMove", ({ room, index, Symbol }) => {
      io.to(room).emit("updatedBoard", { index, Symbol });
    });

    socket.on("restGame", (room) => {
      io.to(room).emit("gameReset");
    });

    socket.on("disconnect", () => {
      for (let room in rooms) {
        rooms[room].players = rooms[room].players.filter(
          (id) => id !== socket.id
        );
      }
    });
  });
};
