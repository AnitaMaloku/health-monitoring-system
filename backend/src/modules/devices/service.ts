import { ApiError } from "../../utils/api-error";
import { AuthUser } from "../auth/types";
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
    const device = await getDeviceById(id);

    if (device.patientDevices.length > 0) {
        throw new ApiError(409, "Device is assigned to a patient and cannot be deleted");
    }

    return deviceRepository.remove(id);
};

export const assignDeviceToPatient = async (data: AssignDeviceDto, user?: AuthUser) => {
    const [patient, device, patientAssignment, deviceAssignment] = await Promise.all([
        patientRepository.findById(data.patientId, user?.role === "DOCTOR" ? user.id : undefined),
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

export const unassignDeviceFromPatient = async (deviceId: string) => {
    const [device, deviceAssignment] = await Promise.all([
        deviceRepository.findById(deviceId),
        deviceRepository.findActiveAssignmentByDeviceId(deviceId)
    ]);

    if (!device) {
        throw new ApiError(404, "Device not found");
    }

    if (!deviceAssignment) {
        throw new ApiError(409, "Device is not currently assigned to a patient");
    }

    return deviceRepository.unassignFromPatient(deviceId);
};
