"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMeasurementsByPatientId = exports.remove = exports.update = exports.findDoctorByUserId = exports.findDoctorById = exports.findById = exports.findPatientsWithoutAssignedDevice = exports.findPatientsWithAssignedDevice = exports.findAll = exports.create = void 0;
const database_1 = require("../../config/database");
const basicPatientSelect = {
    id: true,
    firstName: true,
    lastName: true,
    birthDate: true,
    gender: true,
    bloodGroup: true,
    doctor: {
        select: {
            id: true,
            user: { select: { firstName: true, lastName: true } }
        }
    },
    createdAt: true,
    updatedAt: true,
    patientDevices: {
        where: {
            unassignedAt: null
        },
        select: {
            device: {
                select: {
                    id: true,
                    serialNumber: true,
                    deviceType: true,
                    status: true
                }
            }
        }
    }
};
const create = async (data, createdById) => {
    return database_1.prisma.patient.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            doctorId: data.doctorId,
            createdById
        },
        include: {
            doctor: { include: { user: true } },
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
const findAll = (doctorUserId) => {
    return database_1.prisma.patient.findMany({
        where: doctorUserId ? { doctor: { userId: doctorUserId } } : undefined,
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.findAll = findAll;
const findPatientsWithAssignedDevice = (doctorUserId) => {
    return database_1.prisma.patient.findMany({
        where: {
            ...(doctorUserId ? { doctor: { userId: doctorUserId } } : {}),
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
const findPatientsWithoutAssignedDevice = (doctorUserId) => {
    return database_1.prisma.patient.findMany({
        where: {
            ...(doctorUserId ? { doctor: { userId: doctorUserId } } : {}),
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
const findById = (id, doctorUserId) => {
    return database_1.prisma.patient.findFirst({
        where: {
            id,
            ...(doctorUserId ? { doctor: { userId: doctorUserId } } : {})
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
exports.findById = findById;
const findDoctorById = (id) => {
    return database_1.prisma.doctor.findFirst({
        where: { id, deletedAt: null, user: { isActive: true, deletedAt: null } },
        select: { id: true }
    });
};
exports.findDoctorById = findDoctorById;
const findDoctorByUserId = (userId) => {
    return database_1.prisma.doctor.findFirst({
        where: { userId, deletedAt: null, user: { isActive: true, deletedAt: null } },
        select: { id: true }
    });
};
exports.findDoctorByUserId = findDoctorByUserId;
const update = (id, data) => {
    return database_1.prisma.patient.update({
        where: { id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            doctorId: data.doctorId
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
const findMeasurementsByPatientId = async (patientId, limit = 20) => {
    return database_1.prisma.healthMeasurement.findMany({
        where: {
            patientDevice: {
                patientId: patientId,
                unassignedAt: null
            }
        },
        orderBy: {
            timestamp: "desc"
        },
        take: limit,
        include: {
            patientDevice: {
                include: {
                    device: {
                        select: {
                            serialNumber: true
                        }
                    }
                }
            }
        }
    });
};
exports.findMeasurementsByPatientId = findMeasurementsByPatientId;
