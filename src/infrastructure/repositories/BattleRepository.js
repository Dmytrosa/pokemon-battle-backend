import { IBattleRepository } from "../../domain/repositories/IBattleRepository.js";
import { Battle } from "../../domain/entities/Battle.js";
import { BattleModel } from "../db/BattleModel.js";

export class BattleRepository extends IBattleRepository {
  constructor() {
    super();
  }

  /**
   * @param {Battle} battle
   * @returns {Promise<Battle>}
   */
  async create(battle) {
    const playerMaxHP = battle.playerPokemon.base.HP || 50;
    const enemyMaxHP = battle.enemyPokemon.base.HP || 50;

    const doc = new BattleModel({
      userId: battle.userId,
      playerPokemon: battle.playerPokemon._id,
      enemyPokemon: battle.enemyPokemon._id,
      playerCurrentHP: playerMaxHP,
      enemyCurrentHP: enemyMaxHP,
      computerLevel: battle.computerLevel,
      playerLevel: battle.playerLevel,
      status: battle.status,
      logs: battle.logs,
    });
    const saved = await doc.save();
    const populatedBattle = await BattleModel.findById(saved._id)
      .populate('playerPokemon')
      .populate('enemyPokemon')
      .exec();

    return new Battle({
      id: populatedBattle._id.toString(),
      userId: populatedBattle.userId,
      playerPokemon: populatedBattle.playerPokemon,
      enemyPokemon: populatedBattle.enemyPokemon,
      playerCurrentHP: populatedBattle.playerCurrentHP,
      enemyCurrentHP: populatedBattle.enemyCurrentHP,
      computerLevel: populatedBattle.computerLevel,
      playerLevel: populatedBattle.playerLevel,
      status: populatedBattle.status,
      logs: populatedBattle.logs,
    });
  }

  /**
   * @param {string} id
   * @returns {Promise<Battle|null>}
   */
  async findById(id) {
    const doc = await BattleModel.findById(id)
      .populate("playerPokemon")
      .populate("enemyPokemon")
      .exec();
    if (!doc) return null;

    return new Battle({
      id: doc._id.toString(),
      userId: doc.userId,
      playerPokemon: doc.playerPokemon,
      enemyPokemon: doc.enemyPokemon,
      playerCurrentHP: doc.playerCurrentHP,
      enemyCurrentHP: doc.enemyCurrentHP,
      computerLevel: doc.computerLevel,
      playerLevel: doc.playerLevel,
      status: doc.status,
      logs: doc.logs,
    });
  }

  /**
   * @param {Battle} battle
   * @returns {Promise<void>}
   */
  async update(battle) {
    await BattleModel.findByIdAndUpdate(
      battle.id,
      {
        playerCurrentHP: battle.playerCurrentHP,
        enemyCurrentHP: battle.enemyCurrentHP,
        status: battle.status,
        logs: battle.logs,
      },
      { new: true }
    ).exec();
  }
}
