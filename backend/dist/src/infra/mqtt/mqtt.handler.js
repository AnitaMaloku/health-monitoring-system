"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMqttHealthIngest = void 0;
const client_1 = require("@prisma/client/runtime/client");
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const socket_server_1 = require("../websocket/socket.server");
const mqtt_client_1 = require("./mqtt.client");
const isFiniteNumber = (value) => {
    return typeof value === "number" && Number.isFinite(value);
};
const normalizePayload = (rawPayload) => {
    try {
        const parsedPayload = JSON.parse(rawPayload);
        if (!parsedPayload.serialNumber || typeof parsedPayload.serialNumber !== "string") {
            return null;
        }
        return {
            serialNumber: parsedPayload.serialNumber,
            heartRate: isFiniteNumber(parsedPayload.heartRate) ? parsedPayload.heartRate : undefined,
            spo2: isFiniteNumber(parsedPayload.spo2) ? parsedPayload.spo2 : undefined,
            temp: isFiniteNumber(parsedPayload.temp) ? parsedPayload.temp : undefined,
            systolicPressure: isFiniteNumber(parsedPayload.systolicPressure) ? parsedPayload.systolicPressure : undefined,
            diastolicPressure: isFiniteNumber(parsedPayload.diastolicPressure) ? parsedPayload.diastolicPressure : undefined,
            respiratoryRate: isFiniteNumber(parsedPayload.respiratoryRate) ? parsedPayload.respiratoryRate : undefined,
            timestamp: typeof parsedPayload.timestamp === "string" ? parsedPayload.timestamp : undefined
        };
    }
    catch {
        return null;
    }
};
const persistMeasurement = async (payload) => {
    const deviceId = await database_1.prisma.device.findUnique({
        where: {
            serialNumber: payload.serialNumber
        },
        select: {
            id: true
        }
    });
    if (!deviceId) {
        console.warn(`[mqtt] Unknown serialNumber ${payload.serialNumber}`);
        return;
    }
    const patientDeviceId = await database_1.prisma.patientDevice.findFirst({
        where: {
            deviceId: deviceId.id,
            unassignedAt: null
        },
        select: {
            id: true,
        }
    });
    if (!patientDeviceId) {
        console.warn(`[mqtt] Unknown patientDevice for serialNumber ${payload.serialNumber}`);
        return;
    }
    const measurement = await database_1.prisma.healthMeasurement.create({
        data: {
            patientDeviceId: patientDeviceId.id,
            heartRate: payload.heartRate,
            spo2: payload.spo2,
            temp: payload.temp === undefined ? undefined : new client_1.Decimal(payload.temp),
            systolicPressure: payload.systolicPressure,
            diastolicPressure: payload.diastolicPressure,
            respiratoryRate: payload.respiratoryRate,
            timestamp: payload.timestamp ? new Date(payload.timestamp) : undefined
        }
    });
    await database_1.prisma.device.update({
        where: {
            id: deviceId.id
        },
        data: {
            lastConnected: new Date()
        }
    });
    console.log(`[mqtt] Stored measurement for patientDeviceId=${patientDeviceId.id}`);
    (0, socket_server_1.emitHealthMeasurement)({
        ...measurement,
        temp: measurement.temp === null ? null : Number(measurement.temp),
        serialNumber: payload.serialNumber
    });
};
const startMqttHealthIngest = () => {
    const client = (0, mqtt_client_1.createMqttClient)();
    client.on("connect", () => {
        console.log(`[mqtt] Connected to ${env_1.env.MQTT_URL}`);
        client.subscribe(env_1.env.MQTT_TOPIC, (error) => {
            if (error) {
                console.error(`[mqtt] Failed to subscribe to ${env_1.env.MQTT_TOPIC}`, error);
                return;
            }
            console.log(`[mqtt] Subscribed to ${env_1.env.MQTT_TOPIC}`);
        });
    });
    client.on("message", (topic, message) => {
        if (topic !== env_1.env.MQTT_TOPIC) {
            return;
        }
        const payload = normalizePayload(message.toString());
        if (!payload) {
            console.warn(`[mqtt] Ignored invalid message on ${topic}`);
            return;
        }
        void persistMeasurement(payload).catch((error) => {
            console.error("[mqtt] Failed to persist measurement", error);
        });
    });
    client.on("error", (error) => {
        console.error("[mqtt] Client error", error);
    });
    client.on("reconnect", () => {
        console.log("[mqtt] Reconnecting...");
    });
    return client;
};
exports.startMqttHealthIngest = startMqttHealthIngest;
