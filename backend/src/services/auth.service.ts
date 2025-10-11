import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";

export const registerService = async (body: RegisterSchemaType) => {
    const { email } = body;

    // Start a database session
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Check if user already exists
            const existingUser = await UserModel.findOne({ email }).session(session);
            if(existingUser) {
                throw new UnauthorizedException("User already exists");
            }

            // Create a new user document
            const newUser = new UserModel({
                ...body,
            });

            // Save new user in the database
            await newUser.save({ session });

            // Create default report setting for the new user
            const reportSetting = new ReportSettingModel({
                userId: newUser._id,
                frequency: ReportFrequencyEnum.MONTHLY,
                isEnabled: true,
                lastSentDate: null,
                nextReportDate: calculateNextReportDate(),
            });
            await reportSetting.save({ session });

            return { user: newUser.omitPassword() };
        });
    } catch (error) {
        throw error;
    } finally {
        await session.endSession();
    }
};

export const loginService = async (body: LoginSchemaType) => {
    const { email, password } = body;
    
    const user = await UserModel.findOne({ email }); 
    if(!user) {
        throw new NotFoundException("Email/password not found");
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) {
        throw new UnauthorizedException("Invalid email/password");
    }

    const { token, expiresAt } = signJwtToken({ userId: user.id });

    // Fetch user's report settings
    const reportSetting = await ReportSettingModel.findOne({ 
        userId: user.id 
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
    ).lean();

    return {
        user: user.omitPassword(),
        accessToken: token,
        expiresAt,
        reportSetting,
    };
};