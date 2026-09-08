import { Router } from "express";
import { registerController, loginController, refreshTokenController } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/refresh-token", refreshTokenController);

export default authRoutes;