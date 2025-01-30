import mongoose from "mongoose";

// 1) nameSchema 
const NameSchema = new mongoose.Schema({
  english: { type: String, required: true },
  japanese: { type: String },
  chinese: { type: String },
  french: { type: String },
}, { _id: false });

// 2) baseSchema
const BaseSchema = new mongoose.Schema({
  HP: { type: Number, required: true },
  Attack: { type: Number, required: true },
  Defense: { type: Number, required: true },
  "Sp. Attack": { type: Number, required: false },
  "Sp. Defense": { type: Number, required: false },
  Speed: { type: Number, required: true },
}, { _id: false });

// 3) evolutionSchema
const EvolutionSchema = new mongoose.Schema({
  prev: {
    type: [
      {
        type: [String],
        default: [],
      },
    ],
    default: [],
  },
  next: {
    type: [
      {
        type: [String], 
        default: [],
      },
    ],
    default: [],
  },
}, { _id: false });

// 4) profileSchema
const ProfileSchema = new mongoose.Schema({
  height: { type: String },
  weight: { type: String },
  egg: [{ type: String }],
  ability: {
    type: [[String]],
    default: [],
  },
  gender: { type: String },
}, { _id: false });

// 5) imageSchema
const ImageSchema = new mongoose.Schema({
  sprite: { type: String },
  thumbnail: { type: String },
  hires: { type: String },
}, { _id: false });

/**
 * PokemonSchema
 *  - id: (number) - pokedex ID, unique
 *  - name: NameSchema
 *  - type: [string]
 *  - base: BaseSchema
 *  - species, description
 *  - evolution: EvolutionSchema
 *  - profile: ProfileSchema
 *  - image: ImageSchema
 */
export const PokemonSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: NameSchema, required: true },
  type: [{ type: String, required: true }],
  base: { type: BaseSchema, required: true },

  species: { type: String },
  description: { type: String },

  evolution: { type: EvolutionSchema, default: {} },
  profile: { type: ProfileSchema, default: {} },
  image: { type: ImageSchema, default: {} },
});

PokemonSchema.index({
  "name.english": "text",
  "name.japanese": "text",
  "name.chinese": "text",
  "name.french": "text",
}, {
  name: "NameTextIndex"
});

PokemonSchema.index({ type: 1 });
PokemonSchema.index({ "base.Attack": 1 });
PokemonSchema.index({ "base.Defense": 1 });
PokemonSchema.index({ "base.HP": 1 });
PokemonSchema.index({ "base.Speed": 1 });

export const PokemonModel = mongoose.model("Pokemon", PokemonSchema);
