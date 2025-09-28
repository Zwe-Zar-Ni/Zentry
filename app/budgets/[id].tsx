import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import icons from "@/constants/icons";
import { useUser } from "@/context/UserContext";
import BudgetController from "@/controller/BudgetController";
import CategoryController from "@/controller/CategoryController";
import { Budget, Category } from "@/db/schema";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Trash } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditBudget = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget>({
    id: 0,
    user_id: user?.id ?? 1,
    category_id: 1,
    amount: 0,
    month: Number(dayjs().format("YYYYMM"))
  });
  const [dialog, setDialog] = useState<boolean>(false);

  const updateBudget = async () => {
    if (!budget.amount) {
      alert("Invalid amount");
      return;
    }
    const res = await BudgetController.update(budget);
    if (res.status === 200) {
      router.back();
    }
  };

  const deleteBudget = async () => {
    if (budget.id) {
      const res = await BudgetController.destroy(budget.id);
      if (res.status === 200) {
        router.back();
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { data: cats }: { data: Category[] } =
        await CategoryController.index();
      setCategories(cats.filter((c) => c.type === "expense"));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await BudgetController.show(Number(id));
      setBudget(data);
    })();
  }, [id]);

  return (
    <SafeAreaView className="relative min-h-full px-2 pb-8 dark:bg-dark-900 bg-light-100">
      <AlertDialog isOpen={dialog} onClose={() => setDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogBody>
            <Text className="mb-4 text-lg">{t("home.confirmDelete")}</Text>
            <View className="flex flex-row items-center justify-end gap-4">
              <Button
                className="mt-4"
                onPress={() => setDialog(false)}
                variant="link"
              >
                <ButtonText>{t("actions.cancel")}</ButtonText>
              </Button>
              <Button
                className="mt-4"
                onPress={() => {
                  setDialog(false);
                  deleteBudget();
                }}
              >
                <ButtonText>{t("actions.confirm")}</ButtonText>
              </Button>
            </View>
          </AlertDialogBody>
          <AlertDialogFooter />
        </AlertDialogContent>
      </AlertDialog>

      <ScrollView className="h-full" showsVerticalScrollIndicator={false}>
        <View className="fixed top-0 flex-row items-center justify-between">
          <Button variant="link" onPress={() => router.back()}>
            <ChevronLeft color={user?.dark_mode === 1 ? "white" : "black"} />
          </Button>
          <Button variant="link" onPress={updateBudget}>
            <ButtonText className="no-underline">
              {t("actions.update")}
            </ButtonText>
          </Button>
        </View>
        <View className="mt-4 mb-8">
          <Text className="mb-1 font-semibold text-dark-100 dark:text-light-500">
            {t("labels.amount")}
          </Text>
          <View className="relative">
            <Input className="bg-light-500 dark:bg-dark-100">
              <InputField
                keyboardType="numeric"
                value={budget.amount.toString()}
                onChangeText={(text) =>
                  setBudget({ ...budget, amount: Number(text) })
                }
              />
            </Input>
            <View className="absolute top-2 right-4">
              <Text className="text-dark-100 dark:text-light-500">
                {user?.currencyKey}
              </Text>
            </View>
          </View>
        </View>
        <View className="mb-8">
          <Text className="mb-1 font-semibold text-dark-100 dark:text-light-500">
            {t("labels.categories")}
          </Text>
          <View className="flex flex-row flex-wrap items-center gap-y-4">
            {categories && categories.length
              ? categories.map((category) => (
                  <Button
                    key={category.id}
                    onPress={() =>
                      setBudget({
                        ...budget,
                        category_id: category.id
                      })
                    }
                    variant="link"
                    className={` bg-transparent w-[25%] min-h-[75px] flex flex-col justify-center items-center`}
                  >
                    <View
                      className={`p-3 rounded-lg border-2 bg-light-500  dark:bg-dark-100 ${
                        budget.category_id === category.id
                          ? "border-primary-500"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        source={icons[category.icon]}
                        className="w-6 h-6"
                      />
                    </View>
                    <ButtonText
                      className={`text-center text-2xs ${
                        budget.category_id === category.id
                          ? "text-primary-500"
                          : "text-dark-100 dark:text-light-500"
                      }`}
                    >
                      {category.name}
                    </ButtonText>
                  </Button>
                ))
              : null}
          </View>
        </View>
      </ScrollView>
      <View className="fixed px-2 bottom-8">
        <Button action="negative" onPress={() => setDialog(true)}>
          <Trash size="16" color="white" />
          <ButtonText>{t("actions.delete")}</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default EditBudget;
