import { ApiError } from "../../utils/api-error";
import { AuthUser } from "../auth/types";
import { CreatePatientDto, UpdatePatientDto } from "./dto";
import * as patientRepository from "./repository";

async function getDoctorUserId(user?: AuthUser) {
    return user?.role === "DOCTOR" ? user.id : undefined;
}

async function getDoctorIdForUser(userId: string) {
    const doctor = await patientRepository.findDoctorByUserId(userId);
    if (!doctor) throw new ApiError(403, "Doctor profile not found");
    return doctor.id;
}

export const createPatient = async (data: CreatePatientDto, user?: AuthUser) => {
    const doctorId = user?.role === "DOCTOR"
        ? await getDoctorIdForUser(user.id)
        : data.doctorId;

    if (doctorId) {
        const doctor = await patientRepository.findDoctorById(doctorId);
        if (!doctor) throw new ApiError(404, "Doctor not found");
    }
    return patientRepository.create({ ...data, doctorId }, user?.id);
};

export const getPatients = async (user?: AuthUser) => {
    return patientRepository.findAll(await getDoctorUserId(user));
};

export const getPatientsWithAssignedDevice = async (user?: AuthUser) => {
    return patientRepository.findPatientsWithAssignedDevice(await getDoctorUserId(user));
};

export const getPatientsWithoutAssignedDevice = async (user?: AuthUser) => {
    return patientRepository.findPatientsWithoutAssignedDevice(await getDoctorUserId(user));
};

export const getPatientById = async (id: string, user?: AuthUser) => {
    const patient = await patientRepository.findById(id, await getDoctorUserId(user));

    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    return patient;
};

export const updatePatient = async (id: string, data: UpdatePatientDto, user?: AuthUser) => {
    await getPatientById(id, user);
    return patientRepository.update(id, data);
};

export const deletePatient = async (id: string, user?: AuthUser) => {
    await getPatientById(id, user);
    return patientRepository.remove(id);
};

export const getMeasurementsByPatientId = async (patientId: string, limit: number = 20, user?: AuthUser) => {
    await getPatientById(patientId, user);
    return patientRepository.findMeasurementsByPatientId(patientId, limit);
};
