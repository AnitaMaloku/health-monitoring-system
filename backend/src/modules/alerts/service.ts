import { ApiError } from "../../utils/api-error";
import * as alertRepository from "./repository";
import { CreateAlertDto } from "./dto";

export const createAlert = async (data: CreateAlertDto) => {
    if (!data.patientId) {
        throw new ApiError(400, "patientId is required");
    }

    if (data.level !== "WARNING" && data.level !== "CRITICAL") {
        throw new ApiError(400, "level must be WARNING or CRITICAL");
    }

    return alertRepository.create(data);
};

export const getAlerts = async () => {
    return alertRepository.findAll();
};

export const getAlertsByPatientId = async (patientId: string) => {
    return alertRepository.findByPatientId(patientId);
};

export const getAlertById = async (id: string) => {
    const alert = await alertRepository.findById(id);

    if (!alert) {
        throw new ApiError(404, "Alert not found");
    }

    return alert;
};

export const resolveAlert = async (id: string) => {
    await getAlertById(id);
    return alertRepository.resolve(id);
};
