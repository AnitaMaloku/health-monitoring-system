"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.findById = exports.findPatientsWithAssignedDevice = exports.findAll = exports.create = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8);
};
const basicPatientSelect = {
    id: true,
    firstName: true,
    lastName: true,
    birthDate: true,
    gender: true,
    bloodGroup: true,
    createdAt: true,
    updatedAt: true
};
const create = async (data) => {
    const temporaryPassword = generateTemporaryPassword();
    const passHash = await bcrypt_1.default.hash(temporaryPassword, 10);
    const patient = await database_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: data.email,
                passHash,
                role: "PATIENT"
            }
        });
        return tx.patient.create({
            data: {
                userId: user.id,
                firstName: data.firstName,
                lastName: data.lastName,
                birthDate: data.birthDate
                    ? new Date(data.birthDate)
                    : undefined,
                gender: data.gender,
                bloodGroup: data.bloodGroup
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                },
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
    });
    return {
        patient,
        temporaryPassword
    };
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
const findById = (id) => {
    return database_1.prisma.patient.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            },
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
        const patient = await tx.patient.findUnique({
            where: { id },
            select: { userId: true }
        });
        if (patient) {
            await tx.patient.delete({
                where: { id }
            });
            await tx.user.delete({
                where: { id: patient.userId }
            });
        }
    });
};
exports.remove = remove;
