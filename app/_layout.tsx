import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { UserProvider } from "@/context/UserContext";
import { seedCategories, seedCurrencies, seedLanguages } from "@/db/initials";
import { categories, currencies, languages } from "@/db/schema";
import "@/global.css";
import { DatabaseService } from "@/services/DatabaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import {
  openDatabaseSync,
  SQLiteProvider,
  useSQLiteContext
} from "expo-sqlite";
import { colorScheme } from "nativewind";
import React, { Suspense, useCallback, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Alert, Image, Text, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import migrations from "../drizzle/migrations";
import i18n from "../i18n";

const DATABASE_NAME = "zentry.db";

const InitDb = ({ children }: { children: React.ReactNode }) => {
  const database = useSQLiteContext();
  useEffect(() => {
    DatabaseService.initialize();
  }, [database]);

  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  const seedData = useCallback(async () => {
    const value = await AsyncStorage.getItem("database_seeded");
    if (value === "1") {
      return;
    }
    try {
      seedLanguages.forEach(async (lang) => {
        await db
          .insert(languages)
          .values(lang)
          .catch((err) => {
            Alert.alert("Error seeding languages - ", JSON.stringify(err));
          });
      });
      seedCurrencies.forEach(async (cur) => {
        await db
          .insert(currencies)
          .values(cur)
          .catch((err) => {
            Alert.alert("Error seeding currencies - ", JSON.stringify(err));
          });
      });
      seedCategories.forEach(async (cat) => {
        await db
          .insert(categories)
          .values(cat)
          .catch((err) => {
            Alert.alert("Error seeding categories - ", JSON.stringify(err));
          });
      });
      await AsyncStorage.setItem("database_seeded", "1");
    } catch (error) {
      Alert.alert("db init error - ", JSON.stringify(error));
    }
  }, [db]);

  useEffect(() => {
    if (success) {
      seedData();
    }
  }, [success, seedData]);

  if (error) {
    return (
      <SafeAreaView>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  return children;
};

export default function RootLayout() {
  return (
    <Suspense
      fallback={
        <View className="flex flex-row items-center justify-center w-full h-full">
          <Image
            source={require("../assets/images/icons/adaptive-icon.png")}
            style={{ width: 75, height: 75 }}
          />
        </View>
      }
    >
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <InitDb>
          <I18nextProvider i18n={i18n}>
            <UserProvider>
              <GluestackUIProvider mode={colorScheme.get()}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="auth/login"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth/register"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="transactions/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="budgets/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="budgets/create"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </GluestackUIProvider>
            </UserProvider>
          </I18nextProvider>
        </InitDb>
      </SQLiteProvider>
    </Suspense>
  );
}
