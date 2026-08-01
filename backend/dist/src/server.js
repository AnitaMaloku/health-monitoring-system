"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const mqtt_handler_1 = require("./infra/mqtt/mqtt.handler");
const route_1 = __importDefault(require("./modules/devices/route"));
const routes_1 = __importDefault(require("./modules/patients/routes"));
const api_error_1 = require("./utils/api-error");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/patients", routes_1.default);
app.use("/devices", route_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Health Monitoring API running"
    });
});
app.use((err, req, res, next) => {
    if (err instanceof api_error_1.ApiError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});
(0, mqtt_handler_1.startMqttHealthIngest)();
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
