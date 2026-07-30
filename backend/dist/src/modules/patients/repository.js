"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPatientById = exports.createPatient = void 0;
const database_1 = require("../../config/database");
const createPatient = (data) => {
    return database_1.prisma.patient.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            },
            patientDevices: {
                include: {
                    device: true
                }
            }
        }
    });
};
exports.createPatient = createPatient;
const findPatientById = (id) => {
    return database_1.prisma.patient.findUnique({
        where: { id }
    });
};
exports.findPatientById = findPatientById;
