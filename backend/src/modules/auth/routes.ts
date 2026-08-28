import { Router } from "express";
import * as authController from "./controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.patch("/profile", authenticate, authController.updateProfile);

export default router;
