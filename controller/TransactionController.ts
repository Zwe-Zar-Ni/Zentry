import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import dayjs from "dayjs";
import { and, eq, sql } from "drizzle-orm";
import BaseController from "./ResponseController";

export default class TransactionController extends BaseController {
  static async index(
    selectedMonth: string = dayjs().format("DD-MM-YYYY"),
    userId: number = 1
  ) {
    try {
      let date = selectedMonth.split("-").map(Number);
      const month = date[1].toString().padStart(2, "0");
      const allTransactions: any =
        await DatabaseService.db.query.transactions.findMany({
          with: {
            category: true,
            user: true
          },
          where: (transactions: any, operators: any) =>
            operators.and(
              operators.eq(transactions.user_id, userId),
              operators.sql`strftime('%m-%Y', ${
                transactions.date
              }) = ${`${month}-${date[2]}`}`
            ),
          orderBy: (
            transactions: schema.Transaction,
            { desc }: { desc: any }
          ) => [desc(transactions.date)]
        });

      let monthlyIncome = 0;
      let monthlyExpense = 0;

      const groupedByDate = allTransactions.reduce(
        (acc: any, transaction: any) => {
          if (transaction.type === "expense") {
            monthlyExpense += transaction.amount;
          } else {
            monthlyIncome += transaction.amount;
          }
          const dateKey = new Date(transaction.date)
            .toISOString()
            .split("T")[0];

          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey,
              transactions: [],
              totalAmount: 0,
              count: 0
            };
          }

          acc[dateKey].transactions.push(transaction);
          acc[dateKey].totalAmount +=
            transaction.type === "expense"
              ? -1 * transaction.amount
              : transaction.amount;
          acc[dateKey].count += 1;

          return acc;
        },
        {}
      );

      // Convert to array sorted by date
      const result = Object.values(groupedByDate).sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return this.success({
        monthlyIncome,
        monthlyExpense,
        data: result
      });
    } catch (err: any) {
      console.log(err);
      return this.error("Error Fetching transactions.");
    }
  }
  static async show(id: number) {
    try {
      const transaction = await DatabaseService.db.query.transactions.findFirst(
        {
          where: eq(schema.transactions.id, id)
        }
      );
      return this.success(transaction);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Fetching transactions.");
    }
  }
  static async store(transaction: schema.Transaction) {
    try {
      if (
        !transaction.user_id ||
        !transaction.category_id ||
        !transaction.amount ||
        !transaction.type ||
        !transaction.date
      ) {
        return this.error("Transaction is missing required fields.");
      }
      let obj: schema.Transaction = {
        ...transaction
      };
      delete obj.id;
      await DatabaseService.db.insert(schema.transactions).values(obj);
      return this.success(transaction);
    } catch (err: any) {
      console.log(err);
      return this.error("Error storing transaction.");
    }
  }
  static async update(transaction: schema.Transaction) {
    try {
      if (
        !transaction.user_id ||
        !transaction.category_id ||
        !transaction.amount ||
        !transaction.type ||
        !transaction.date ||
        !transaction.time
      ) {
        return this.error("Transaction is missing required fields.");
      }
      let obj: {
        category?: schema.Category;
        user?: schema.User;
        date: string;
        id?: number;
        time: string | null;
        note: string | null;
        user_id: number;
        type: string;
        category_id: number | null;
        amount: number;
      } = {
        ...transaction
      };
      delete obj.id;
      await DatabaseService.db
        .update(schema.transactions)
        .set(obj)
        .where(eq(schema.transactions.id, transaction.id));
      return this.success(transaction);
    } catch (err: any) {
      console.log(err);
      return this.error("Error updating transaction.");
    }
  }
  static async destroy(id: number) {
    try {
      await DatabaseService.db
        .delete(schema.transactions)
        .where(eq(schema.transactions.id, id));
      return this.success(id);
    } catch (err: any) {
      return this.error("Error deleting transaction.");
    }
  }
  static async fetchCategoryData(
    categoryType: "expense" | "income" = "expense",
    month: string = dayjs().format("DD-MM-YYYY"),
    userId: number = 1
  ) {
    try {
      const dateParts = month.split("-").map(Number);
      const monthStr = dateParts[1].toString().padStart(2, "0");
      const year = dateParts[2];

      const result = await DatabaseService.db
        .select({
          id: schema.categories.id,
          name: schema.categories.name,
          icon: schema.categories.icon,
          total: sql<number>`sum(${schema.transactions.amount})`.mapWith(Number)
        })
        .from(schema.transactions)
        .leftJoin(
          schema.categories,
          eq(schema.transactions.category_id, schema.categories.id)
        )
        .where(
          and(
            eq(schema.transactions.type, categoryType),
            eq(schema.categories.type, categoryType),
            sql`strftime('%m-%Y', ${
              schema.transactions.date
            }) = ${`${monthStr}-${year}`}`,
            eq(schema.transactions.user_id, userId)
          )
        )
        .groupBy(schema.categories.id);

      return this.success(result);
    } catch (error) {
      console.error("Error fetching category data:", error);
      return this.error("Error fetching category data.");
    }
  }
  static async fetchByCategory(
    categoryId: number,
    selectedMonth: string = dayjs().format("DD-MM-YYYY"),
    userId: number = 1
  ) {
    try {
      let date = selectedMonth.split("-").map(Number);
      const month = date[1].toString().padStart(2, "0");
      const allTransactions: any =
        await DatabaseService.db.query.transactions.findMany({
          with: {
            category: true,
            user: true
          },
          where: (transactions: any, operators: any) =>
            operators.and(
              operators.eq(transactions.user_id, userId),
              operators.eq(transactions.category_id, categoryId),
              operators.sql`strftime('%m-%Y', ${
                transactions.date
              }) = ${`${month}-${date[2]}`}`
            ),
          orderBy: (
            transactions: schema.Transaction,
            { desc }: { desc: any }
          ) => [desc(transactions.date)]
        });
      return this.success(allTransactions);
    } catch (error) {
      console.error("Error fetching category data:", error);
      return this.error("Error fetching category data.");
    }
  }
  static async getCategoryExpensesOverTime(
    categoryId: number,
    userId: number
  ): Promise<any> {
    try {
      // Calculate date range (last 6 months)
      const end = dayjs();
      const start = end.subtract(5, "month").startOf("month");

      // Generate all months in range (including empty ones)
      const monthsInRange: string[] = Array.from({ length: 6 }, (_, i) =>
        start.add(i, "month").format("01-MM-YYYY")
      );

      // Fetch all relevant transactions
      const transactions = await DatabaseService.db.query.transactions.findMany(
        {
          where: and(
            eq(schema.transactions.category_id, categoryId),
            eq(schema.transactions.user_id, userId)
            // gte(schema.transactions.date, start.toDate()),
            // lte(schema.transactions.date, end.endOf("month").toDate())
          ),
          orderBy: (transactions: any, { asc }: { asc: any }) => [
            asc(transactions.date)
          ]
        }
      );

      // Group by month and sum amounts
      const monthlyTotals = transactions.reduce(
        (acc: any, transaction: any) => {
          const monthKey = dayjs(transaction.date).format("01-MM-YYYY");
          acc[monthKey] = (acc[monthKey] || 0) + transaction.amount;
          return acc;
        },
        {} as Record<string, number>
      );

      // Fill in all months with 0 for months with no expenses
      const result = monthsInRange.map((month) => ({
        month,
        totalExpense: monthlyTotals[month] || 0
      }));
      return this.success(result);
    } catch (error) {
      console.error("Error fetching category expenses:", error);
      return [];
    }
  }
}
