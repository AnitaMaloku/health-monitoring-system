import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";

export function validateCreateDoctor(req: Request, _res: Response, next: NextFunction) {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        next(new ApiError(400, "email, password, firstName and lastName are required"));
        return;
    }
    next();
}

export function validateUpdateDoctor(req: Request, _res: Response, next: NextFunction) {
    if (req.body.email === "" || req.body.firstName === "" || req.body.lastName === "") {
        next(new ApiError(400, "email, firstName and lastName cannot be empty"));
        return;
    }
    next();
}
