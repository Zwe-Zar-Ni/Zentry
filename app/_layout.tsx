import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import { Text } from "react-native";
import "react-native-reanimated";
import i18n from "../i18n";

const DATABASE_NAME = "zentry.db";

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { error } = useMigrations(db, migrations);

  if (error) {
    return <Text>{error.message}</Text>;
  }

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }} //live changes from database real time;
        useSuspense
      >
        <I18nextProvider i18n={i18n}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </I18nextProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
