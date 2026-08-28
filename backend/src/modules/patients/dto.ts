export interface CreatePatientDto {
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
    bloodGroup?: string;
    doctorId?: string;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;
