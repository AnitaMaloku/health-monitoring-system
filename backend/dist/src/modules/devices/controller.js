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
exports.unassignDeviceFromPatient = exports.assignDeviceToPatient = exports.deleteDevice = exports.updateDevice = exports.getDeviceById = exports.getDevices = exports.createDevice = void 0;
const deviceService = __importStar(require("./service"));
const createDevice = async (req, res, next) => {
    try {
        const device = await deviceService.createDevice(req.body);
        res.status(201).json(device);
    }
    catch (error) {
        next(error);
    }
};
exports.createDevice = createDevice;
const getDevices = async (req, res, next) => {
    try {
        const devices = await deviceService.getDevices();
        res.status(200).json(devices);
    }
    catch (error) {
        next(error);
    }
};
exports.getDevices = getDevices;
const getDeviceById = async (req, res, next) => {
    try {
        const device = await deviceService.getDeviceById(req.params.id);
        res.status(200).json(device);
    }
    catch (error) {
        next(error);
    }
};
exports.getDeviceById = getDeviceById;
const updateDevice = async (req, res, next) => {
    try {
        const device = await deviceService.updateDevice(req.params.id, req.body);
        res.status(200).json(device);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDevice = updateDevice;
const deleteDevice = async (req, res, next) => {
    try {
        await deviceService.deleteDevice(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDevice = deleteDevice;
const assignDeviceToPatient = async (req, res, next) => {
    try {
        const assignment = await deviceService.assignDeviceToPatient(req.body, req.user);
        res.status(201).json(assignment);
    }
    catch (error) {
        next(error);
    }
};
exports.assignDeviceToPatient = assignDeviceToPatient;
const unassignDeviceFromPatient = async (req, res, next) => {
    try {
        const device = await deviceService.unassignDeviceFromPatient(req.params.id);
        res.status(200).json(device);
    }
    catch (error) {
        next(error);
    }
};
exports.unassignDeviceFromPatient = unassignDeviceFromPatient;
