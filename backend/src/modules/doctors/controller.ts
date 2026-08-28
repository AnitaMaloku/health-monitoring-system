import { NextFunction, Request, Response } from "express";
import * as service from "./service";

export async function getDoctors(_req: Request, res: Response, next: NextFunction) { try { res.json(await service.getDoctors()); } catch (error) { next(error); } }
export async function getDoctorById(req: Request<{ id: string }>, res: Response, next: NextFunction) { try { res.json(await service.getDoctorById(req.params.id)); } catch (error) { next(error); } }
export async function createDoctor(req: Request, res: Response, next: NextFunction) { try { res.status(201).json(await service.createDoctor(req.body)); } catch (error) { next(error); } }
export async function updateDoctor(req: Request<{ id: string }>, res: Response, next: NextFunction) { try { res.json(await service.updateDoctor(req.params.id, req.body)); } catch (error) { next(error); } }
export async function deleteDoctor(req: Request<{ id: string }>, res: Response, next: NextFunction) { try { await service.deleteDoctor(req.params.id); res.status(204).send(); } catch (error) { next(error); } }
