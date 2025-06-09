import express, { Request, Response } from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import { DrawEvent, ChatMessage } from "./types";

const app = express();
const port = process.env.PORT || 4000;

const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    msg: "Sketchly server up and running",
  });
});

const whiteboardNs = io.of("/whiteboard");

const roomHistory: Record<string, DrawEvent[]> = {};

whiteboardNs.on("connection", (socket) => {
  const { roomId, username } = socket.handshake.query as Record<string, string>;
  if (!roomId) {
    socket.disconnect();
    return;
  }

  socket.join(roomId);
  roomHistory[roomId] = roomHistory[roomId] || [];
  socket.emit("init-state", roomHistory[roomId]);
  socket.emit("init-ack", { msg: `Welcome to room ${roomId}` });
  console.log(
    `[${new Date().toISOString()}] ${username || socket.id} joined ${roomId}`
  );

  socket.on("draw", (ev: DrawEvent) => {
    const fullEv: DrawEvent = { ...ev, userId: socket.id };
    roomHistory[roomId].push(fullEv);
    socket.to(roomId).emit("draw", fullEv);
  });

  socket.on("cursor-move", (data: { x: number; y: number; usedId: string }) => {
    socket.to(roomId).emit("cursor-move", data);
  });

  socket.on("chat:message", (data: ChatMessage) => {
    whiteboardNs.to(roomId).emit("chat:message", data);
  });

  socket.on("undo", () => {
    const history = roomHistory[roomId];
    if (!history || history.length == 0) {
      return;
    }

    let beginIdx = history
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.userId === socket.id && e.type === "begin")
      .map(({ i }) => i)
      .pop();
    
    if (beginIdx === undefined) return;

    let endIdx = history.findIndex((e, idx) => idx > beginIdx && e.type === "end" && e.userId === socket.id);

    if (endIdx === -1){
        endIdx = history.length - 1;
    }

    history.splice(beginIdx, endIdx - beginIdx + 1);

    whiteboardNs.to(roomId).emit("init-state", history);
  });

  socket.on("clear", () => {
    const history = roomHistory[roomId];
    if (!history || history.length == 0) return;

    roomHistory[roomId] = [];

    whiteboardNs.to(roomId).emit("init-state", roomHistory[roomId]);
  });

  socket.on("disconnect", () => {
    console.log(`[${new Date().toISOString()}] ${socket.id} left ${roomId}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Sketchly server listening on http://localhost:${port}`);
});
