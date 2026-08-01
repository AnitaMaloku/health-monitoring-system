"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMqttClient = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const env_1 = require("../../config/env");
const createMqttClient = (options = {}) => {
    return mqtt_1.default.connect(env_1.env.MQTT_URL, {
        reconnectPeriod: 5000,
        ...options
    });
};
exports.createMqttClient = createMqttClient;
