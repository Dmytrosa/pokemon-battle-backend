import { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { User } from "../../domain/entities/User.js";
import { UserModel } from "../db/UserModel.js";

export class UserRepository extends IUserRepository {
  async create(userEntity) {
    const doc = new UserModel({
      username: userEntity.username,
      address: userEntity.address,
      nonce: userEntity.nonce,
      favoritePokemon: userEntity.favoritePokemon,
      language: userEntity.language,
      wins: userEntity.wins,
      losses: userEntity.losses,
    });
    const saved = await doc.save();
    return new User({
      id: saved._id.toString(),
      username: saved.username,
      address: saved.address,
      nonce: saved.nonce,
      favoritePokemon: saved.favoritePokemon,
      language: saved.language,
      wins: saved.wins,
      losses: saved.losses,
    });
  }

  async findById(id) {
    const doc = await UserModel.findById(id).exec();

    if (!doc) return null;
    return new User({
      id: doc._id.toString(),
      username: doc.username,
      address: doc.address,
      nonce: doc.nonce,
      favoritePokemon: doc.favoritePokemon,
      language: doc.language,
      wins: doc.wins,
      losses: doc.losses,
    });
  }

  async findByAddress(address) {
    const doc = await UserModel.findOne({ address }).exec();
    if (!doc) return null;
    return new User({
      id: doc._id.toString(),
      username: doc.username,
      address: doc.address,
      nonce: doc.nonce,
      favoritePokemon: doc.favoritePokemon,
      language: doc.language,
      wins: doc.wins,
      losses: doc.losses,
    });
  }

  async update(userEntity) {
    await UserModel.findByIdAndUpdate(
      userEntity.id,
      {
        username: userEntity.username,
        address: userEntity.address,
        nonce: userEntity.nonce,
        favoritePokemon: userEntity.favoritePokemon,
        language: userEntity.language,
        wins: userEntity.wins,
        losses: userEntity.losses,
      },
      { new: true }
    );
  }
}
