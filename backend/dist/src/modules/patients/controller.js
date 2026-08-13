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
exports.deletePatient = exports.updatePatient = exports.getPatientById = exports.getPatientsWithAssignedDevice = exports.getPatients = exports.createPatient = void 0;
const patientService = __importStar(require("./service"));
const createPatient = async (req, res, next) => {
    try {
        const patient = await patientService.createPatient(req.body);
        res.status(201).json(patient);
    }
    catch (error) {
        next(error);
        console.error("Error creating patient:", error);
    }
};
exports.createPatient = createPatient;
const getPatients = async (req, res, next) => {
    try {
        const patients = await patientService.getPatients();
        res.status(200).json(patients);
    }
    catch (error) {
        next(error);
    }
};
exports.getPatients = getPatients;
const getPatientsWithAssignedDevice = async (req, res, next) => {
    try {
        const patients = await patientService.getPatientsWithAssignedDevice();
        res.status(200).json(patients);
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientsWithAssignedDevice = getPatientsWithAssignedDevice;
const getPatientById = async (req, res, next) => {
    try {
        const patient = await patientService.getPatientById(req.params.id);
        res.status(200).json(patient);
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientById = getPatientById;
const updatePatient = async (req, res, next) => {
    try {
        const patient = await patientService.updatePatient(req.params.id, req.body);
        res.status(200).json(patient);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePatient = updatePatient;
const deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deletePatient = deletePatient;
