import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import { Alert } from "react-native";
import BaseController from "./ResponseController";

export default class UserController extends BaseController {
  static async index() {
    try {
      const users = await DatabaseService.db.select().from(schema.users);
      return this.success(users);
    } catch (err: any) {
      Alert.alert("Error Fetching Users", JSON.stringify(err));
      return this.error("Error Fetching users.");
    }
  }
}
