import mongoose from "mongoose";

const UserPokemonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pokemonId: { type: mongoose.Schema.Types.ObjectId, red: "Pokemon", required: true }, 
  wins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
});

UserPokemonSchema.index({ userId: 1, pokemonId: 1 }, { unique: true });

export const UserPokemonModel = mongoose.model("UserPokemon", UserPokemonSchema);
