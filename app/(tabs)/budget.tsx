import BudgetCard from "@/components/budgets/BudgetCard";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import MonthPicker from "@/components/ui/MonthPicker";
import { useUser } from "@/context/UserContext";
import BudgetController from "@/controller/BudgetController";
import { Budget } from "@/db/schema";
import dayjs from "dayjs";
import { Link, useFocusEffect } from "expo-router";
import { ChevronDown, PlusIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ModifiedBudget extends Budget {
  used: number;
}

const BudgetScreen = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [budgets, setBudgets] = useState<ModifiedBudget[]>([]);
  const [month, setMonth] = useState<{ dialog: boolean; value: string }>({
    dialog: false,
    value: dayjs().format("YYYY-MM-DD")
  });

  const fetchBudgets = useCallback(
    async (selectedMonth: string = dayjs().format("DD-MM-YYYY")) => {
      const { data } = await BudgetController.index(selectedMonth, user?.id);
      setBudgets(data);
    },
    [user?.id]
  );

  const onValueChange = useCallback(
    (newDate: string) => {
      const [y, m, d] = newDate.split("-");
      const rearrangedDate = `${d}-${m}-${y}`;
      setMonth({ dialog: false, value: newDate });
      fetchBudgets(rearrangedDate);
    },
    [fetchBudgets]
  );

  useFocusEffect(
    useCallback(() => {
      fetchBudgets(dayjs().format("DD-MM-YYYY"));
    }, [fetchBudgets])
  );
  return (
    <SafeAreaView className="relative min-h-full px-2 pb-8 dark:bg-dark-900 bg-light-100">
      <AlertDialog
        isOpen={month.dialog}
        onClose={() => setMonth({ ...month, dialog: false })}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogBody>
            <MonthPicker date={month.value} setDate={onValueChange} />
          </AlertDialogBody>
          <AlertDialogFooter />
        </AlertDialogContent>
      </AlertDialog>
      <View className="mb-4">
        <Text className="text-2xl font-bold text-dark-900 dark:text-light-100">
          {t("budget.title")}
        </Text>
        <Text className="mt-1 mb-3 text-dark-900 dark:text-light-100">
          {t("budget.description")}
        </Text>
      </View>
      <View className="flex flex-row gap-2">
        <Button
          onPress={() => {
            setMonth({ ...month, dialog: true });
          }}
          className="bg-primary-200 data-[hover=true]:bg-white data-[active=true]:bg-white flex-grow"
        >
          <ButtonText className="text-dark-900 data-[hover=true]:text-dark-900 data-[active=true]:text-dark-900">
            {dayjs(month.value).format("MMMM YYYY")}
          </ButtonText>
          <ChevronDown size={18} color="black" />
        </Button>
        <Button>
          <Link href="/budgets/create">
            <PlusIcon color="white" />
          </Link>
        </Button>
      </View>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <BudgetCard key={item.id} budget={item} />}
        ListEmptyComponent={() => (
          <Text className="my-6 text-center text-dark-100 dark:text-light-500">
            {t("budget.noBudget")} {dayjs(month.value).format("MMMM YYYY")}.
          </Text>
        )}
        ListFooterComponent={() => <View className="h-[300px]" />}
      />
    </SafeAreaView>
  );
};

export default BudgetScreen;
