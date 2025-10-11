import "dotenv/config";
import "./config/passport.config";
import express from "express";
import { Env } from "./config/env.config";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import reportRoutes from "./routes/report.route";
import analyticsRoutes from "./routes/analytics.route";
import { initializeCrons } from "./cron";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
    cors({
        origin: Env.FRONTEND_ORIGIN,
        credentials: true,
    })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
    await connectDatabase();

    if (Env.NODE_ENV === "development") {
        await initializeCrons();
    }

    console.log(`Server is runnning on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});