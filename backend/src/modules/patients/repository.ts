import { prisma } from "../../config/database";
import { CreatePatientDto, UpdatePatientDto } from "./dto";

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
} as const;

export const create = async (data: CreatePatientDto) => {
    return prisma.patient.create({
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

export const findAll = () => {
    return prisma.patient.findMany({
        select: basicPatientSelect,
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findPatientsWithAssignedDevice = () => {
    return prisma.patient.findMany({
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

export const findPatientsWithoutAssignedDevice = () => {
    return prisma.patient.findMany({
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



export const findById = (id: string) => {
    return prisma.patient.findUnique({
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

export const update = (id: string, data: UpdatePatientDto) => {
    return prisma.patient.update({
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
