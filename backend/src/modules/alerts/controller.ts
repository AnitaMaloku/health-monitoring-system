import { NextFunction, Request, Response } from "express";
import * as alertService from "./service";

export const createAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alert = await alertService.createAlert(req.body);
        res.status(201).json(alert);
    } catch (error) {
        next(error);
    }
};

export const getAlerts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alerts = await alertService.getAlerts();
        res.status(200).json(alerts);
    } catch (error) {
        next(error);
    }
};

export const getAlertsByPatientId = async (
    req: Request<{ patientId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const alerts = await alertService.getAlertsByPatientId(req.params.patientId);
        res.status(200).json(alerts);
    } catch (error) {
        next(error);
    }
};

export const resolveAlert = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const alert = await alertService.resolveAlert(req.params.id);
        res.status(200).json(alert);
    } catch (error) {
        next(error);
    }
};
