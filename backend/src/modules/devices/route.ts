import { Router } from "express";
import * as deviceController from "./controller";
import {
    validateAssignDevice,
    validateCreateDevice,
    validateUpdateDevice
} from "./validation";

const router = Router();

router.post("/", validateCreateDevice, deviceController.createDevice);
router.get("/", deviceController.getDevices);
router.get("/:id", deviceController.getDeviceById);
router.patch("/:id", validateUpdateDevice, deviceController.updateDevice);
router.delete("/:id", deviceController.deleteDevice);
router.post("/assign", validateAssignDevice, deviceController.assignDeviceToPatient);

export default router;
