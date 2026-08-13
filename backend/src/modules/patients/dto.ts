export interface CreatePatientDto {
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
    bloodGroup?: string;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;
