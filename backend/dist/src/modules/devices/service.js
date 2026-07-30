"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeviceToPatient = exports.createDevice = void 0;
const client_1 = require("../../generated/prisma/client");
const api_error_1 = require("../../utils/api-error");
const patientRepository = __importStar(require("../patients/repository"));
const deviceRepository = __importStar(require("./repository"));
const isDeviceStatus = (status) => {
    return Object.values(client_1.DeviceStatus).includes(status);
};
const parseLastConnected = (lastConnected) => {
    if (!lastConnected) {
        return undefined;
    }
    const parsed = new Date(lastConnected);
    if (Number.isNaN(parsed.getTime())) {
        throw new api_error_1.ApiError(400, "lastConnected must be a valid date");
    }
    return parsed;
};
const createDevice = async (input) => {
    if (!input.serialNumber || !input.deviceType) {
        throw new api_error_1.ApiError(400, "serialNumber and deviceType are required");
    }
    if (input.status && !isDeviceStatus(input.status)) {
        throw new api_error_1.ApiError(400, "Invalid device status");
    }
    return deviceRepository.createDevice({
        serialNumber: input.serialNumber,
        deviceType: input.deviceType,
        status: input.status,
        lastConnected: parseLastConnected(input.lastConnected)
    });
};
exports.createDevice = createDevice;
const assignDeviceToPatient = async (input) => {
    if (!input.patientId || !input.deviceId) {
        throw new api_error_1.ApiError(400, "patientId and deviceId are required");
    }
    const [patient, device, activeAssignment] = await Promise.all([
        patientRepository.findPatientById(input.patientId),
        deviceRepository.findDeviceById(input.deviceId),
        deviceRepository.findActiveAssignmentByDeviceId(input.deviceId)
    ]);
    if (!patient) {
        throw new api_error_1.ApiError(404, "Patient not found");
    }
    if (!device) {
        throw new api_error_1.ApiError(404, "Device not found");
    }
    if (activeAssignment) {
        throw new api_error_1.ApiError(409, "Device is already assigned to a patient");
    }
    return deviceRepository.assignDeviceToPatient(input.patientId, input.deviceId);
};
exports.assignDeviceToPatient = assignDeviceToPatient;
