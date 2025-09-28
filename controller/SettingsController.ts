import { ModifiedUser } from "@/context/UserContext";
import * as schema from "@/db/schema";
import i18n from "@/i18n";
import { DatabaseService } from "@/services/DatabaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from "drizzle-orm";
import { colorScheme } from "nativewind";
import CurrencyController from "./CurrencyController";
import LanguageController from "./LanguageController";
import BaseController from "./ResponseController";

export default class SettingsController extends BaseController {
  static async toggleTheme(
    user: schema.User,
    updateUser: (userData: schema.User) => Promise<void>
  ) {
    try {
      const darkMode = colorScheme.get() === "dark";
      await DatabaseService.db
        .update(schema.users)
        .set({ dark_mode: darkMode ? 0 : 1 })
        .where(eq(schema.users.id, user.id));
      const u = {
        ...user,
        dark_mode: darkMode ? 0 : 1
      };
      AsyncStorage.setItem("user", JSON.stringify(u));
      colorScheme.toggle();
      updateUser(u);
      return this.success(null);
    } catch (err: any) {
      console.log(err);
      return this.error("Error changing theme.");
    }
  }
  static async changeLanguage(
    languageId: number,
    user: schema.User,
    updateUser: (userData: schema.User) => Promise<void>
  ) {
    try {
      await DatabaseService.db
        .update(schema.users)
        .set({ language_id: languageId })
        .where(eq(schema.users.id, user?.id ?? 0));
      updateUser({ ...user, language_id: languageId });
      const { data: languages }: { data: schema.Language[] } =
        await LanguageController.index();
      i18n.changeLanguage(languages.find((l) => l.id === languageId)?.key);
      return this.success(null);
    } catch (err: any) {
      console.log(err);
      return this.error("Error updating language");
    }
  }
  static async changeCurrency(
    currencyId: number,
    user: schema.User,
    updateUser: (userData: ModifiedUser) => Promise<void>
  ) {
    try {
      await DatabaseService.db
        .update(schema.users)
        .set({ currency_id: currencyId })
        .where(eq(schema.users.id, user?.id ?? 0));
      const { data: currs }: { data: schema.Currency[] } =
        await CurrencyController.index();
      updateUser({
        ...user,
        currency_id: currencyId,
        currencyKey: currs.find((c) => c.id === currencyId)?.symbol
      });
      return this.success(null);
    } catch (err: any) {
      console.log(err);
      return this.error("Error updating currency");
    }
  }
}
