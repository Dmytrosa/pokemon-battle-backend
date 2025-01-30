export class IUserPokemonRepository {
    /**
     * @param {Object} userPokemon
     * @returns {Promise<Object>}
     */
    async create(userPokemon) {
      throw new Error("Метод create має бути реалізований");
    }
  
    /**
     * @param {string} userId
     * @param {string} pokemonId
     * @returns {Promise<Object|null>}
     */
    async findByUserAndPokemon(userId, pokemonId) {
      throw new Error("Метод findByUserAndPokemon має бути реалізований");
    }
  
    /**
     * @param {string} userId
     * @returns {Promise<Object[]>}
     */
    async findByUserId(userId) {
      throw new Error("Метод findByUserId має бути реалізований");
    }
  
    /**
     * @param {Object} userPokemon
     * @returns {Promise<void>}
     */
    async update(userPokemon) {
      throw new Error("Метод update має бути реалізований");
    }
  
    /**
     * @param {Object} userPokemon
     * @returns {Promise<Object>}
     */
    async upsert(userPokemon) {
      throw new Error("Метод upsert має бути реалізований");
    }
  }
  