export class IBattleRepository {
    /**
     * @param {Object} battle
     * @returns {Promise<Object>}
     */
    async create(battle) {
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
     * @param {Object} battle
     * @returns {Promise<void>}
     */
    async update(battle) {
      throw new Error("Метод update має бути реалізований");
    }
  }
  