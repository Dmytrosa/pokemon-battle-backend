import { IPokemonRepository } from "../../domain/repositories/IPokemonRepository.js";
import { Pokemon } from "../../domain/entities/Pokemon.js";
import { PokemonModel } from "../db/PokemonModel.js";

export class PokemonRepository extends IPokemonRepository {
  constructor() {
    super();
  }

  /**
   * @param {number|string} dexId
   * @returns {Promise<Pokemon|null>}
   */
  async findByDexId(dexId) {
    const doc = await PokemonModel.findOne({ id: dexId }).exec();
    if (!doc) return null;
    return new Pokemon({
      id: doc.id,
      ...doc.toObject(),
    });
  }

  /**
   * @param {Pokemon} pokemon
   * @returns {Promise<Pokemon>}
   */
  async create(pokemon) {
    const doc = new PokemonModel({
      name: pokemon.name,
      type: pokemon.type,
      base: pokemon.base,
      description: pokemon.description,
      evolution: pokemon.evolution,
      image: pokemon.image,
    });
    const saved = await doc.save();
    return new Pokemon({
      id: saved.id,
      ...saved.toObject(),
    });
  }

  /**
   * @param {number|string} dexId
   * @returns {Promise<Pokemon|null>}
   */
  async findByDexIdAlternative(dexId) {
    const doc = await PokemonModel.findOne({ id: dexId }).exec();
    if (!doc) return null;
    return new Pokemon({
      id: doc.id,
      ...doc.toObject(),
    });
  }

  /**
   * @param {string} id
   * @returns {Promise<Pokemon|null>}
   */
  async findById(id) {
    const doc = await PokemonModel.findById(id).exec();
    if (!doc) return null;
    return new Pokemon({
      id: doc.id,
      ...doc.toObject(),
    });
  }

  /**
   * @param {object} filter
   * @param {object} options { page, limit, sort }
   * @returns {Promise<[Pokemon[], number]>}
   */
  async findPokemons(filter, options) {
    const { page = 1, limit = 50, sort = {} } = options || {};
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      PokemonModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      PokemonModel.countDocuments(filter),
    ]);

    const pokemons = docs.map(
      (doc) =>
        new Pokemon({
          id: doc.id,
          ...doc.toObject(),
        })
    );

    return [pokemons, total];
  }

  /**
   * @param {Pokemon} pokemon
   * @returns {Promise<void>}
   */
  async update(pokemon) {
    await PokemonModel.findOneAndUpdate(
      { id: pokemon.id },
      {
        name: pokemon.name,
        type: pokemon.type,
        base: pokemon.base,
        description: pokemon.description,
        evolution: pokemon.evolution,
        image: pokemon.image,
      },
      { new: true }
    ).exec();
  }
}
