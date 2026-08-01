import { DeviceStatus } from "../../generated/prisma/client";
import { prisma } from "../../config/database";
import { CreateDeviceDto, UpdateDeviceDto } from "./dto";

export const create = (data: CreateDeviceDto) => {
    return prisma.device.create({
        data: {
            serialNumber: data.serialNumber,
            deviceType: data.deviceType,
            status: data.status,
            lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined
        }
    });
};

export const findAll = () => {
    return prisma.device.findMany({
        include: {
            patientDevices: {
                where: {
                    unassignedAt: null
                },
                include: {
                    patient: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findById = (id: string) => {
    return prisma.device.findUnique({
        where: { id },
        include: {
            patientDevices: {
                where: {
                    unassignedAt: null
                },
                include: {
                    patient: true
                }
            }
        }
    });
};

export const update = (id: string, data: UpdateDeviceDto) => {
    return prisma.device.update({
        where: { id },
        data: {
            serialNumber: data.serialNumber,
            deviceType: data.deviceType,
            status: data.status,
            lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined
        }
    });
};

export const remove = (id: string) => {
    return prisma.device.delete({
        where: { id }
    });
};

export const findActiveAssignmentByDeviceId = (deviceId: string) => {
    return prisma.patientDevice.findFirst({
        where: {
            deviceId,
            unassignedAt: null
        }
    });
};

export const findActiveAssignmentByPatientId = (patientId: string) => {
    return prisma.patientDevice.findFirst({
        where: {
            patientId,
            unassignedAt: null
        }
    });
};

export const assignToPatient = (patientId: string, deviceId: string) => {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.patientDevice.create({
            data: {
                patientId,
                deviceId
            },
            include: {
                patient: true,
                device: true
            }
        });

        await tx.device.update({
            where: { id: deviceId },
            data: {
                status: DeviceStatus.ACTIVE
            }
        });

        return assignment;
    });
};
