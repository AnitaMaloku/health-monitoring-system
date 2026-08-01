import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";

const isValidDate = (value: unknown) => {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};

export const validateCreatePatient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        email,
        firstName,
        lastName,
        birthDate,
        gender,
        bloodGroup
    } = req.body;

    if (!email || !firstName || !lastName) {
        next(
            new ApiError(
                400,
                "email, firstName and lastName are required"
            )
        );
        return;
    }

    if (birthDate !== undefined && !isValidDate(birthDate)) {
        next(new ApiError(400, "birthDate must be a valid date"));
        return;
    }

    next();
};

export const validateUpdatePatient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.body.birthDate !== undefined && !isValidDate(req.body.birthDate)) {
        next(new ApiError(400, "birthDate must be a valid date"));
        return;
    }

    next();
};
