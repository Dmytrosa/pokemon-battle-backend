export class PokemonUseCase { 
  /** 
   * @param {IPokemonRepository} pokemonRepo 
   * @param {IUserRepository} userRepo 
   * @param {IUserPokemonRepository} userPokemonRepo 
   */ 
  constructor(pokemonRepo, userRepo, userPokemonRepo) { 
    this.pokemonRepo = pokemonRepo;       // For fetching Pokémons 
    this.userRepo = userRepo;             // For fetching user (skillLevel) 
    this.userPokemonRepo = userPokemonRepo; // For fetching specific Pokémon levels 
  } 

  /** 
   * Get a list of Pokémons considering: 
   *  - Language search: `searchLang` ("english", "japanese", ...) 
   *  - Name search: `search` (regex) 
   *  - Sorting (sortKey, sortDirection) 
   *  - Type (type) 
   *  - userId => userRepo.findById => determine skillLevel 
   *  - (Optional) userPokemonRepo to filter by Pokémon levels 
   */ 
  async getPokemons({ 
    searchLang = "english", 
    search, 
    page, 
    limit, 
    sortKey, 
    type, 
    sortDirection, 
    userId, 
  }) { 
    // 1) Find the user to determine skillLevel 
    const user = await this.userRepo.findById(userId); 
    if (!user) throw new Error("User not found"); 

    // Determine skillLevel based on user.wins 
    let skillLevel; 
    if (user.wins <= 3) { 
      skillLevel = 1; 
    } else if (user.wins <= 5) { 
      skillLevel = 2; 
    } else { 
      skillLevel = 3; 
    } 

    // 2) Build the base filter for search 
    const filter = {}; 

    // a) Name search in the specified language 
    if (search) { 
      const fieldPath = `name.${searchLang}`; 
      filter[fieldPath] = { $regex: search, $options: "i" }; 
    } 

    // b) Filter by type 
    if (type && type !== "All") { 
      filter.type = type; 
    } 

    // c) Filter by skillLevel 
    if (skillLevel === 1) { 
      filter["evolution.prev"] = { $size: 0 }; 
    } else if (skillLevel === 2) { 
      filter['$or'] = [ 
        { "evolution.prev": { $size: 0 } }, 
        { 'evolution.prev.0.0': 1 } // Assuming ID 1 is the base form 
      ]; 
    } 
    // skillLevel=3 has no restrictions 

    // 3) Sorting 
    const sortObj = {}; 
    if (sortKey && sortKey !== "none") { 
      const sortKeyMapping = { 
        "Attack": "base.Attack", 
        "Defense": "base.Defense", 
        "HP": "base.HP", 
        "Speed": "base.Speed", 
        "Sp. Attack": "base.Sp. Attack", 
        "Sp. Defense": "base.Sp. Defense", 
      }; 
      const dbSortKey = sortKeyMapping[sortKey] || sortKey; 
      sortObj[dbSortKey] = (sortDirection === "desc") ? -1 : 1; 
    } 

    // 4) Pagination parameters 
    page = parseInt(page || 1); 
    limit = parseInt(limit || 50); 

    // 5) Fetch Pokémons from the repository 
    const [rawPokemons, total] = await this.pokemonRepo.findPokemons(filter, { 
      page, 
      limit, 
      sort: sortObj, 
    }); 

    /** 
     * Incorporate UserPokemon levels: 
     * - Each evolution stage requires an additional 10 levels. 
     * - For example, to view a 2nd stage Pokémon, the user needs at least level 10 in the base form. 
     * - To view a 3rd stage Pokémon, the user needs at least level 20 in the base form. 
     */ 

    // 6) Fetch user's Pokémons 
    const userPokemons = await this.userPokemonRepo.findByUserId(userId); 

    // Create a map of Pokémon ID to user Pokémon level 
    const userPokemonMap = new Map(); 
    for (const up of userPokemons) { 
      // Assuming 'id' is the numeric ID of the Pokémon 
      userPokemonMap.set(up.pokemonId.id, up.level); 
    } 

    // Helper function to determine the evolution stage of a Pokémon 
    const getPokemonStage = async (pokemon, memo = {}) => { 
      if (memo[pokemon.id]) return memo[pokemon.id]; 
      if (!pokemon.evolution.prev || pokemon.evolution.prev.length === 0) { 
        memo[pokemon.id] = 1; 
        return 1; 
      } 

      // Recursively determine the stage based on previous evolutions 
      const prevStages = await Promise.all(pokemon.evolution.prev.map(async ([prevIdStr, _cond]) => { 
        const prevId = parseInt(prevIdStr, 10); 
        const prevPokemon = await this.pokemonRepo.findByDexId(prevId); // Assume a method to find by numeric ID 
        if (!prevPokemon) return 1; // Default to stage 1 if previous Pokémon not found 
        return await getPokemonStage(prevPokemon, memo); 
      })); 

      const stage = 1 + Math.max(...prevStages); 
      memo[pokemon.id] = stage; 
      return stage; 
    }; 

    // 7) Filter Pokémons based on UserPokemon levels 
    const finalPokemons = []; 
    const stageMemo = {}; // To memoize stages and avoid redundant computations 

    for (const pk of rawPokemons) { 
      // Determine the evolution stage 
      const stage = await getPokemonStage(pk, stageMemo); 
      const requiredLevel = 10 * (stage - 1); 

      // Find the base Pokémon (first in the evolution chain) 
      let basePokemonId = pk.id; 
      if (pk.evolution.prev && pk.evolution.prev.length > 0) { 
        // Traverse to the base Pokémon 
        let currentPokemon = pk; 
        while (currentPokemon.evolution.prev && currentPokemon.evolution.prev.length > 0) { 
          const [prevIdStr, _cond] = currentPokemon.evolution.prev[0]; 
          const prevId = parseInt(prevIdStr, 10); 
          currentPokemon = await this.pokemonRepo.findByDexId(prevId); 
          if (!currentPokemon) break; 
          basePokemonId = currentPokemon.id; 
        } 
      } 

      // Get the user's level for the base Pokémon 
      const userLevel = userPokemonMap.get(basePokemonId) || 0; 

      if (userLevel >= requiredLevel) { 
        finalPokemons.push(pk); 
      } 
      // Else, exclude this Pokémon 
    } 

    // 8) Return the filtered Pokémons with pagination info 
    return { 
      pokemons: rawPokemons, 
      pagination: { 
        page, 
        limit, 
        total, // Update total to reflect filtered Pokémons 
      }, 
    }; 
  } 

  /** 
   * GET /pokemon/:id 
   */ 
  async getPokemonById(id) { 
    const pokemon = await this.pokemonRepo.findById(id); 
    if (!pokemon) throw new Error("Pokemon not found"); 
    return pokemon; 
  } 

  /** 
   * (Optional) Create/update a Pokémon 
   */ 
  async createPokemon(data) { 
    // ... 
    throw new Error("Not implemented yet"); 
  } 

  // Helper method to extract level from condition string 
  extractLevelFromCondition(cond) { 
    if (cond.startsWith("Level ")) { 
      const num = parseInt(cond.replace("Level ", ""), 10); 
      return num || 0; 
    } 
    if (cond === "Trade") { 
      // For trade conditions, assume a very high level requirement 
      return Infinity; 
    } 
    return 0; 
  } 
}
