import { prisma } from "../../config/database";
import { CreatePatientDto, UpdatePatientDto } from "./dto";

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
} as const;

export const create = async (data: CreatePatientDto, createdById?: string) => {
    return prisma.patient.create({
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

export const findAll = (doctorUserId?: string) => {
    return prisma.patient.findMany({
        where: doctorUserId ? { doctor: { userId: doctorUserId } } : undefined,
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findPatientsWithAssignedDevice = (doctorUserId?: string) => {
    return prisma.patient.findMany({
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

export const findPatientsWithoutAssignedDevice = (doctorUserId?: string) => {
    return prisma.patient.findMany({
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



export const findById = (id: string, doctorUserId?: string) => {
    return prisma.patient.findFirst({
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

export const findDoctorById = (id: string) => {
    return prisma.doctor.findFirst({
        where: { id, deletedAt: null, user: { isActive: true, deletedAt: null } },
        select: { id: true }
    });
};

export const findDoctorByUserId = (userId: string) => {
    return prisma.doctor.findFirst({
        where: { userId, deletedAt: null, user: { isActive: true, deletedAt: null } },
        select: { id: true }
    });
};

export const update = (id: string, data: UpdatePatientDto) => {
    return prisma.patient.update({
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

export const remove = (id: string) => {
    return prisma.$transaction(async (tx) => {
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

export const findMeasurementsByPatientId = async (patientId: string, limit: number = 20) => {
    return prisma.healthMeasurement.findMany({
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
