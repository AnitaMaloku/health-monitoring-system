"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAssignDevice = exports.validateUpdateDevice = exports.validateCreateDevice = void 0;
const client_1 = require("../../generated/prisma/client");
const api_error_1 = require("../../utils/api-error");
const isDeviceStatus = (status) => {
    return typeof status === "string" && Object.values(client_1.DeviceStatus).includes(status);
};
const isValidDate = (value) => {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};
const validateCreateDevice = (req, res, next) => {
    const { serialNumber, deviceType, status, lastConnected } = req.body;
    if (!serialNumber || !deviceType) {
        next(new api_error_1.ApiError(400, "serialNumber and deviceType are required"));
        return;
    }
    if (status !== undefined && !isDeviceStatus(status)) {
        next(new api_error_1.ApiError(400, "Invalid device status"));
        return;
    }
    if (lastConnected !== undefined && !isValidDate(lastConnected)) {
        next(new api_error_1.ApiError(400, "lastConnected must be a valid date"));
        return;
    }
    next();
};
exports.validateCreateDevice = validateCreateDevice;
const validateUpdateDevice = (req, res, next) => {
    const { status, lastConnected } = req.body;
    if (status !== undefined && !isDeviceStatus(status)) {
        next(new api_error_1.ApiError(400, "Invalid device status"));
        return;
    }
    if (lastConnected !== undefined && !isValidDate(lastConnected)) {
        next(new api_error_1.ApiError(400, "lastConnected must be a valid date"));
        return;
    }
    next();
};
exports.validateUpdateDevice = validateUpdateDevice;
const validateAssignDevice = (req, res, next) => {
    const { patientId, deviceId } = req.body;
    if (!patientId || !deviceId) {
        next(new api_error_1.ApiError(400, "patientId and deviceId are required"));
        return;
    }
    next();
};
exports.validateAssignDevice = validateAssignDevice;
