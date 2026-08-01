"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.findById = exports.findAll = exports.create = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8);
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
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.findAll = findAll;
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
    return database_1.prisma.patient.delete({
        where: { id }
    });
};
exports.remove = remove;
