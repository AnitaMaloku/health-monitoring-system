import { ApiError } from "../../utils/api-error";
import { CreatePatientDto, UpdatePatientDto } from "./dto";
import * as patientRepository from "./repository";

export const createPatient = async (data: CreatePatientDto) => {
    return patientRepository.create(data);
};

export const getPatients = async () => {
    return patientRepository.findAll();
};

export const getPatientsWithAssignedDevice = async () => {
    return patientRepository.findPatientsWithAssignedDevice();
};

export const getPatientsWithoutAssignedDevice = async () => {
    return patientRepository.findPatientsWithoutAssignedDevice();
};

export const getPatientById = async (id: string) => {
    const patient = await patientRepository.findById(id);

    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    return patient;
};

export const updatePatient = async (id: string, data: UpdatePatientDto) => {
    await getPatientById(id);
    return patientRepository.update(id, data);
};

export const deletePatient = async (id: string) => {
    await getPatientById(id);
    return patientRepository.remove(id);
};
