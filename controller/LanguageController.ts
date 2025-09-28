import * as schema from "@/db/schema";
import { DatabaseService } from "@/services/DatabaseService";
import { Alert } from "react-native";
import BaseController from "./ResponseController";

export default class LanguageController extends BaseController {
  static async index() {
    try {
      const languages = await DatabaseService.db
        .select()
        .from(schema.languages);
      return this.success(languages);
    } catch (err: any) {
      Alert.alert("Error Fetching Languages.", JSON.stringify(err));
      return this.error("Error Fetching Languages.");
    }
  }
}
