"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unassignFromPatient = exports.assignToPatient = exports.findActiveAssignmentByPatientId = exports.findActiveAssignmentByDeviceId = exports.remove = exports.update = exports.findById = exports.findAll = exports.create = void 0;
const client_1 = require("../../generated/prisma/client");
const database_1 = require("../../config/database");
const create = (data) => {
    return database_1.prisma.device.create({
        data: {
            serialNumber: data.serialNumber,
            deviceType: data.deviceType,
            status: data.status,
            lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined
        }
    });
};
exports.create = create;
const findAll = () => {
    return database_1.prisma.device.findMany({
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
exports.findAll = findAll;
const findById = (id) => {
    return database_1.prisma.device.findUnique({
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
exports.findById = findById;
const update = (id, data) => {
    return database_1.prisma.device.update({
        where: { id },
        data: {
            serialNumber: data.serialNumber,
            deviceType: data.deviceType,
            status: data.status,
            lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined
        }
    });
};
exports.update = update;
const remove = (id) => {
    return database_1.prisma.device.delete({
        where: { id }
    });
};
exports.remove = remove;
const findActiveAssignmentByDeviceId = (deviceId) => {
    return database_1.prisma.patientDevice.findFirst({
        where: {
            deviceId,
            unassignedAt: null
        }
    });
};
exports.findActiveAssignmentByDeviceId = findActiveAssignmentByDeviceId;
const findActiveAssignmentByPatientId = (patientId) => {
    return database_1.prisma.patientDevice.findFirst({
        where: {
            patientId,
            unassignedAt: null
        }
    });
};
exports.findActiveAssignmentByPatientId = findActiveAssignmentByPatientId;
const assignToPatient = (patientId, deviceId) => {
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
            where: { id: deviceId },
            data: {
                status: client_1.DeviceStatus.ACTIVE
            }
        });
        return assignment;
    });
};
exports.assignToPatient = assignToPatient;
const unassignFromPatient = (deviceId) => {
    return database_1.prisma.$transaction(async (tx) => {
        await tx.patientDevice.updateMany({
            where: {
                deviceId,
                unassignedAt: null
            },
            data: {
                unassignedAt: new Date()
            }
        });
        return tx.device.update({
            where: { id: deviceId },
            data: {
                status: client_1.DeviceStatus.INACTIVE
            }
        });
    });
};
exports.unassignFromPatient = unassignFromPatient;
