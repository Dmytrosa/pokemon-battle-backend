import { PokemonUseCase } from "../../application/use-cases/PokemonUseCase.js";
import { PokemonRepository } from "../../infrastructure/repositories/PokemonRepository.js";
import { UserPokemonRepository } from "../../infrastructure/repositories/UserPokemonRepository.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

export class PokemonController {
  constructor() {
    this.pokemonRepo = new PokemonRepository();
    this.userRepo = new UserRepository();
    this.userPokemonRepo = new UserPokemonRepository();

    this.pokemonUseCase = new PokemonUseCase(this.pokemonRepo, this.userRepo, this.userPokemonRepo);
  }

  async getPokemons(req, res) {
    try {
      const { searchLang, search, page, limit, sortKey, type, sortDirection } = req.query;
      const userId = req.body.userId

      const result = await this.pokemonUseCase.getPokemons({
        search,
        page,
        limit,
        sortKey,
        type,
        sortDirection,
        searchLang,
        userId
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPokemonById(req, res) {
    try {
      const { id } = req.params;
      const pokemon = await this.pokemonUseCase.getPokemonById(id);
      res.status(200).json(pokemon);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}
