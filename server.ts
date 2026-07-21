import express from "express";
import http from "http";
import next from "next";
import { Server } from "socket.io";
import ChatSession from "./model/ChatSession";
import dbConnect from "./lib/dbConnect";
import ChatMessage from "./model/ChatMessage";

const dev = process.env.NODE_ENV !== "production";

const hostname = "localhost";
const port = 3000;

const app = next({
  dev,
  hostname,
  port,
});

const handler = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();

  const server = http.createServer(expressApp);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client Connected:", socket.id);

    socket.on("join-chat", (chatSessionId: string) => {
      socket.join(chatSessionId);

      console.log(`${socket.id} joined room ${chatSessionId}`);
    });

    socket.on(
  "typing",
  ({
    chatSessionId,
    sender,
  }: {
    chatSessionId: string;
    sender: "anonymous" | "owner";
  }) => {

    console.log("⌨️ Typing:", chatSessionId, sender);

    socket.to(chatSessionId).emit("typing", {
      chatSessionId,
      sender,
    });
  }
);

socket.on(
  "stop-typing",
  ({
    chatSessionId,
    sender,
  }: {
    chatSessionId: string;
    sender: "anonymous" | "owner";
  }) => {
    socket.to(chatSessionId).emit("stop-typing", {
      sender,
    });
  }
);

    socket.on(
      "send-message",
      async ({
        chatSessionId,
        sender,
        content,
      }: {
        chatSessionId: string;
        sender: "anonymous" | "owner";
        content: string;
      }) => {
        try {
          await dbConnect();

          const session = await ChatSession.findById(chatSessionId);

          if (!session) return;

          const message = await ChatMessage.create({
            chatSessionId,
            sender,
            content,
          });

          session.lastMessage = content;
          session.lastMessageAt = new Date();

          await session.save();

          const payload = {
            _id: message._id,
            chatSessionId,
            sender,
            content,
            createdAt: message.createdAt,
          };

          // Chat window
          io.to(chatSessionId).emit("new-message", payload);


          // Sidebar (all logged-in pages)
          io.emit("sidebar-update", payload);

          console.log("📨 Message sent:", content);
        } catch (err) {
          console.error(err);
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("🔴 Client Disconnected:", socket.id);
    });
  });

  expressApp.use((req, res) => {
    return handler(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
