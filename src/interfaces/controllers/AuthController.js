import { AuthUseCase } from "../../application/use-cases/AuthUseCase.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js"; // Припустимо

export class AuthController {
  constructor() {
    this.userRepo = new UserRepository();
    this.authUseCase = new AuthUseCase(this.userRepo);
  }

  async getNonce(req, res) {
    try {

      const address = req.query.address || "";
      const nonce = await this.authUseCase.getNonce(address);
      res.status(200).json({ nonce });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifySignature(req, res) {
    try {
      const { address, signature } = req.body;
      if (!address || !signature) {
        return res.status(400).json({ error: "Missing address or signature" });
      }
      const token = await this.authUseCase.verifySignature(address, signature);
      res.status(200).json({ token });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}
