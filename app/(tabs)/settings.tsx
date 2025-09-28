import { Button, ButtonText } from "@/components/ui/button";
import PrimaryBox from "@/components/ui/gradients/PrimaryBox";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/UserContext";
import {
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  PoundSterling,
  Star,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import CurrencyController from "@/controller/CurrencyController";
import LanguageController from "@/controller/LanguageController";
import SettingsController from "@/controller/SettingsController";
import * as schema from "@/db/schema";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  // useDrizzleStudio(db); //debug database with db view from the web;
  // const { data } = useLiveQuery(
  //   drizzleDb.select().from(users).orderBy(desc(users.id))
  // ); //live changes from database real time;
  const { t } = useTranslation();
  const { user, updateUser, logout } = useUser();
  const [languages, setLanguages] = useState<schema.Language[]>([]);
  const [currencies, setCurrencies] = useState<schema.Currency[]>([]);

  useEffect(() => {
    (async () => {
      const { data: langs }: { data: schema.Language[] } =
        await LanguageController.index();
      setLanguages(langs);
      const { data: currs }: { data: schema.Currency[] } =
        await CurrencyController.index();
      setCurrencies(currs);
    })();
  }, []);

  const toggleDarkMode = async () => {
    if (!user) return;
    await SettingsController.toggleTheme(user, updateUser);
  };

  const changeLanguage = async (lang: string) => {
    if (!user) return;
    await SettingsController.changeLanguage(Number(lang), user, updateUser);
  };

  const changeCurrency = async (cur: string) => {
    if (!user) return;
    await SettingsController.changeCurrency(Number(cur), user, updateUser);
  };

  const logTheFOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ScrollView className="min-h-full bg-light-100 dark:bg-dark-900">
      <PrimaryBox>
        <Text className="text-3xl font-bold text-white">
          {" "}
          {t("settings.title")}
        </Text>
      </PrimaryBox>
      <View className="flex flex-row items-center gap-2 p-1 mt-4">
        <View className="flex flex-row items-center justify-center w-24 h-24 rounded-full bg-light-500 dark:bg-dark-100">
          <User size={48} color={user?.dark_mode === 1 ? "white" : "black"} />
        </View>
        <View className="flex-grow">
          <Text className="text-3xl font-black text-dark-900 dark:text-light-100">
            {user?.name}
          </Text>
          <Text className="text-xl font-semibold text-dark-900 dark:text-light-100">
            {user?.email}
          </Text>
        </View>
      </View>
      <View className="p-4">
        <Select
          onValueChange={changeLanguage}
          selectedValue={
            languages?.find((l) => l.id === user?.language_id)?.name
          }
        >
          <SelectTrigger
            size="xl"
            className="flex flex-row items-center gap-4 border-0 outline-none"
          >
            <Languages size={24} color="#875CFF" />
            <Text className="flex-grow text-xl font-semibold text-dark-100 dark:text-light-100">
              {t("settings.language")}
            </Text>
            <SelectInput className="pr-0 mr-0" />
            <SelectIcon
              className="pl-0 ml-0 mr-1 text-primary-500"
              as={ChevronRight}
            />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {languages && languages.length
                ? languages.map((lang) => (
                    <SelectItem
                      key={lang.id}
                      label={`${lang.flag} ${lang.name}`}
                      value={lang.id.toString()}
                    />
                  ))
                : null}
            </SelectContent>
          </SelectPortal>
        </Select>
        <Select
          className="my-2"
          onValueChange={changeCurrency}
          selectedValue={
            currencies?.find((l) => l.id === user?.currency_id)?.name
          }
        >
          <SelectTrigger
            size="xl"
            className="flex flex-row items-center gap-4 border-0 outline-none"
          >
            <PoundSterling size={24} color="#875CFF" />
            <Text className="flex-grow text-xl font-semibold text-dark-100 dark:text-light-100">
              {t("settings.currency")}
            </Text>
            <SelectInput className="pr-0 mr-0" />
            <SelectIcon
              className="pl-0 ml-0 mr-1 text-primary-500"
              as={ChevronRight}
            />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {currencies && currencies.length
                ? currencies.map((cur) => (
                    <SelectItem
                      key={cur.id}
                      label={cur.name}
                      value={cur.id.toString()}
                    />
                  ))
                : null}
            </SelectContent>
          </SelectPortal>
        </Select>
        <View className="flex flex-row items-center gap-4 mb-4">
          <Moon size={24} color="#875CFF" />
          <Text className="flex-grow text-xl font-medium text-dark-900 dark:text-light-100">
            {t("settings.darkMode")}
          </Text>
          <Switch
            size="md"
            value={user?.dark_mode === 1}
            onToggle={toggleDarkMode}
            trackColor={{ false: "#9b99a1", true: "#eee" }}
            thumbColor={"#875CFF"}
            ios_backgroundColor={"cornflowerblue"}
          />
        </View>
        <View className="flex flex-row items-center gap-4 mb-4">
          <Star size={24} color="#875CFF" />
          <Text className="flex-grow text-xl font-medium text-dark-900 dark:text-light-100">
            {t("settings.version")}
          </Text>
          <Text className="text-xl font-medium text-primary-500">1.0.0</Text>
        </View>
      </View>
      <View className="p-2">
        <Button
          size="lg"
          className="mt-4"
          action="negative"
          onPress={logTheFOut}
        >
          <LogOut size={18} color="white" />
          <ButtonText className="text-white">{t("actions.logout")}</ButtonText>
        </Button>
      </View>
    </ScrollView>
  );
};

export default SettingsPage;
