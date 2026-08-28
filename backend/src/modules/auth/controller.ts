import { NextFunction, Request, Response } from "express";
import * as authService from "./service";
import { AuthRequest } from "./types";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as { email?: string; password?: string };
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        res.json(await authService.login(email, password));
    } catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.body as { refreshToken?: string };
        if (!refreshToken) {
            res.status(400).json({ message: "Refresh token is required" });
            return;
        }
        res.json(await authService.refresh(refreshToken));
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.body as { refreshToken?: string };
        if (refreshToken) await authService.logout(refreshToken);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const user = (req as AuthRequest).user;
        if (!user) {
            res.status(401).json({ message: "Authentication is required" });
            return;
        }

        res.json(await authService.updateProfile(user.id, req.body));
    } catch (error) {
        next(error);
    }
}
