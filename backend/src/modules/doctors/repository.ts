import bcrypt from "bcrypt";
import { prisma } from "../../config/database";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto";

const doctorSelect = {
    id: true,
    specialization: true,
    licenseNumber: true,
    phone: true,
    createdAt: true,
    user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } },
    _count: { select: { patients: true } }
} as const;

export const findAll = () => prisma.doctor.findMany({
    where: { deletedAt: null }, select: doctorSelect, orderBy: { createdAt: "desc" }
});

export const findById = (id: string) => prisma.doctor.findFirst({
    where: { id, deletedAt: null }, select: doctorSelect
});

export const findUserByEmail = (email: string, exceptUserId?: string) => prisma.user.findFirst({
    where: {
        email: email.toLowerCase(),
        ...(exceptUserId ? { NOT: { id: exceptUserId } } : {})
    },
    select: { id: true }
});

export const findByLicenseNumber = (licenseNumber: string, exceptDoctorId?: string) => prisma.doctor.findFirst({
    where: {
        licenseNumber,
        ...(exceptDoctorId ? { NOT: { id: exceptDoctorId } } : {})
    },
    select: { id: true }
});

export const create = async (data: CreateDoctorDto) => prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: {
            email: data.email.toLowerCase(), password: await bcrypt.hash(data.password, 12),
            firstName: data.firstName, lastName: data.lastName, role: "DOCTOR"
        }
    });
    const doctor = await tx.doctor.create({
        data: { userId: user.id, specialization: data.specialization, licenseNumber: data.licenseNumber, phone: data.phone },
        select: doctorSelect
    });
    return doctor;
});

export const update = async (id: string, data: UpdateDoctorDto) => prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id, deletedAt: null }, select: { userId: true } });
    if (!doctor) return null;
    const { password, email, firstName, lastName, ...doctorData } = data;
    await tx.user.update({
        where: { id: doctor.userId },
        data: {
            email: email?.toLowerCase(), firstName, lastName,
            ...(password ? { password: await bcrypt.hash(password, 12) } : {})
        }
    });
    return tx.doctor.update({ where: { id }, data: doctorData, select: doctorSelect });
});

export const remove = (id: string) => prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findFirst({ where: { id, deletedAt: null }, select: { userId: true } });
    if (!doctor) return null;
    const deletedAt = new Date();
    await tx.doctor.update({ where: { id }, data: { deletedAt } });
    await tx.user.update({ where: { id: doctor.userId }, data: { deletedAt, isActive: false } });
    return true;
});
