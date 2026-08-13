import { prisma } from "../../config/database";
import { CreateAlertDto } from "./dto";

const RECENT_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const create = async (data: CreateAlertDto) => {
    return prisma.alert.create({
        data: {
            patientId: data.patientId,
            level: data.level,
            metric: data.metric,
            value: data.value !== undefined ? Number(data.value) : undefined,
            message: data.message,
        },
        include: {
            patient: true,
        },
    });
};

export const findAll = () => {
    const cutoff = new Date(Date.now() - RECENT_ALERT_WINDOW_MS);

    return prisma.alert.findMany({
        where: {
            createdAt: {
                gte: cutoff,
            },
        },
        include: {
            patient: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const findByPatientId = (patientId: string) => {
    const cutoff = new Date(Date.now() - RECENT_ALERT_WINDOW_MS);

    return prisma.alert.findMany({
        where: {
            patientId,
            createdAt: {
                gte: cutoff,
            },
        },
        include: { patient: true },
        orderBy: { createdAt: "desc" },
    });
};

export const findById = (id: string) => {
    return prisma.alert.findUnique({
        where: { id },
        include: { patient: true },
    });
};

export const resolve = (id: string, resolvedAt = new Date()) => {
    return prisma.alert.update({
        where: { id },
        data: { resolvedAt },
    });
};
