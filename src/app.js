import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./interfaces/routes/authRoutes.js";
import pokemonRoutes from "./interfaces/routes/pokemonRoutes.js";
import battleRoutes from "./interfaces/routes/battleRoutes.js";
import settingsRoutes from "./interfaces/routes/settingsRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/pokemon", pokemonRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/settings", settingsRoutes);

export default app;
