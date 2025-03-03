import express from "express";
const app = express();
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const server = createServer(app);
const io = new Server(server);

app.set("views engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("hello world");
});

server.listen(3000, () => {
  console.log(`server stated at 3000`);
});
