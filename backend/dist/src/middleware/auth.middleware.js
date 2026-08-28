"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const api_error_1 = require("../utils/api-error");
const service_1 = require("../modules/auth/service");
function authenticate(req, _res, next) {
    try {
        const header = req.header("Authorization");
        if (!header?.startsWith("Bearer "))
            throw new api_error_1.ApiError(401, "Authorization token is required");
        req.user = (0, service_1.verifyAccessToken)(header.slice(7));
        next();
    }
    catch (error) {
        next(error);
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            next(new api_error_1.ApiError(403, "You do not have permission to access this resource"));
            return;
        }
        next();
    };
}
