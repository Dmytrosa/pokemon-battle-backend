export class User {
  constructor({
    id,
    username,
    address,
    nonce,
    favoritePokemon,
    language,
    wins,
    losses,
  }) {
    this.id = id;
    this.username = username;
    this.address = address;
    this.nonce = nonce; // for Metamask
    this.favoritePokemon = favoritePokemon;
    this.language = language || "english";
    this.wins = wins || 0;
    this.losses = losses || 0;
  }
}
