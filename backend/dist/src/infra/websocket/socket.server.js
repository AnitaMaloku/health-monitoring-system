"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitHealthMeasurement = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const database_1 = require("../../config/database");
let io;
const getLatestMeasurementsForAll = async () => {
    const measurements = await database_1.prisma.healthMeasurement.findMany({
        distinct: ['patientDeviceId'],
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            patientDevice: {
                include: {
                    device: true
                }
            }
        }
    });
    return measurements.map((m) => ({
        id: m.id,
        serialNumber: m.patientDevice.device.serialNumber,
        patientDeviceId: m.patientDeviceId,
        heartRate: m.heartRate,
        spo2: m.spo2,
        temp: m.temp ? Number(m.temp) : null,
        systolicPressure: m.systolicPressure,
        diastolicPressure: m.diastolicPressure,
        respiratoryRate: m.respiratoryRate,
        timestamp: m.timestamp
    }));
};
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
        },
    });
    io.on("connection", async (socket) => {
        console.log("Frontend connected:", socket.id);
        try {
            const measurements = await getLatestMeasurementsForAll();
            socket.emit("initialMeasurements", measurements);
        }
        catch (error) {
            console.error("Failed to fetch initial measurements:", error);
        }
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
