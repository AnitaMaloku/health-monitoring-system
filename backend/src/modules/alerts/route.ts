import { Router } from "express";
import * as alertController from "./controller";

const router = Router();

router.post("/", alertController.createAlert);
router.get("/", alertController.getAlerts);
router.get("/patient/:patientId", alertController.getAlertsByPatientId);
router.patch("/:id/resolve", alertController.resolveAlert);

export default router;
