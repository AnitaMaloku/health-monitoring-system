import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Frontend connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Frontend disconnected:", socket.id);
    });
  });

  return io;
};

export const emitHealthMeasurement = (measurement: unknown) => {
  if (!io) {
    console.log("Socket.IO is not initialized");
    return;
  }

  io.emit("healthMeasurement", measurement);
};