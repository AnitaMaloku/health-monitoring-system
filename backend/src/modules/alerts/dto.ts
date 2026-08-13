export interface CreateAlertDto {
    patientId: string;
    level: "WARNING" | "CRITICAL";
    metric?: string;
    value?: number | string;
    message?: string;
}

export type UpdateAlertDto = Partial<CreateAlertDto>;
