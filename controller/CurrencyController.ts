import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import BaseController from "./ResponseController";

export default class CurrencyController extends BaseController {
  static async index() {
    try {
      const currencies = await DatabaseService.db
        .select()
        .from(schema.currencies);
      return this.success(currencies);
    } catch (err: any) {
      console.log(err);
      return this.error("Error Fetching currencies.");
    }
  }
}
