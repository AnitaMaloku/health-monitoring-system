export interface CreatePatientDto {
    email: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
    bloodGroup?: string;
}

export type UpdatePatientDto = Partial<Omit<CreatePatientDto, "userId">>;
