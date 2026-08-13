import { NextFunction, Request, Response } from "express";
import * as patientService from "./service";

export const createPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const patient = await patientService.createPatient(req.body);
        res.status(201).json(patient);
    } catch (error) {
        next(error);
        console.error("Error creating patient:", error);
    }
};

export const getPatients = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const patients = await patientService.getPatients();
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

export const getPatientsWithAssignedDevice = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const patients = await patientService.getPatientsWithAssignedDevice();
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

export const getPatientsWithoutAssignedDevice = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const patients = await patientService.getPatientsWithoutAssignedDevice();
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

export const getPatientById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const patient = await patientService.getPatientById(req.params.id);
        res.status(200).json(patient);
    } catch (error) {
        next(error);
    }
};

export const updatePatient = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const patient = await patientService.updatePatient(req.params.id, req.body);
        res.status(200).json(patient);
    } catch (error) {
        next(error);
    }
};

export const deletePatient = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        await patientService.deletePatient(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getMeasurementsByPatientId = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const measurements = await patientService.getMeasurementsByPatientId(req.params.id, limit);
        res.status(200).json(measurements);
    } catch (error) {
        next(error);
    }
};
