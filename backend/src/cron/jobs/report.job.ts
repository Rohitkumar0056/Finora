import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import ReportSettingModel from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.model";
import mongoose from "mongoose";
import { generateReportService } from "../../services/report.service";
import ReportModel, { ReportStatusEnum } from "../../models/report.model";
import { calculateNextReportDate } from "../../utils/helper";
import { sendReportEmail } from "../../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  // Example: If today is July 1 → generate report for June 1 – 30 
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    // Find all enabled report settings that are due
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;

      if (!user) {
        continue;
      }

      const session = await mongoose.startSession();

      try {
        // 1. Generate the actual report for last month
        const report = await generateReportService(user.id, from, to);

        // 2. Try sending the report via email
        let emailSent = false;
        if (report) {
          try {
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency!,
            });
            emailSent = true;
          } catch (error) {
            console.log(`Email failed for ${user.id}`);
          }
        }

        // 3. Save results inside a DB transaction  
        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              // Case: Report was generated and email sent successfully
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              // Case: Report missing or email failed
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMMM d")}-${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            // Perform bulk updates to reports + settings
            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error) {
        console.log(`Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);
    return {
      success: false,
      error: "Report process failed",
    };
  }
};