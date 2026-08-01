import { ApiError } from "../../utils/api-error";
import * as patientRepository from "../patients/repository";
import { AssignDeviceDto, CreateDeviceDto, UpdateDeviceDto } from "./dto";
import * as deviceRepository from "./repository";

export const createDevice = async (data: CreateDeviceDto) => {
    return deviceRepository.create(data);
};

export const getDevices = async () => {
    return deviceRepository.findAll();
};

export const getDeviceById = async (id: string) => {
    const device = await deviceRepository.findById(id);

    if (!device) {
        throw new ApiError(404, "Device not found");
    }

    return device;
};

export const updateDevice = async (id: string, data: UpdateDeviceDto) => {
    await getDeviceById(id);
    return deviceRepository.update(id, data);
};

export const deleteDevice = async (id: string) => {
    await getDeviceById(id);
    return deviceRepository.remove(id);
};

export const assignDeviceToPatient = async (data: AssignDeviceDto) => {
    const [patient, device, patientAssignment, deviceAssignment] = await Promise.all([
        patientRepository.findById(data.patientId),
        deviceRepository.findById(data.deviceId),
        deviceRepository.findActiveAssignmentByPatientId(data.patientId),
        deviceRepository.findActiveAssignmentByDeviceId(data.deviceId)
    ]);

    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    if (!device) {
        throw new ApiError(404, "Device not found");
    }

    if (patientAssignment) {
        throw new ApiError(409, "Patient already has an assigned device");
    }

    if (deviceAssignment) {
        throw new ApiError(409, "Device is already assigned to a patient");
    }

    return deviceRepository.assignToPatient(data.patientId, data.deviceId);
};
