"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeviceToPatient = exports.findActiveAssignmentByDeviceId = exports.findDeviceById = exports.createDevice = void 0;
const client_1 = require("../../generated/prisma/client");
const database_1 = require("../../config/database");
const createDevice = (data) => {
    return database_1.prisma.device.create({
        data,
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
exports.createDevice = createDevice;
const findDeviceById = (id) => {
    return database_1.prisma.device.findUnique({
        where: { id }
    });
};
exports.findDeviceById = findDeviceById;
const findActiveAssignmentByDeviceId = (deviceId) => {
    return database_1.prisma.patientDevice.findFirst({
        where: {
            deviceId,
            unassignedAt: null
        }
    });
};
exports.findActiveAssignmentByDeviceId = findActiveAssignmentByDeviceId;
const assignDeviceToPatient = (patientId, deviceId) => {
    return database_1.prisma.$transaction(async (tx) => {
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
            where: {
                id: deviceId
            },
            data: {
                status: client_1.DeviceStatus.ACTIVE
            }
        });
        return assignment;
    });
};
exports.assignDeviceToPatient = assignDeviceToPatient;
