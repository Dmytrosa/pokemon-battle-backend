export class SettingsUseCase {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async getProfile(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    return {
      id: user.id,
      username: user.username,
      address: user.address,
      favoritePokemon: user.favoritePokemon,
      language: user.language,
      wins: user.wins,
      losses: user.losses,
    };
  }

  async updateProfile(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    if (data.username) user.username = data.username;
    if (data.favoritePokemon) user.favoritePokemon = data.favoritePokemon;
    if (data.language) user.language = data.language;

    await this.userRepo.update(user);

    return {
      message: "Profile updated",
      user: user,
    };
  }
}
