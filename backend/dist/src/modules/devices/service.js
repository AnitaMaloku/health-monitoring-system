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
exports.assignDeviceToPatient = exports.deleteDevice = exports.updateDevice = exports.getDeviceById = exports.getDevices = exports.createDevice = void 0;
const api_error_1 = require("../../utils/api-error");
const patientRepository = __importStar(require("../patients/repository"));
const deviceRepository = __importStar(require("./repository"));
const createDevice = async (data) => {
    return deviceRepository.create(data);
};
exports.createDevice = createDevice;
const getDevices = async () => {
    return deviceRepository.findAll();
};
exports.getDevices = getDevices;
const getDeviceById = async (id) => {
    const device = await deviceRepository.findById(id);
    if (!device) {
        throw new api_error_1.ApiError(404, "Device not found");
    }
    return device;
};
exports.getDeviceById = getDeviceById;
const updateDevice = async (id, data) => {
    await (0, exports.getDeviceById)(id);
    return deviceRepository.update(id, data);
};
exports.updateDevice = updateDevice;
const deleteDevice = async (id) => {
    await (0, exports.getDeviceById)(id);
    return deviceRepository.remove(id);
};
exports.deleteDevice = deleteDevice;
const assignDeviceToPatient = async (data) => {
    const [patient, device, patientAssignment, deviceAssignment] = await Promise.all([
        patientRepository.findById(data.patientId),
        deviceRepository.findById(data.deviceId),
        deviceRepository.findActiveAssignmentByPatientId(data.patientId),
        deviceRepository.findActiveAssignmentByDeviceId(data.deviceId)
    ]);
    if (!patient) {
        throw new api_error_1.ApiError(404, "Patient not found");
    }
    if (!device) {
        throw new api_error_1.ApiError(404, "Device not found");
    }
    if (patientAssignment) {
        throw new api_error_1.ApiError(409, "Patient already has an assigned device");
    }
    if (deviceAssignment) {
        throw new api_error_1.ApiError(409, "Device is already assigned to a patient");
    }
    return deviceRepository.assignToPatient(data.patientId, data.deviceId);
};
exports.assignDeviceToPatient = assignDeviceToPatient;
