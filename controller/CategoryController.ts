import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import { Alert } from "react-native";
import BaseController from "./ResponseController";

export default class CategoryController extends BaseController {
  static async index() {
    try {
      const categories = await DatabaseService.db
        .select()
        .from(schema.categories);
      return this.success(categories);
    } catch (err: any) {
      Alert.alert("Error Fetching categories.", err.message);
      return this.error("Error Fetching categories.");
    }
  }
}
