import { Router } from "express";
import { BattleController } from "../controllers/BattleController.js";
// import { authMiddleware } from "../../shared/utils/authMiddleware.js";

const router = Router();
const controller = new BattleController();

// router.use(authMiddleware);

router.post("/create", (req, res) => controller.createBattle(req, res));
router.get("/:battleId", (req, res) => controller.getBattleState(req, res));
router.post("/:battleId/action", (req, res) => controller.handleAction(req, res));
router.post("/:battleId/surrender", (req, res) => controller.surrenderBattle(req, res));
router.post("/:battleId/auto-attack", (req, res) => controller.autoAttack(req, res));


export default router;
