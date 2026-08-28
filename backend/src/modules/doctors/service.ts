import { ApiError } from "../../utils/api-error";
import { CreateDoctorDto, UpdateDoctorDto } from "./dto";
import * as repository from "./repository";

export const getDoctors = () => repository.findAll();
export const getDoctorById = async (id: string) => {
    const doctor = await repository.findById(id);
    if (!doctor) throw new ApiError(404, "Doctor not found");
    return doctor;
};
export const createDoctor = async (data: CreateDoctorDto) => {
    const email = data.email.trim().toLowerCase();

    if (await repository.findUserByEmail(email)) {
        throw new ApiError(409, "Email is not available");
    }

    if (data.licenseNumber && await repository.findByLicenseNumber(data.licenseNumber.trim())) {
        throw new ApiError(409, "License number is already in use");
    }

    return repository.create({ ...data, email });
};
export const updateDoctor = async (id: string, data: UpdateDoctorDto) => {
    const doctor = await getDoctorById(id);

    if (data.email && data.email.trim().toLowerCase() !== doctor.user.email.toLowerCase()) {
        if (await repository.findUserByEmail(data.email.trim(), doctor.user.id)) {
            throw new ApiError(409, "Email is not available");
        }
    }

    if (data.licenseNumber && data.licenseNumber !== doctor.licenseNumber) {
        if (await repository.findByLicenseNumber(data.licenseNumber.trim(), id)) {
            throw new ApiError(409, "License number is already in use");
        }
    }

    return repository.update(id, {
        ...data,
        email: data.email?.trim().toLowerCase(),
        licenseNumber: data.licenseNumber?.trim()
    });
};
export const deleteDoctor = async (id: string) => {
    await getDoctorById(id);
    await repository.remove(id);
};
