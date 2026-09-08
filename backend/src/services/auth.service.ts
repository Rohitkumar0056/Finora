import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";
import { stripeClient } from "../config/stripe.config";
import { Env } from "../config/env.config";
import SubscriptionModel, {
  SubscriptionStatus,
} from "../models/subscription.model";

const TRIAL_DAYS = Number(Env.TRIAL_DAYS);

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) throw new UnauthorizedException("User already exists");

      const newUser = new UserModel({
        ...body,
      });
      await newUser.save({ session });

      const customer = await stripeClient.customers.create({
        email: newUser.email,
        name: newUser.name,
      });
      newUser.stripeCustomerId = customer.id;
      await newUser.save({ session });

      const _userId = newUser.id.toString();

      const stripeSubscription = await stripeClient.subscriptions.create({
        customer: customer.id,
        items: [{ price: Env.STRIPE_MONTHLY_PLAN_PRICE_ID }],
        trial_period_days: TRIAL_DAYS,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        metadata: {
          userId: _userId,
        },
      });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calculateNextReportDate(),
        lastSentDate: null,
      });
      await reportSetting.save({ session });

      const subscriptionDoc = new SubscriptionModel({
        userId: newUser._id,
        status: SubscriptionStatus.TRIALING,
        plan: null,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id ?? null,
        stripeCurrentPeriodStart: stripeSubscription.items.data[0]?.current_period_start
          ? new Date(stripeSubscription.items.data[0].current_period_start * 1000)
          : null,
        stripeCurrentPeriodEnd: stripeSubscription.items.data[0]?.current_period_end
          ? new Date(stripeSubscription.items.data[0].current_period_end * 1000)
          : null,
        trialStartsAt: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : new Date(),
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        trialDays: TRIAL_DAYS,
      });

      await subscriptionDoc.save({ session });

      newUser.subscriptionId = subscriptionDoc._id as mongoose.Types.ObjectId;

      await newUser.save({ session });

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
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new NotFoundException("Email/password not found");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid)
    throw new UnauthorizedException("Invalid email/password");

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  // create refresh token using refresh secret and expiry
  const { token: refreshToken } = signJwtToken(
    { userId: user.id },
    { secret: Env.JWT_REFRESH_SECRET, expiresIn: Env.JWT_REFRESH_EXPIRES_IN as any }
  );

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    refreshToken,
    reportSetting,
  };
};
