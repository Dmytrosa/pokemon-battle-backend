import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  playerPokemon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pokemon',
    required: true,
  },
  enemyPokemon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pokemon',
    required: true,
  },
  playerCurrentHP: { type: Number, required: true },
  enemyCurrentHP: { type: Number, required: true },
  computerLevel: { type: Number, required: true },
  playerLevel: { type: Number, required: true },
  status: { type: String, enum: ['player_turn', 'computer_turn', 'finished'], default: "player_turn" },
  logs: { type: [String], default: [] },
}, { timestamps: true });

export const BattleModel = mongoose.model("Battle", BattleSchema);
