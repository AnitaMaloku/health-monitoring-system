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
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getDoctors = void 0;
const api_error_1 = require("../../utils/api-error");
const repository = __importStar(require("./repository"));
const getDoctors = () => repository.findAll();
exports.getDoctors = getDoctors;
const getDoctorById = async (id) => {
    const doctor = await repository.findById(id);
    if (!doctor)
        throw new api_error_1.ApiError(404, "Doctor not found");
    return doctor;
};
exports.getDoctorById = getDoctorById;
const createDoctor = async (data) => {
    const email = data.email.trim().toLowerCase();
    if (await repository.findUserByEmail(email)) {
        throw new api_error_1.ApiError(409, "Email is not available");
    }
    if (data.licenseNumber && await repository.findByLicenseNumber(data.licenseNumber.trim())) {
        throw new api_error_1.ApiError(409, "License number is already in use");
    }
    return repository.create({ ...data, email });
};
exports.createDoctor = createDoctor;
const updateDoctor = async (id, data) => {
    const doctor = await (0, exports.getDoctorById)(id);
    if (data.email && data.email.trim().toLowerCase() !== doctor.user.email.toLowerCase()) {
        if (await repository.findUserByEmail(data.email.trim(), doctor.user.id)) {
            throw new api_error_1.ApiError(409, "Email is not available");
        }
    }
    if (data.licenseNumber && data.licenseNumber !== doctor.licenseNumber) {
        if (await repository.findByLicenseNumber(data.licenseNumber.trim(), id)) {
            throw new api_error_1.ApiError(409, "License number is already in use");
        }
    }
    return repository.update(id, {
        ...data,
        email: data.email?.trim().toLowerCase(),
        licenseNumber: data.licenseNumber?.trim()
    });
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (id) => {
    await (0, exports.getDoctorById)(id);
    await repository.remove(id);
};
exports.deleteDoctor = deleteDoctor;
