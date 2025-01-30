export class IUserRepository {
    /**
     * @param {Object} userEntity
     * @returns {Promise<Object>}
     */
    async create(userEntity) {
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
     * @param {string} address
     * @returns {Promise<Object|null>}
     */
    async findByAddress(address) {
      throw new Error("Метод findByAddress має бути реалізований");
    }
  
    /**
     * @param {Object} userEntity
     * @returns {Promise<void>}
     */
    async update(userEntity) {
      throw new Error("Метод update має бути реалізований");
    }
  }
  