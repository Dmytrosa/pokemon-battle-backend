import { UserPokemon } from "../../domain/entities/UserPokemon.js";
import { IUserPokemonRepository } from "../../domain/repositories/IUserPokemonRepository.js";
import { UserPokemonModel } from "../db/UserPokemonModel.js";

export class UserPokemonRepository extends IUserPokemonRepository {

  async create(userPokemonEntity) {

    const doc = new UserPokemonModel({
      userId: userPokemonEntity.userId,
      pokemonId: userPokemonEntity.pokemonId,
      wins: userPokemonEntity.wins,
      level: userPokemonEntity.level,
    });


    const saved = await doc.save();
    return new UserPokemon({
      id: saved._id,
      userId: saved.userId,
      pokemonId: saved.pokemonId,
      wins: saved.wins,
      level: saved.level,
    });
  }

  async findByUserAndPokemon(userId, pokemonId) {

    const doc = await UserPokemonModel.findOne({ userId, pokemonId }).exec();

    if (!doc) return null;
    return new UserPokemon({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      pokemonId: doc.pokemonId,
      wins: doc.wins,
      level: doc.level,
    });
  }

  async findByUserId(userId) {
    const docs = await UserPokemonModel.find({ userId }).exec();
    return docs.map(
      (doc) =>
        new UserPokemon({
          id: doc._id.toString(),
          userId: doc.userId.toString(),
          pokemonId: doc.pokemonId,
          wins: doc.wins,
          level: doc.level,
        })
    );
  }

  async update(userPokemonEntity) {
    await UserPokemonModel.findByIdAndUpdate(userPokemonEntity.id, {
      wins: userPokemonEntity.wins,
      level: userPokemonEntity.level,
    });
  }

  async upsert(userPokemonEntity) {
    const { userId, pokemonId } = userPokemonEntity;
    const doc = await UserPokemonModel.findOneAndUpdate(
      { userId, pokemonId },
      {
        wins: userPokemonEntity.wins,
        level: userPokemonEntity.level,
      },
      { upsert: true, new: true }
    );
    return new UserPokemon({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      pokemonId: doc.pokemonId,
      wins: doc.wins,
      level: doc.level,
    });
  }
}
