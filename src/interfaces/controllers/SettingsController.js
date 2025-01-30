import { SettingsUseCase } from "../../application/use-cases/SettingsUseCase.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

export class SettingsController {
  constructor() {
    const userRepo = new UserRepository();
    this.settingsUseCase = new SettingsUseCase(userRepo);
  }

  async getProfile(req, res) {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const profile = await this.settingsUseCase.getProfile(userId);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


  async updateProfile(req, res) {
    try {
      const userId = req.body.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const updated = await this.settingsUseCase.updateProfile(userId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
