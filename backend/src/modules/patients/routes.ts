import { Router } from "express";
import * as patientController from "./controller";
import { validateCreatePatient, validateUpdatePatient } from "./validation";

const router = Router();

router.post("/", validateCreatePatient, patientController.createPatient);
router.get("/", patientController.getPatients);
router.get("/:id", patientController.getPatientById);
router.patch("/:id", validateUpdatePatient, patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);

export default router;
