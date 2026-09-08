import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { Env } from "../config/env.config";
import { signJwtToken } from "../utils/jwt";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting, refreshToken } =
      await loginService(body);

    // Set refresh token as secure HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (matches JWT_REFRESH_EXPIRES_IN by default)
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "No refresh token" });
    }

    try {
      const payload = jwt.verify(refreshToken, Env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
      const userId = payload.userId as string;

      const { token, expiresAt } = signJwtToken({ userId });

      return res.status(HTTPSTATUS.OK).json({ accessToken: token, expiresAt });
    } catch (error) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "Invalid refresh token" });
    }
  }
);
