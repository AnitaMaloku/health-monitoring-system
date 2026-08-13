"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.findById = exports.findByPatientId = exports.findAll = exports.create = void 0;
const database_1 = require("../../config/database");
const RECENT_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000;
const create = async (data) => {
    return database_1.prisma.alert.create({
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
exports.create = create;
const findAll = () => {
    const cutoff = new Date(Date.now() - RECENT_ALERT_WINDOW_MS);
    return database_1.prisma.alert.findMany({
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
exports.findAll = findAll;
const findByPatientId = (patientId) => {
    const cutoff = new Date(Date.now() - RECENT_ALERT_WINDOW_MS);
    return database_1.prisma.alert.findMany({
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
exports.findByPatientId = findByPatientId;
const findById = (id) => {
    return database_1.prisma.alert.findUnique({
        where: { id },
        include: { patient: true },
    });
};
exports.findById = findById;
const resolve = (id, resolvedAt = new Date()) => {
    return database_1.prisma.alert.update({
        where: { id },
        data: { resolvedAt },
    });
};
exports.resolve = resolve;
