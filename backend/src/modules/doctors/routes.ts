import { Router } from "express";
import * as controller from "./controller";
import { validateCreateDoctor, validateUpdateDoctor } from "./validation";

const router = Router();
router.get("/", controller.getDoctors);
router.post("/", validateCreateDoctor, controller.createDoctor);
router.get("/:id", controller.getDoctorById);
router.patch("/:id", validateUpdateDoctor, controller.updateDoctor);
router.delete("/:id", controller.deleteDoctor);
export default router;
