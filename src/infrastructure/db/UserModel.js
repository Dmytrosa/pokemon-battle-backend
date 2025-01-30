import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  address: { type: String, unique: true, sparse: true },
  nonce: { type: String },
  favoritePokemon: { type: String },
  language: { type: String, default: "english" },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
});

export const UserModel = mongoose.model("User", UserSchema);
