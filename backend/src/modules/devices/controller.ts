import { NextFunction, Request, Response } from "express";
import * as deviceService from "./service";

export const createDevice = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const device = await deviceService.createDevice(req.body);
        res.status(201).json(device);
    } catch (error) {
        next(error);
    }
};

export const getDevices = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const devices = await deviceService.getDevices();
        res.status(200).json(devices);
    } catch (error) {
        next(error);
    }
};

export const getDeviceById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const device = await deviceService.getDeviceById(req.params.id);
        res.status(200).json(device);
    } catch (error) {
        next(error);
    }
};

export const updateDevice = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const device = await deviceService.updateDevice(req.params.id, req.body);
        res.status(200).json(device);
    } catch (error) {
        next(error);
    }
};

export const deleteDevice = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        await deviceService.deleteDevice(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const assignDeviceToPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const assignment = await deviceService.assignDeviceToPatient(req.body);
        res.status(201).json(assignment);
    } catch (error) {
        next(error);
    }
};
