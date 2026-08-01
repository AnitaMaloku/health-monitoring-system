import { NextFunction, Request, Response } from "express";
import { DeviceStatus } from "../../generated/prisma/client";
import { ApiError } from "../../utils/api-error";

const isDeviceStatus = (status: unknown): status is DeviceStatus => {
    return typeof status === "string" && Object.values(DeviceStatus).includes(status as DeviceStatus);
};

const isValidDate = (value: unknown) => {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};

export const validateCreateDevice = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { serialNumber, deviceType, status, lastConnected } = req.body;

    if (!serialNumber || !deviceType) {
        next(new ApiError(400, "serialNumber and deviceType are required"));
        return;
    }

    if (status !== undefined && !isDeviceStatus(status)) {
        next(new ApiError(400, "Invalid device status"));
        return;
    }

    if (lastConnected !== undefined && !isValidDate(lastConnected)) {
        next(new ApiError(400, "lastConnected must be a valid date"));
        return;
    }

    next();
};

export const validateUpdateDevice = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status, lastConnected } = req.body;

    if (status !== undefined && !isDeviceStatus(status)) {
        next(new ApiError(400, "Invalid device status"));
        return;
    }

    if (lastConnected !== undefined && !isValidDate(lastConnected)) {
        next(new ApiError(400, "lastConnected must be a valid date"));
        return;
    }

    next();
};

export const validateAssignDevice = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { patientId, deviceId } = req.body;

    if (!patientId || !deviceId) {
        next(new ApiError(400, "patientId and deviceId are required"));
        return;
    }

    next();
};
