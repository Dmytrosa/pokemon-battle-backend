import { Router } from "express";
import { SettingsController } from "../controllers/SettingsController.js";
// import { authMiddleware } from "../../shared/utils/authMiddleware.js";

const router = Router();
const controller = new SettingsController();

// router.use(authMiddleware); // JWT

router.get("/profile", (req, res) => controller.getProfile(req, res));
router.patch("/profile", (req, res) => controller.updateProfile(req, res));

export default router;
