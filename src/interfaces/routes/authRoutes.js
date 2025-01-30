import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

const router = Router();
const controller = new AuthController();

router.get("/nonce", (req, res) => controller.getNonce(req, res));
router.post("/verify", (req, res) => controller.verifySignature(req, res));

export default router;
