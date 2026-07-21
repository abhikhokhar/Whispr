import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export const initSocket = (server: any) => {
  if (!io) {
    io = new IOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client Connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client Disconnected:", socket.id);
      });
    });
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};