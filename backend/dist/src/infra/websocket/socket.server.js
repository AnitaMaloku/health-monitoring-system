"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitHealthMeasurement = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
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
exports.initializeSocket = initializeSocket;
const emitHealthMeasurement = (measurement) => {
    if (!io) {
        console.log("Socket.IO is not initialized");
        return;
    }
    io.emit("healthMeasurement", measurement);
};
exports.emitHealthMeasurement = emitHealthMeasurement;
