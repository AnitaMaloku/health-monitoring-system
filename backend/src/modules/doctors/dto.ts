export type CreateDoctorDto = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    licenseNumber?: string;
    phone?: string;
};

export type UpdateDoctorDto = Partial<Omit<CreateDoctorDto, "email">> & {
    email?: string;
};
