import { prisma } from "../../config/database";
import { CreatePatientDto, UpdatePatientDto } from "./dto";
import bcrypt from "bcrypt";

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
} as const;

export const create = async (data: CreatePatientDto) => {
    const temporaryPassword = generateTemporaryPassword();

    const passHash = await bcrypt.hash(temporaryPassword, 10);

    const patient = await prisma.$transaction(async (tx) => {

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



export const findById = (id: string) => {
    return prisma.patient.findUnique({
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
    return prisma.patient.delete({
        where: { id }
    });
};
