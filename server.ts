import express from "express";
import http from "http";
import next from "next";
import { Server } from "socket.io";
import ChatSession from "./model/ChatSession";
import dbConnect from "./lib/dbConnect";
import ChatMessage from "./model/ChatMessage";
import { messaging } from "./lib/firebaseAdmin";
import User from "./model/User";

import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const dev = process.env.NODE_ENV !== "production";

const port = Number(process.env.PORT) || 3000;

const app = next({
  dev,
});

const handler = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();

  const server = http.createServer(expressApp);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
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
      },
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
      },
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

          const owner = await User.findById(session.ownerId);

          if (!owner?.fcmToken) {
            console.log("Owner has no FCM token");
          } else {
            console.log("Owner FCM Token:", owner.fcmToken);
          }

          const message = await ChatMessage.create({
            chatSessionId,
            sender,
            content,
          });

          session.lastMessage = content;
          session.lastMessageAt = new Date();

          await session.save();

          if (owner?.fcmToken) {
            try {
              await messaging.send({
                token: owner.fcmToken,

                notification: {
                  title: "Whispr: New Anonymous Message",
                  body: content,
                },

                data: {
                  chatSessionId,
                  type: "new-message",
                  url: `/chat/${chatSessionId}`,
                },
              });

              console.log("✅ Push notification sent");
            } catch (error) {
              console.error("Notification Error:", error);
            }
          }

          const payload = {
            _id: message._id,
            chatSessionId,
            sender,
            content,
            createdAt: message.createdAt,
          };

          io.to(chatSessionId).emit("new-message", payload);

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

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
