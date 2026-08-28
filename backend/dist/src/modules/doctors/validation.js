"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateDoctor = validateCreateDoctor;
exports.validateUpdateDoctor = validateUpdateDoctor;
const api_error_1 = require("../../utils/api-error");
function validateCreateDoctor(req, _res, next) {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        next(new api_error_1.ApiError(400, "email, password, firstName and lastName are required"));
        return;
    }
    next();
}
function validateUpdateDoctor(req, _res, next) {
    if (req.body.email === "" || req.body.firstName === "" || req.body.lastName === "") {
        next(new api_error_1.ApiError(400, "email, firstName and lastName cannot be empty"));
        return;
    }
    next();
}
