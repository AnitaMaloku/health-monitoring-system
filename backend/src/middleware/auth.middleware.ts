import { NextFunction, Request, Response } from "express";
import { UserRole } from "../generated/prisma/enums";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../modules/auth/service";
import { AuthRequest } from "../modules/auth/types";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const header = req.header("Authorization");
        if (!header?.startsWith("Bearer ")) throw new ApiError(401, "Authorization token is required");
        (req as AuthRequest).user = verifyAccessToken(header.slice(7));
        next();
    } catch (error) {
        next(error);
    }
}

export function requireRole(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user || !roles.includes(user.role)) {
            next(new ApiError(403, "You do not have permission to access this resource"));
            return;
        }
        next();
    };
}
