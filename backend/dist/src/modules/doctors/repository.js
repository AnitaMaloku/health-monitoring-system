"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findByLicenseNumber = exports.findUserByEmail = exports.findById = exports.findAll = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../../config/database");
const doctorSelect = {
    id: true,
    specialization: true,
    licenseNumber: true,
    phone: true,
    createdAt: true,
    user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } },
    _count: { select: { patients: true } }
};
const findAll = () => database_1.prisma.doctor.findMany({
    where: { deletedAt: null }, select: doctorSelect, orderBy: { createdAt: "desc" }
});
exports.findAll = findAll;
const findById = (id) => database_1.prisma.doctor.findFirst({
    where: { id, deletedAt: null }, select: doctorSelect
});
exports.findById = findById;
const findUserByEmail = (email, exceptUserId) => database_1.prisma.user.findFirst({
    where: {
        email: email.toLowerCase(),
        ...(exceptUserId ? { NOT: { id: exceptUserId } } : {})
    },
    select: { id: true }
});
exports.findUserByEmail = findUserByEmail;
const findByLicenseNumber = (licenseNumber, exceptDoctorId) => database_1.prisma.doctor.findFirst({
    where: {
        licenseNumber,
        ...(exceptDoctorId ? { NOT: { id: exceptDoctorId } } : {})
    },
    select: { id: true }
});
exports.findByLicenseNumber = findByLicenseNumber;
const create = async (data) => database_1.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: {
            email: data.email.toLowerCase(), password: await bcrypt_1.default.hash(data.password, 12),
            firstName: data.firstName, lastName: data.lastName, role: "DOCTOR"
        }
    });
    const doctor = await tx.doctor.create({
        data: { userId: user.id, specialization: data.specialization, licenseNumber: data.licenseNumber, phone: data.phone },
        select: doctorSelect
    });
    return doctor;
});
exports.create = create;
const update = async (id, data) => database_1.prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id, deletedAt: null }, select: { userId: true } });
    if (!doctor)
        return null;
    const { password, email, firstName, lastName, ...doctorData } = data;
    await tx.user.update({
        where: { id: doctor.userId },
        data: {
            email: email?.toLowerCase(), firstName, lastName,
            ...(password ? { password: await bcrypt_1.default.hash(password, 12) } : {})
        }
    });
    return tx.doctor.update({ where: { id }, data: doctorData, select: doctorSelect });
});
exports.update = update;
const remove = (id) => database_1.prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id, deletedAt: null }, select: { userId: true } });
    if (!doctor)
        return null;
    const deletedAt = new Date();
    await tx.doctor.update({ where: { id }, data: { deletedAt } });
    await tx.user.update({ where: { id: doctor.userId }, data: { deletedAt, isActive: false } });
    return true;
});
exports.remove = remove;
