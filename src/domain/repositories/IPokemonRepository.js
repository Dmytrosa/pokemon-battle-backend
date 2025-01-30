export class IPokemonRepository {
    /**
     * @param {Object} pokemon
     * @returns {Promise<Object>}
     */
    async create(pokemon) {
      throw new Error("Метод create має бути реалізований");
    }
  
    /**
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
      throw new Error("Метод findById має бути реалізований");
    }
  
    /**
     * @param {object} filter
     * @param {object} options
     * @returns {Promise<[Object[], number]>}
     */
    async findPokemons(filter, options) {
      throw new Error("Метод findPokemons має бути реалізований");
    }
  
    /**
     * @param {Object} pokemon
     * @returns {Promise<void>}
     */
    async update(pokemon) {
      throw new Error("Метод update має бути реалізований");
    }
  }
  