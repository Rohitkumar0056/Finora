import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    // Transactions job at 12:00 AM IST
    scheduleJob("Transactions", "30 18 * * *", processRecurringTransactions),

    // Reports job at 1:00 AM IST
    scheduleJob("Reports", "30 19 1 * *", processReportJob),
  ];
};