import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: ""
  });

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);

      // Validate form data
      if (!formData.name || !formData.email || !formData.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      // Register user
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        language_id: 1,
        currency_id: 1,
        dark_mode: 0
      });

      // Navigate to tabs on success
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          {t("auth.registerTitle")}
        </Text>
        <View className="w-full mt-4">
          <View>
            <View className="mb-4">
              <Text className="mb-2 text-dark-100 dark:text-light-900">
                {t("labels.name")}
              </Text>
              <Input className="flex flex-row h-[50px] items-center justify-center w-full border border-light-900 dark:border-dark-100">
                <InputField
                  className="w-full dark:color-light-900 color-dark-900"
                  value={formData.name}
                  placeholder="Enter your name"
                  onChangeText={(value) => handleInputChange("name", value)}
                />
              </Input>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-dark-100 dark:text-light-900">
                {t("labels.email")}
              </Text>
              <Input className="flex flex-row h-[50px] items-center justify-center w-full border border-light-900 dark:border-dark-100">
                <InputField
                  className="w-full dark:color-light-900 color-dark-900"
                  value={formData.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(value) => handleInputChange("email", value)}
                />
              </Input>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-dark-100 dark:text-light-900">
                {t("labels.password")}
              </Text>
              <Input className="flex flex-row h-[50px] items-center justify-center w-full border border-light-900 dark:border-dark-100">
                <InputField
                  className="w-full dark:color-light-900 color-dark-900"
                  value={formData.password}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={(value) => handleInputChange("password", value)}
                />
              </Input>
            </View>

            <Button
              onPress={handleRegister}
              className="mt-4 bg-primary-500"
              disabled={isLoading}
            >
              <ButtonText className="font-semibold text-white">
                {isLoading
                  ? t("auth.registerLoading")
                  : t("actions.createAccount")}
              </ButtonText>
            </Button>
            <Text className="mt-6 font-medium text-center text-dark-100 dark:text-light-900">
              {t("auth.haveAccount")}{" "}
              <Link href="/auth/login">
                <Text className="underline text-dark-100 dark:text-light-900">
                  {t("actions.signIn")}
                </Text>
              </Link>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default RegisterPage;
