export class UserPokemon {
    constructor({
      id,        // _id з Mongo
      userId,
      pokemonId,
      wins,      // int
      level,     // int
    }) {
      this.id = id;
      this.userId = userId;
      this.pokemonId = pokemonId;
      this.wins = wins || 0;
      this.level = level || 1;
    }
  }
  