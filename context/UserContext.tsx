// context/UserContext.tsx
import CurrencyController from "@/controller/CurrencyController";
import { currencies, Currency, languages, User, users } from "@/db/schema";
import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { colorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";

export const LOGGED_IN = "loggedIn";
export const USER = "user";

export interface ModifiedUser extends User {
  currencyKey?: string;
}

type UserContextType = {
  loggedIn: boolean;
  user: ModifiedUser | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, "id">) => Promise<void>;
  isLoading: boolean;
  updateUser: (userData: User) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  loggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  isLoading: true,
  updateUser: async () => {}
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<ModifiedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoggedIn = await AsyncStorage.getItem(LOGGED_IN);
        if (storedLoggedIn === "1") {
          const userData = await AsyncStorage.getItem(USER);
          if (userData) {
            const user = JSON.parse(userData);
            const curr = await drizzleDb.select().from(currencies);
            const userCurrency = curr.find((c) => c.id === user.currency_id);
            setUser({
              ...user,
              currencyKey: userCurrency?.symbol
            });
            setLoggedIn(true);
            const langs = await drizzleDb.select().from(languages);
            i18n.changeLanguage(
              langs.find((l) => l.id === user.language_id)?.key
            );
            colorScheme.set(user.dark_mode === 1 ? "dark" : "light");
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, [drizzleDb]);

  const login = async (userData: User) => {
    try {
      colorScheme.set(userData.dark_mode === 1 ? "dark" : "light");
      await AsyncStorage.setItem(LOGGED_IN, "1");
      await AsyncStorage.setItem(USER, JSON.stringify(userData));
      const { data }: { data: Currency[] } = await CurrencyController.index();
      const userCurrency = data.find(
        (c) => c.id === userData.currency_id
      )?.symbol;

      setUser({
        ...userData,
        currencyKey: userCurrency || "$"
      });
      setLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setLoggedIn(false);
      await AsyncStorage.removeItem(LOGGED_IN);
      await AsyncStorage.removeItem(USER);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const register = async (userData: Omit<User, "id">) => {
    try {
      // Check if email already exists
      const existingUser = await drizzleDb
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existingUser.length > 0) {
        throw new Error(`Email already registered.`);
      }

      // Insert new user
      const [newUser] = await drizzleDb
        .insert(users)
        .values(userData)
        .returning();

      if (!newUser) {
        throw new Error("Failed to create user");
      }
      await login(newUser);
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  const updateUser = async (userData: ModifiedUser) => {
    try {
      setUser(userData);
      AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error during update:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{ loggedIn, user, login, logout, register, isLoading, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
