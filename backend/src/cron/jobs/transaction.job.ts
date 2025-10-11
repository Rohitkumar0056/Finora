import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model";
import { calculateNextOccurrence } from "../../utils/helper";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    // Get all transactions that are recurring and due for processing
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    // Iterate through transactions one by one using async cursor
    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      // Start a MongoDB session for atomic transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(
          async () => {
            // 1. Create a new transaction entry for this occurrence
            await TransactionModel.create(
              [
                {
                  ...tx.toObject(),
                  _id: new mongoose.Types.ObjectId(),
                  title: `Recurring - ${tx.title}`,
                  date: tx.nextRecurringDate,
                  isRecurring: false,
                  nextRecurringDate: null,
                  recurringInterval: null,
                  lastProcessed: null,
                  createdAt: undefined,
                  updatedAt: undefined,
                },
              ],
              { session }
            );

            // 2. Update the original recurring transaction with:
            //    - The next occurrence date
            //    - Last processed timestamp
            await TransactionModel.updateOne(
              { _id: tx._id },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.log(`Failed reccurring tx: ${tx._id}`, error);
      } finally {
        await session.endSession();
      }
    }

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error: any) {
    console.error("Error occur processing transaction", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};