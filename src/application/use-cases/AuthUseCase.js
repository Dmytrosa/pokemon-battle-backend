import jwt from "jsonwebtoken";
import Web3 from "web3";
const web3 = new Web3();

export class AuthUseCase {
  constructor(userRepo) {
    this.userRepo = userRepo;
    this.JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET";
  }

  /**
   * Generates or retrieves a nonce (stores it in the User).
   */
  async getNonce(address) {
    let user = await this.userRepo.findByAddress(address);
    if (!user) {
      // If the user does not exist, create a new one
      user = await this.userRepo.create({
        username: `User-${address.slice(0, 6)}`,
        address,
        nonce: null,
        favoritePokemon: "Pikachu",
        language: "english",
        wins: 0,
        losses: 0
      });
    }
    // Generate a random nonce
    const nonce = Math.random().toString(16).slice(2);
    user.nonce = nonce;
    await this.userRepo.update(user);
    return nonce;
  }

  /**
   * Verifies the signature; if valid, issues a JWT.
   */
  async verifySignature(address, signature) {
    // 1) Find the user by address
    const user = await this.userRepo.findByAddress(address);
    if (!user) throw new Error("User not found");

    // 2) Verify that the signature matches the nonce
    const nonce = user.nonce;
    const message = web3.utils.utf8ToHex(nonce);

    // Add a prefix to the nonce
    const recoveredAddress = web3.eth.accounts.recover(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Signature invalid");
    }

    // 3) Generate a token (JWT)
    const payload = { userId: user.id, address: user.address };
    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Reset the nonce
    user.nonce = null;
    await this.userRepo.update(user);
    user.token = token;

    return user;
  }
}
