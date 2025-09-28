import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
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
import { useUser } from "@/context/UserContext";
import UserController from "@/controller/UserController";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Link, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ChevronDownIcon, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { login } = useUser();
  const [users, setUsers] = useState<schema.User[]>([]);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const user = await drizzleDb
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.email, formData.email),
            eq(schema.users.password, formData.password)
          )
        );

      if (user[0]?.email) {
        await login(user[0]);
        router.replace("/(tabs)/home");
      } else {
        Alert.alert(
          "Invalid Credentials",
          "Please check your email and password"
        );
      }
    } catch (error) {
      Alert.alert("Error", JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await UserController.index();
      // setFormData((prev) => ({ ...prev, email: data[0]?.email || "" }));
      setUsers(data);
    })();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
    >
      <SafeAreaView className="flex justify-center min-h-full p-2 bg-white dark:bg-dark-900">
        <View className="flex flex-col items-center mb-8">
          <View className="overflow-hidden rounded-lg bg-dark-900">
            <Image
              source={require("../../assets/images/icons/ios-dark.png")}
              style={{ width: 60, height: 60 }}
            />
          </View>
        </View>
        <Text className="overflow-hidden text-xl font-semibold text-dark-100 dark:text-light-100">
          {t("auth.loginTitle")}
        </Text>
        <View className="w-full mt-4">
          <Select
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, email: value }));
            }}
            selectedValue={
              users?.find((l) => l.email === formData.email)?.email || ""
            }
            className="mb-4"
          >
            <SelectTrigger
              size="xl"
              className="flex flex-row items-center px-2 h-[50px] border outline-none border-light-900 bg-light-100 dark:bg-dark-100 dark:border-dark-100 rounded-xl"
            >
              <User size={24} color="#1A1A1A" />
              <SelectInput
                className="flex flex-row items-center flex-grow h-full pt-1 mt-2.5"
                placeholder="Select User"
              />
              <SelectIcon
                className="pl-0 ml-0 mr-1 text-primary-500"
                as={ChevronDownIcon}
              />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {users && users.length
                  ? users.map((u) => (
                      <SelectItem key={u.id} label={u.name} value={u.email} />
                    ))
                  : null}
              </SelectContent>
            </SelectPortal>
          </Select>
          <Input
            className="flex flex-row h-[50px] items-center justify-center w-full border border-light-900 dark:border-dark-100"
            size="xl"
          >
            <InputField
              className="w-full dark:color-light-900 color-dark-900"
              value={formData.password}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={(value) => handleInputChange("password", value)}
            />
          </Input>
          <Button
            onPress={signIn}
            className="mt-8 bg-primary-500"
            size="xl"
            disabled={isLoading}
          >
            <ButtonText className="text-xl font-semibold text-white">
              {isLoading ? t("auth.loginLoading") : t("actions.signIn")}
            </ButtonText>
          </Button>
          <Text className="mt-6 font-medium text-center text-dark-100 dark:text-light-900">
            {t("auth.noAccount")}{" "}
            <Link href="/auth/register">
              <Text className="underline text-dark-100 dark:text-light-900">
                {t("actions.createAccount")}
              </Text>
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default LoginPage;
