import { Router } from "express";
import { PokemonController } from "../controllers/PokemonController.js";

const router = Router();
const controller = new PokemonController();

// router.use(authMiddleware); // перевірка JWT

router.post("/", (req, res) => controller.getPokemons(req, res));
router.get("/:id", (req, res) => controller.getPokemonById(req, res));

export default router;
