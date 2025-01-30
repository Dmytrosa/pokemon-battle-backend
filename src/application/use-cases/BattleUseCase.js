import { Battle } from "../../domain/entities/Battle.js";
import { typeEffectiveness } from "../../shared/utils/typeEffectiveness.js";

export class BattleUseCase {
  constructor(battleRepo, pokemonRepo, userRepo, userPokemonRepo) {
    this.battleRepo = battleRepo;            // IBattleRepository
    this.pokemonRepo = pokemonRepo;          // IPokemonRepository
    this.userRepo = userRepo;                // IUserRepository
    this.userPokemonRepo = userPokemonRepo;  // IUserPokemonRepository
    this.typeEffectiveness = typeEffectiveness;
  }

  /**
   * Create a new battle.
   * @param {object} params - Battle creation parameters.
   * @param {string} params.userId - User identifier.
   * @param {string} params.playerPokemonId - Player's Pokémon _id.
   * @returns {Battle} - Created and initialized battle state.
   */
  async createBattle({ userId, playerPokemonId }) {
    // 1) Check if the user exists
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    // 2) Find the player's Pokémon
    const playerPokemon = await this.pokemonRepo.findById(playerPokemonId);
    if (!playerPokemon) throw new Error("Player Pokémon not found");

    // 2a) Find/create UserPokemon => get current level
    let userPok = await this.userPokemonRepo.findByUserAndPokemon(userId, playerPokemonId);

    if (!userPok) {
      userPok = await this.userPokemonRepo.create({
        userId,
        pokemonId: playerPokemonId,
        wins: 0,
        level: 1,
      });
    }

    const playerLevel = userPok.level || 1;

    // 3) Choose computer's Pokémon
    const enemyPokemon = await this.pickComputerPokemon(playerPokemon);

    if (!enemyPokemon) {
      throw new Error("No suitable enemy found");
    }

    // 3a) Computer's Pokémon receives a level ~ playerLevel
    let computerLevel = await this.calculateEnemyLevel(playerPokemon, enemyPokemon, playerLevel);

    // 4) Who goes first? - speed
    const playerSpeed = playerPokemon.base.Speed || 1;
    const enemySpeed = enemyPokemon.base.Speed || 1;
    let status = enemySpeed > playerSpeed ? "computer_turn" : "player_turn";

    // 5) Create Battle entity with references to Pokémon and their current HP
    const battle = new Battle({
      id: null, // After saving, MongoDB will assign _id
      userId: userId,
      playerPokemon: playerPokemon, // Pokémon object
      enemyPokemon: enemyPokemon,   // Pokémon object
      playerCurrentHP: playerPokemon.base.HP || 50,
      enemyCurrentHP: enemyPokemon.base.HP || 50,
      computerLevel,
      playerLevel,
      status,
      logs: [
        `Battle started between ${playerPokemon.name.english} (lvl=${playerLevel}) and ${enemyPokemon.name.english} (lvl=${computerLevel}).`,
        status === "player_turn"
          ? `Player's ${playerPokemon.name.english} moves first!`
          : `Computer's ${enemyPokemon.name.english} moves first!`,
      ],
    });

    // Save the battle to the DB
    const createdBattle = await this.battleRepo.create(battle);

    // If the battle status is computer's turn, process it
    if (createdBattle.status === 'computer_turn') {
      await this.processComputerTurn(createdBattle);
    }

    // Return the full battle object
    return createdBattle;
  }

  /**
   * Returns the current state of the battle.
   * @param {string} battleId - Battle identifier.
   * @returns {Battle} - Current battle state with Pokémon references.
   */
  async getBattleState(battleId) {
    const battle = await this.battleRepo.findById(battleId);
    if (!battle) throw new Error("Battle not found");
    return battle;
  }

  /**
   * Handle the player's action.
   * @param {string} battleId - Battle identifier.
   * @param {string} action - Player's action (e.g., "attack", "ability", "surrender").
   * @returns {Battle} - Updated battle state with Pokémon references.
   */
  async handleAction(battleId, action) {
    const battle = await this.battleRepo.findById(battleId);

    console.log("Handling action for battle:", action);

    if (!battle) throw new Error("Battle not found");
    if (battle.status === "finished") {
      throw new Error("Battle already finished");
    }

    if (action === "attack") {
      if (battle.status !== "player_turn") {
        throw new Error("Not player turn");
      }
      this.doAttack(battle, "player");
    } else if (action === "ability") {
      if (battle.status !== "player_turn") {
        throw new Error("Not player turn for ability");
      }
      this.doAbilityAttack(battle);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    // Save the updated battle state
    await this.battleRepo.update(battle);

    // If after the action the battle status is computer's turn, process it
    if (battle.status === 'computer_turn') {
      await this.processComputerTurn(battle);
    }

    // Return the updated battle object
    const updatedBattle = await this.battleRepo.findById(battleId);
    return updatedBattle;
  }

  /**
   * Player surrenders.
   * @param {string} battleId - Battle identifier.
   * @returns {Battle} - Updated battle state with Pokémon references.
   */
  async surrender(battleId) {
    const battle = await this.battleRepo.findById(battleId);
    if (!battle) throw new Error("Battle not found");
    if (battle.status === "finished") {
      return battle;
    }
    battle.logs.push(`Player surrendered!`);
    battle.status = "finished";
    await this.battleRepo.update(battle);
    return battle;
  }

  // =========== ATTACK LOGIC =============

  /**
   * Performs an attack on behalf of the player or computer.
   * @param {Battle} battle - Current battle state.
   * @param {string} who - "player" or "computer".
   */
  doAttack(battle, who) {
    const attacker = who === "player" ? battle.playerPokemon : battle.enemyPokemon;
    const defender = who === "player" ? battle.enemyPokemon : battle.playerPokemon;

    let attackerLevel = who === "player" ? battle.playerLevel || 1 : battle.computerLevel || 1;

    const attackerPower = this.getPower(attacker.base);
    const defenderPower = this.getPower(defender.base);

    const randomFactor = Math.random().toFixed(2);
    if (+randomFactor === 0) {
      battle.logs.push(`${attacker.name.english} missed!`);
    } else {
      const damage = Math.floor(
        ((((2 * attackerLevel) / 5 + 2) * attackerPower * (attackerPower / defenderPower)) / 50 + 2) *
        +randomFactor
      );

      if (who === "player") {
        battle.enemyCurrentHP = Math.max(battle.enemyCurrentHP - damage, 0);
      } else {
        battle.playerCurrentHP = Math.max(battle.playerCurrentHP - damage, 0);
      }

      battle.logs.push(
        `${attacker.name.english} (lvl=${attackerLevel}, pwr=${attackerPower}) deals ${damage} dmg to ${defender.name.english} (rf=${randomFactor})`
      );
    }

    // Check if the Pokémon fainted
    if (who === "player" && battle.enemyCurrentHP <= 0) {
      battle.logs.push(`${defender.name.english} fainted!`);
      console.log("finished1");
      battle.status = "finished";
      // Player's victory
      this.addWinAndSyncAllEvolutions(battle.userId, battle.playerPokemon.id, battle); // Using Pokédex id
    } else if (who === "computer" && battle.playerCurrentHP <= 0) {
      battle.logs.push(`${defender.name.english} fainted!`);
      console.log("finished2");
      battle.status = "finished";
      // Add log about player's defeat
      battle.logs.push(`Your ${defender.name.english} has fainted! You lost the battle.`);
    } else {
      // Change the battle status
      battle.status = who === "player" ? "computer_turn" : "player_turn";
    }
  }

  /**
   * Performs a special attack (Ability) on behalf of the player.
   * @param {Battle} battle - Current battle state.
   */
  doAbilityAttack(battle) {
    const attacker = battle.playerPokemon;
    const defender = battle.enemyPokemon;


    const level = battle.playerLevel || 1;
    const power = 60;
    const randomFactor = Math.random();

    if (randomFactor === 0) {
      battle.logs.push(`${attacker.name.english} tried special ability but missed!`);
    } else {
      const att = attacker.base.Sp.Attack || 10;
      const def = defender.base.Sp.Defense || 10;

        const damage = Math.floor(
        ((((2 * level) / 5 + 2) * power * (att / def)) / 50 + 2) *
        +randomFactor
      );

      // Decrease HP
      battle.enemyCurrentHP = Math.max(battle.enemyCurrentHP - damage, 0);

      const abilityName = attacker.profile.ability.find(ab => ab[1] === "true")?.[0] || attacker.profile.ability[0][0];

      battle.logs.push(
        `${attacker.name.english} uses SPECIAL ABILITY (${abilityName})! Deals ${damage} dmg to ${defender.name.english}`
      );
    }

    // After using the ability
    attacker.canUseAbility = false;

    if (battle.enemyCurrentHP <= 0) {
      battle.logs.push(`${defender.name.english} fainted!`);
      battle.status = "finished";
      // Player's victory
      this.addWinAndSyncAllEvolutions(battle.userId, battle.playerPokemon.id, battle); // Using Pokédex id
    } else {
      battle.status = "computer_turn";
    }
  }

  // ========== LEVEL UP ===========
  
  /**
   * Increases the level of all Pokémon in the evolutionary line after a victory.
   * @param {string} userId - User ID.
   * @param {number|string} currentDexId - Pokédex ID of the Pokémon that won the battle.
   * @param {Battle} battle - Current battle state.
   */
  async addWinAndSyncAllEvolutions(userId, currentDexId, battle) {
    const familyIds = await this.collectEntireFamily(currentDexId);

    for (const pId of familyIds) {
      let userPok = await this.userPokemonRepo.findByUserAndPokemon(userId, pId);
      if (!userPok) {
        userPok = await this.userPokemonRepo.create({
          userId,
          pokemonId: pId, // Pokédex id
          wins: 0,
          level: 1,
        });
      }
      userPok.wins += 1;
      userPok.level = userPok.wins;
      await this.userPokemonRepo.update(userPok);

      // Get the Pokémon's name for logs
      const pokemon = await this.pokemonRepo.findByDexId(pId);
      const pokemonName = pokemon ? pokemon.name.english : `#${pId}`;

      battle.logs.push(
        `Your Pokémon ${pokemonName} is now level ${userPok.level} (wins=${userPok.wins})`
      );
    }
  }

  /**
   * Collects the entire evolutionary line of the Pokémon.
   * @param {number|string} startDexId - Pokédex ID of the starting Pokémon.
   * @returns {Promise<(number|string)[]>} - Array of Pokédex IDs of all Pokémon in the evolutionary line.
   */
  async collectEntireFamily(startDexId) {
    const rootDexId = await this.findRootEvolution(startDexId);
    const chainDown = await this.collectEvolutionChainDown(rootDexId);
    return chainDown;
  }

  /**
   * Finds the "root" (first stage) of the Pokémon's evolution.
   * @param {number|string} dexId - Pokédex ID of the Pokémon.
   * @returns {Promise<number|string>} - Pokédex ID of the root Pokémon.
   */
  async findRootEvolution(dexId) {
    let currentDexId = dexId;
    while (true) {
      const poke = await this.pokemonRepo.findByDexId(currentDexId);
      if (!poke || !poke.evolution || !poke.evolution.prev || poke.evolution.prev.length === 0) {
        return currentDexId;
      }
      // Assume .prev = [["<id>", "condition"]]
      const prevId = poke.evolution.prev[0][0];
      if (!prevId) return currentDexId;
      currentDexId = prevId;
    }
  }

  /**
   * Recursively collects all "next" evolutions from the root Pokémon.
   * @param {number|string} rootDexId - Pokédex ID of the root Pokémon.
   * @returns {Promise<(number|string)[]>} - Array of Pokédex IDs of all Pokémon in the evolutionary line.
   */
  async collectEvolutionChainDown(rootDexId) {
    const poke = await this.pokemonRepo.findByDexId(rootDexId);
    if (!poke) return [];

    let result = [rootDexId];

    if (poke.evolution && poke.evolution.next) {
      for (const [nextDexIdStr] of poke.evolution.next) {
        const nextDexId = nextDexIdStr; // Pokédex ID
        if (!nextDexId) continue;
        const sub = await this.collectEvolutionChainDown(nextDexId);
        result = result.concat(sub);
      }
    }
    return result;
  }

  /**
   * Calculates the level of the computer's Pokémon based on the player's and enemy's stats.
   * @param {object} playerPokemon - Player's Pokémon.
   * @param {object} enemyPokemon - Computer's Pokémon.
   * @param {number} playerLevel - Player's Pokémon level.
   * @returns {number} - Calculated level of the computer's Pokémon.
   */
  async calculateEnemyLevel(playerPokemon, enemyPokemon, playerLevel) {
    // Extract player's base stats
    const pAttack = playerPokemon.base.Attack || 0;
    const pSpAttack = playerPokemon.base["Sp. Attack"] || 0;
    const pDefense = playerPokemon.base.Defense || 0;
    const pSpDefense = playerPokemon.base["Sp. Defense"] || 0;
    const pHP = playerPokemon.base.HP || 0;
    const pSpeed = playerPokemon.base.Speed || 0;

    // Total player's stats
    const pTotalStats = pAttack + pSpAttack + pDefense + pSpDefense + pHP + pSpeed;

    // Similarly for the enemy
    const eAttack = enemyPokemon.base.Attack || 0;
    const eSpAttack = enemyPokemon.base["Sp. Attack"] || 0;
    const eDefense = enemyPokemon.base.Defense || 0;
    const eSpDefense = enemyPokemon.base["Sp. Defense"] || 0;
    const eHP = enemyPokemon.base.HP || 0;
    const eSpeed = enemyPokemon.base.Speed || 0;

    // Total enemy's stats
    const eTotalStats = eAttack + eSpAttack + eDefense + eSpDefense + eHP + eSpeed;

    // In case eTotalStats = 0 (theoretically), to avoid division by 0
    if (eTotalStats === 0) {
      return 1;
    }

    /*
      Idea: we want eTotalStats * enemyLevel to be somewhat less than pTotalStats * playerLevel.
      To make it "a bit" less, we can introduce a multiplier (e.g., 0.9),
      so the enemy has ~10% lower total capabilities.
    */
    let enemyLevel = Math.floor((pTotalStats * playerLevel * 0.9) / eTotalStats);

    // Ensure that the level is not lower than 1.
    if (enemyLevel < 1) {
      enemyLevel = 1;
    }

    return enemyLevel;
  }

  /**
   * Returns the average value from (HP, Attack, Defense, "Sp. Attack", "Sp. Defense", Speed).
   * @param {object} base - Pokémon's base stats.
   * @returns {number} - Average value of the base stats.
   */
  getPower(base) {
    const keys = ["HP", "Attack", "Defense", "Sp. Attack", "Sp. Defense", "Speed"];
    let sum = 0, count = 0;
    for (const k of keys) {
      if (base[k] !== undefined) {
        sum += base[k];
        count++;
      }
    }
    if (count === 0) return 50;
    return Math.floor(sum / count);
  }

  /**
   * Selects a computer Pokémon that is effective against the player's types.
   * If none found, selects a random Pokémon from the database.
   * @param {object} playerPokemon - Player's Pokémon.
   * @returns {object|null} - Selected computer Pokémon or null.
   */
  async pickComputerPokemon(playerPokemon) {
    // Collect all types effective against the player's types
    const playerTypes = playerPokemon.type; // e.g., ["Grass","Poison"]
    const allCandidateTypes = new Set();

    for (const typeObj of this.typeEffectiveness) {
      const compType = typeObj.english;
      let isEffective = false;
      for (const pt of playerTypes) {
        if (typeObj.effective.includes(pt)) {
          isEffective = true;
          break;
        }
      }
      if (isEffective) {
        allCandidateTypes.add(compType);
      }
    }

    // If empty => pick random
    if (allCandidateTypes.size === 0) {
      return this.pickRandomPokemonFromDB();
    }

    // Otherwise, take a random type from candidates
    const candidateTypesArray = Array.from(allCandidateTypes);
    const chosenType = candidateTypesArray[Math.floor(Math.random() * candidateTypesArray.length)];

    // Add a filter for evolution level
    const filter = { type: chosenType };
    if (playerPokemon.playerLevel === 1) {
      filter["evolution.prev"] = { $size: 0 }; // Only first evolution level
    } else if (playerPokemon.playerLevel === 2) {
      // Assume that for level two, a Pokémon with Pokédex id present in typeEffectiveness is needed
      const effectiveDexIds = this.typeEffectiveness.map(te => te.id);
      filter['$or'] = [
        { "evolution.prev": { $size: 0 } }, // First level
        { "evolution.prev.0.0": { $in: effectiveDexIds } } // Second level (Pokédex ID)
      ];
    }
    // For playerLevel >=3 there are no restrictions

    // Search for Pokémon of this type considering the filter
    const [poks, total] = await this.pokemonRepo.findPokemons(
      filter,
      { page: 1, limit: 50, sort: {} }
    );
    if (poks.length === 0) {
      return this.pickRandomPokemonFromDB();
    }

    // Function to check if all values in base are non-zero
    const isValidPokemon = (pokemon) => {
      const baseStats = pokemon.base;
      return Object.values(baseStats).every(value => value !== 0);
    };

    // Select a Pokémon until finding one with all non-zero base stats
    let selectedPokemon;
    let attempts = 0;
    const maxAttempts = poks.length; // Maximum number of attempts

    do {
      const randomIndex = Math.floor(Math.random() * poks.length);
      selectedPokemon = poks[randomIndex];
      attempts++;
    } while (!isValidPokemon(selectedPokemon) && attempts < maxAttempts);

    // If unable to find a suitable Pokémon, return a random one
    if (!isValidPokemon(selectedPokemon)) {
      return this.pickRandomPokemonFromDB();
    }

    return selectedPokemon;
  }

  /**
   * Backup method — picks a random Pokémon from the database
   * @returns {object|null} - Random Pokémon or null.
   */
  async pickRandomPokemonFromDB() {
    const [somePoks, total] = await this.pokemonRepo.findPokemons({}, { page: 1, limit: 200 });
    if (somePoks.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * somePoks.length);
    return somePoks[randomIndex];
  }

  /**
   * Processes the computer's turn if the battle status is "computer_turn".
   * @param {Battle} battle - Current battle state.
   * @returns {Promise<Battle>} - Updated battle state.
   */
  async processComputerTurn(battle) {
    if (battle.status !== 'computer_turn') return battle;

    // Add log about the start of the computer's turn
    battle.logs.push(`Computer's ${battle.enemyPokemon.name.english} is making a move!`);

    // Perform computer's attack
    this.doAttack(battle, 'computer');

    // If the battle is not finished, change the status to "player_turn"
    if (battle.status !== 'finished') {
      battle.status = 'player_turn';
      battle.logs.push(`It's now the player's turn.`);
    }

    // Save the updated battle state
    await this.battleRepo.update(battle);

    return battle;
  }

  // ========== LEVEL UP ===========
  
  /**
   * Increases the level of all Pokémon in the evolutionary line after a victory.
   * @param {string} userId - User ID.
   * @param {number|string} currentDexId - Pokédex ID of the Pokémon that won the battle.
   * @param {Battle} battle - Current battle state.
   */
  async addWinAndSyncAllEvolutions(userId, currentDexId, battle) {
    const familyIds = await this.collectEntireFamily(currentDexId);
    
    for (const pId of familyIds) {
      let poc = await this.pokemonRepo.findByDexId(pId)
      console.log("=========================",poc)
      let userPok = await this.userPokemonRepo.findByUserAndPokemon(userId, poc._id);
      if (!userPok) {
        userPok = await this.userPokemonRepo.create({
          userId,
          pokemonId: poc._id,
          wins: 0,
          level: 1,
        });
      }
      userPok.wins += 1;
      userPok.level = userPok.wins;
      await this.userPokemonRepo.update(userPok);

      // Get the Pokémon's name for logs
      const pokemonName = poc ? poc.name.english : `#${pId}`;

      battle.logs.push(
        `Your Pokémon ${pokemonName} is now level ${userPok.level} (wins=${userPok.wins})`
      );
    }
  }

  /**
   * Collects the entire evolutionary line of the Pokémon.
   * @param {number|string} startDexId - Pokédex ID of the starting Pokémon.
   * @returns {Promise<(number|string)[]>} - Array of Pokédex IDs of all Pokémon in the evolutionary line.
   */
  async collectEntireFamily(startDexId) {
    const rootDexId = await this.findRootEvolution(startDexId);
    const chainDown = await this.collectEvolutionChainDown(rootDexId);
    return chainDown;
  }

  /**
   * Finds the "root" (first stage) of the Pokémon's evolution.
   * @param {number|string} dexId - Pokédex ID of the Pokémon.
   * @returns {Promise<number|string>} - Pokédex ID of the root Pokémon.
   */
  async findRootEvolution(dexId) {
    let currentDexId = dexId;
    while (true) {
      const poke = await this.pokemonRepo.findByDexId(currentDexId);
      if (!poke || !poke.evolution || !poke.evolution.prev || poke.evolution.prev.length === 0) {
        return currentDexId;
      }
      // Assume .prev = [["<id>", "condition"]]
      const prevId = poke.evolution.prev[0][0];
      if (!prevId) return currentDexId;
      currentDexId = prevId;
    }
  }

  /**
   * Recursively collects all "next" evolutions from the root Pokémon.
   * @param {number|string} rootDexId - Pokédex ID of the root Pokémon.
   * @returns {Promise<(number|string)[]>} - Array of Pokédex IDs of all Pokémon in the evolutionary line.
   */
  async collectEvolutionChainDown(rootDexId) {
    const poke = await this.pokemonRepo.findByDexId(rootDexId);
    if (!poke) return [];

    let result = [rootDexId];

    if (poke.evolution && poke.evolution.next) {
      for (const [nextDexIdStr] of poke.evolution.next) {
        const nextDexId = nextDexIdStr; // Pokédex ID
        if (!nextDexId) continue;
        const sub = await this.collectEvolutionChainDown(nextDexId);
        result = result.concat(sub);
      }
    }
    return result;
  }
}
