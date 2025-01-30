import { BattleUseCase } from "../../application/use-cases/BattleUseCase.js";
import { BattleRepository } from "../../infrastructure/repositories/BattleRepository.js";
import { PokemonRepository } from "../../infrastructure/repositories/PokemonRepository.js";
import { UserPokemonRepository } from "../../infrastructure/repositories/UserPokemonRepository.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

export class BattleController {
  constructor() {
    const battleRepo = new BattleRepository();
    const pokemonRepo = new PokemonRepository();
    const userRepo = new UserRepository();
    const userPokemonRepo = new UserPokemonRepository();

    this.battleUseCase = new BattleUseCase(battleRepo, pokemonRepo, userRepo, userPokemonRepo);
  }

  /**
   * @param {object} req
   * @param {object} res
   */
  async createBattle(req, res) {
    try {
      const { userId, playerPokemonId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!playerPokemonId) {
        return res.status(400).json({ error: "Missing playerPokemonId" });
      }

      const battle = await this.battleUseCase.createBattle({
        userId,
        playerPokemonId,
      });
      res.status(201).json(battle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @param {object} req
   * @param {object} res
   */
  async getBattleState(req, res) {
    try {
      const { battleId } = req.params;
      const battle = await this.battleUseCase.getBattleState(battleId);
      res.status(200).json(battle);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * @param {object} req
   * @param {object} res
   */
  async handleAction(req, res) {
    try {
      const { battleId } = req.params;
      const { action } = req.body;
      const updated = await this.battleUseCase.handleAction(battleId, action);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @param {object} req
   * @param {object} res
   */
  async surrenderBattle(req, res) {
    try {
      const { battleId } = req.params;
      const updated = await this.battleUseCase.surrender(battleId);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @param {object} req 
   * @param {object} res 
   */
  async autoAttack(req, res) {
    try {
      const { battleId } = req.params;
      res.status(400).json({ error: "Auto attack is handled automatically." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
