import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Scoketio from "./socket.js"; // Ensure correct import

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

Scoketio(io); // Initialize socket handling

app.get("/", (req, res) => {
  res.render("Tic-tac-toe");
});

server.listen(3000, () => {
  console.log(`Server started at 3000`);
});
