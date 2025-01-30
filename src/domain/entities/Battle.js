
export class Battle {
  constructor({
    id,
    userId,
    playerPokemon,
    enemyPokemon,
    playerCurrentHP,
    enemyCurrentHP,
    computerLevel,
    playerLevel,
    status = "player_turn", // 'player_turn', 'computer_turn', 'finished'
    logs = [],
  }) {
    this.id = id;  // _id з MongoDB
    this.userId = userId;
    this.playerPokemon = playerPokemon;
    this.enemyPokemon = enemyPokemon;
    this.playerCurrentHP = playerCurrentHP;
    this.enemyCurrentHP = enemyCurrentHP;
    this.computerLevel = computerLevel;
    this.playerLevel = playerLevel;
    this.status = status;
    this.logs = logs;
  }
}
