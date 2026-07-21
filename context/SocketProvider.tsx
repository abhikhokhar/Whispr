'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();

    socketInstance.on("connect", () => {
      console.log("Connected:", socketInstance.id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};