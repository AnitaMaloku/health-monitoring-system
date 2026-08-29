import { Router } from "express";
import * as deviceController from "./controller";
import {
    validateAssignDevice,
    validateCreateDevice,
    validateUpdateDevice
} from "./validation";
import { requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../generated/prisma/enums";

const router = Router();

router.post("/", validateCreateDevice,requireRole(UserRole.ADMIN), deviceController.createDevice);
router.get("/", deviceController.getDevices);
router.get("/:id", requireRole(UserRole.ADMIN), deviceController.getDeviceById);
router.post("/:id/unassign", deviceController.unassignDeviceFromPatient);
router.patch("/:id", validateUpdateDevice, requireRole(UserRole.ADMIN), deviceController.updateDevice);
router.delete("/:id", requireRole(UserRole.ADMIN), deviceController.deleteDevice);
router.post("/assign", validateAssignDevice, deviceController.assignDeviceToPatient);

export default router;
