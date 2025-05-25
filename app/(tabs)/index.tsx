import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import * as schema from "@/db/schema";
import { users as dbUsers } from "@/db/schema";
import i18n from "@/i18n";
import { desc, eq } from "drizzle-orm";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  useDrizzleStudio(db); //debug database with db view from the web;
  const { data } = useLiveQuery(
    drizzleDb.select().from(dbUsers).orderBy(desc(dbUsers.id))
  ); //live changes from database real time;

  const insertUser = async () => {
    await drizzleDb
      .insert(dbUsers)
      .values({ name: "test", email: "test@test.com", password: "internet" });
  };

  const removeUser = async (id: number) => {
    await drizzleDb.delete(dbUsers).where(eq(dbUsers.id, id));
  };
  const updateUser = async (id: number) => {
    await drizzleDb
      .update(dbUsers)
      .set({ name: "user updated" })
      .where(eq(dbUsers.id, id));
  };

  // %%%%%%%%%%%%%%%%%%
  const { t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView>
      <Text>{t("welcome")}</Text>
      <TouchableOpacity onPress={() => changeLanguage("en")}>
        <Text>En</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeLanguage("fr")}>
        <Text>Fr</Text>
      </TouchableOpacity>
      <View>
        {data.map((user) => (
          <View key={user.id}>
            <Text>
              {user.id} - {user.name},
            </Text>
            <TouchableOpacity onPress={() => updateUser(user.id)}>
              <Text>{" . "}Update User</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeUser(user.id)}>
              <Text>{" . "}Remove User</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={insertUser}>
        <Text>Insert User</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
