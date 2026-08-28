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
exports.getMeasurementsByPatientId = exports.deletePatient = exports.updatePatient = exports.getPatientById = exports.getPatientsWithoutAssignedDevice = exports.getPatientsWithAssignedDevice = exports.getPatients = exports.createPatient = void 0;
const api_error_1 = require("../../utils/api-error");
const patientRepository = __importStar(require("./repository"));
async function getDoctorUserId(user) {
    return user?.role === "DOCTOR" ? user.id : undefined;
}
async function getDoctorIdForUser(userId) {
    const doctor = await patientRepository.findDoctorByUserId(userId);
    if (!doctor)
        throw new api_error_1.ApiError(403, "Doctor profile not found");
    return doctor.id;
}
const createPatient = async (data, user) => {
    const doctorId = user?.role === "DOCTOR"
        ? await getDoctorIdForUser(user.id)
        : data.doctorId;
    if (doctorId) {
        const doctor = await patientRepository.findDoctorById(doctorId);
        if (!doctor)
            throw new api_error_1.ApiError(404, "Doctor not found");
    }
    return patientRepository.create({ ...data, doctorId }, user?.id);
};
exports.createPatient = createPatient;
const getPatients = async (user) => {
    return patientRepository.findAll(await getDoctorUserId(user));
};
exports.getPatients = getPatients;
const getPatientsWithAssignedDevice = async (user) => {
    return patientRepository.findPatientsWithAssignedDevice(await getDoctorUserId(user));
};
exports.getPatientsWithAssignedDevice = getPatientsWithAssignedDevice;
const getPatientsWithoutAssignedDevice = async (user) => {
    return patientRepository.findPatientsWithoutAssignedDevice(await getDoctorUserId(user));
};
exports.getPatientsWithoutAssignedDevice = getPatientsWithoutAssignedDevice;
const getPatientById = async (id, user) => {
    const patient = await patientRepository.findById(id, await getDoctorUserId(user));
    if (!patient) {
        throw new api_error_1.ApiError(404, "Patient not found");
    }
    return patient;
};
exports.getPatientById = getPatientById;
const updatePatient = async (id, data, user) => {
    await (0, exports.getPatientById)(id, user);
    return patientRepository.update(id, data);
};
exports.updatePatient = updatePatient;
const deletePatient = async (id, user) => {
    await (0, exports.getPatientById)(id, user);
    return patientRepository.remove(id);
};
exports.deletePatient = deletePatient;
const getMeasurementsByPatientId = async (patientId, limit = 20, user) => {
    await (0, exports.getPatientById)(patientId, user);
    return patientRepository.findMeasurementsByPatientId(patientId, limit);
};
exports.getMeasurementsByPatientId = getMeasurementsByPatientId;
