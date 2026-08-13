"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.findById = exports.findPatientsWithoutAssignedDevice = exports.findPatientsWithAssignedDevice = exports.findAll = exports.create = void 0;
const database_1 = require("../../config/database");
const basicPatientSelect = {
    id: true,
    firstName: true,
    lastName: true,
    birthDate: true,
    gender: true,
    bloodGroup: true,
    createdAt: true,
    updatedAt: true,
    patientDevices: {
        where: {
            unassignedAt: null
        },
        select: {
            device: {
                select: {
                    serialNumber: true
                }
            }
        }
    }
};
const create = async (data) => {
    return database_1.prisma.patient.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            bloodGroup: data.bloodGroup
        },
        include: {
            patientDevices: {
                where: {
                    unassignedAt: null
                },
                include: {
                    device: true
                }
            }
        }
    });
};
exports.create = create;
const findAll = () => {
    return database_1.prisma.patient.findMany({
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.findAll = findAll;
const findPatientsWithAssignedDevice = () => {
    return database_1.prisma.patient.findMany({
        where: {
            patientDevices: {
                some: {
                    unassignedAt: null
                }
            }
        },
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.findPatientsWithAssignedDevice = findPatientsWithAssignedDevice;
const findPatientsWithoutAssignedDevice = () => {
    return database_1.prisma.patient.findMany({
        where: {
            patientDevices: {
                none: {
                    unassignedAt: null
                }
            }
        },
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.findPatientsWithoutAssignedDevice = findPatientsWithoutAssignedDevice;
const findById = (id) => {
    return database_1.prisma.patient.findUnique({
        where: { id },
        include: {
            patientDevices: {
                where: {
                    unassignedAt: null
                },
                include: {
                    device: true
                }
            }
        }
    });
};
exports.findById = findById;
const update = (id, data) => {
    return database_1.prisma.patient.update({
        where: { id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            bloodGroup: data.bloodGroup
        }
    });
};
exports.update = update;
const remove = (id) => {
    return database_1.prisma.$transaction(async (tx) => {
        const activeAssignments = await tx.patientDevice.findMany({
            where: {
                patientId: id,
                unassignedAt: null
            },
            select: {
                deviceId: true
            }
        });
        if (activeAssignments.length > 0) {
            await tx.device.updateMany({
                where: {
                    id: {
                        in: activeAssignments.map((assignment) => assignment.deviceId)
                    }
                },
                data: {
                    status: "INACTIVE"
                }
            });
        }
        return tx.patient.delete({
            where: { id }
        });
    });
};
exports.remove = remove;
