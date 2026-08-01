import { DeviceStatus } from "../../generated/prisma/client";

export type CreateDeviceDto = {
    serialNumber: string;
    deviceType: string;
    status?: DeviceStatus;
    lastConnected?: string;
};

export type UpdateDeviceDto = Partial<CreateDeviceDto>;

export type AssignDeviceDto = {
    patientId: string;
    deviceId: string;
};
