import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import BaseController from "./ResponseController";
import TransactionController from "./TransactionController";

export default class BudgetController extends BaseController {
  static async index(
    selectedMonth: string = dayjs().format("DD-MM-YYYY"),
    userID = 1
  ) {
    try {
      let date = selectedMonth.split("-").map(Number);
      const m = date[1].toString().padStart(2, "0");
      const month = `${date[2]}${m}`;
      const budgets: schema.Budget[] =
        await DatabaseService.db.query.budgets.findMany({
          with: {
            category: true
          },
          where: (budgets: any, operators: any) =>
            operators.and(
              operators.eq(budgets.user_id, userID),
              operators.eq(budgets.month, month)
            )
        });
      const { data: transactions }: { data: { id: number; total: number }[] } =
        await TransactionController.fetchCategoryData(
          "expense",
          selectedMonth,
          userID
        );
      const result = budgets.map((budget) => ({
        ...budget,
        used: transactions.find((t) => t.id === budget.category_id)?.total ?? 0
      }));
      return this.success(result);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Fetching budgets.");
    }
  }
  static async store(budget: schema.Budget) {
    try {
      const obj: schema.Budget = {
        ...budget
      };
      delete obj.id;
      const res = await DatabaseService.db.insert(schema.budgets).values(obj);
      return this.success(res);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Saving budget.");
    }
  }
  static async show(id: number) {
    try {
      const budget = await DatabaseService.db.query.budgets.findFirst({
        where: eq(schema.budgets.id, id)
      });
      return this.success(budget);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Fetching budgets.");
    }
  }
  static async update(budget: schema.Budget) {
    try {
      const obj: {
        category?: schema.Category;
        user?: schema.User;
        id?: number;
        user_id: number;
        category_id: number;
        amount: number;
        month: number;
      } = {
        ...budget,
        category_id: budget.category_id ?? 1
      };
      delete obj.id;
      await DatabaseService.db
        .update(schema.budgets)
        .set(obj)
        .where(eq(schema.budgets.id, budget.id));
      return this.success(budget);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Updating budget.");
    }
  }
  static async destroy(id: number) {
    try {
      await DatabaseService.db
        .delete(schema.budgets)
        .where(eq(schema.budgets.id, id));
      return this.success(id);
    } catch (err: any) {
      return this.error("Error Deleting budget.");
    }
  }
}
