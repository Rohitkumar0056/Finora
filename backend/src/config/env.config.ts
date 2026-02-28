import { get } from "http";
import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI"),

  JWT_SECRET: getEnv("JWT_SECRET", "secert_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secert_jwt_refresh"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),

  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "https://finora-rosy.vercel.app"),

  MAIL_HOST: getEnv("MAIL_HOST", "smtp.gmail.com"),
  MAIL_PORT: getEnv("MAIL_PORT", "587"),
  MAIL_SECURE: getEnv("MAIL_SECURE", "false"),
  MAIL_USER: getEnv("MAIL_USER"),
  MAIL_PASS: getEnv("MAIL_PASS"),
  MAIL_FROM: getEnv("MAIL_FROM"),
});

export const Env = envConfig();