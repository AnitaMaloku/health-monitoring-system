"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdatePatient = exports.validateCreatePatient = void 0;
const api_error_1 = require("../../utils/api-error");
const isValidDate = (value) => {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};
const validateCreatePatient = (req, res, next) => {
    const { firstName, lastName, birthDate, gender, bloodGroup } = req.body;
    if (!firstName || !lastName) {
        next(new api_error_1.ApiError(400, "firstName and lastName are required"));
        return;
    }
    if (birthDate !== undefined && !isValidDate(birthDate)) {
        next(new api_error_1.ApiError(400, "birthDate must be a valid date"));
        return;
    }
    next();
};
exports.validateCreatePatient = validateCreatePatient;
const validateUpdatePatient = (req, res, next) => {
    if (req.body.birthDate !== undefined && !isValidDate(req.body.birthDate)) {
        next(new api_error_1.ApiError(400, "birthDate must be a valid date"));
        return;
    }
    next();
};
exports.validateUpdatePatient = validateUpdatePatient;
