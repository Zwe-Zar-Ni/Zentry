import TransactionCard from "@/components/transactions/TransactionCard";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import PrimaryBox from "@/components/ui/gradients/PrimaryBox";
import MonthPicker from "@/components/ui/MonthPicker";
import { useUser } from "@/context/UserContext";
import TransactionController from "@/controller/TransactionController";
import { Transaction } from "@/db/schema";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";

type Data = {
  count: number;
  date: string;
  totalAmount: number;
  transactions: Transaction[];
};
type Result = {
  monthlyIncome: number;
  monthlyExpense: number;
  data: Data[];
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [month, setMonth] = useState<{ dialog: boolean; value: string }>({
    dialog: false,
    value: dayjs().format("YYYY-MM-DD")
  });
  const [result, setResult] = useState<Result>({
    monthlyIncome: 0,
    monthlyExpense: 0,
    data: []
  });

  const fetchTransactions = useCallback(
    async (
      selectedMonth: string = dayjs().format("DD-MM-YYYY"),
      userId: number = 1
    ) => {
      const { data: res }: { data: Result } = await TransactionController.index(
        selectedMonth,
        userId
      );
      setResult(res);
    },
    []
  );

  const onValueChange = useCallback(
    (newDate: string) => {
      const [y, m, d] = newDate.split("-");
      const rearrangedDate = `${d}-${m}-${y}`;
      setMonth({ dialog: false, value: newDate });
      fetchTransactions(rearrangedDate, user?.id);
    },
    [user?.id, fetchTransactions]
  );

  useFocusEffect(
    useCallback(() => {
      fetchTransactions(dayjs().format("DD-MM-YYYY"), user?.id);
    }, [fetchTransactions, user?.id])
  );
  return (
    <View className="min-h-full pb-32 bg-light-100 dark:bg-dark-900">
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
      <PrimaryBox>
        <View className="relative flex flex-row items-center justify-between h-full px-2">
          <View className="-mt-3">
            <Text className="font-bold text-white ">
              {user?.currencyKey}
              {result ? result.monthlyIncome : null} - {user?.currencyKey}
              {result ? result.monthlyExpense : null}
            </Text>
            <Text className="text-3xl font-bold text-white">
              {user?.currencyKey}
              {result ? result.monthlyIncome - result.monthlyExpense : null}
            </Text>
          </View>
          <View>
            <Text className="mr-1 text-lg font-bold text-right text-white">
              {user?.name}
            </Text>

            <Button
              onPress={() => {
                setMonth({ ...month, dialog: true });
              }}
              className="bg-white rounded-xl data-[hover=true]:bg-white data-[active=true]:bg-white"
            >
              <ButtonText className="text-dark-900 data-[hover=true]:text-dark-900 data-[active=true]:text-dark-900">
                {dayjs(month.value).format("MMMM YYYY")}
              </ButtonText>
              <ChevronDown size={18} color="black" />
            </Button>
          </View>
        </View>
      </PrimaryBox>
      <View className="px-2">
        {result && result.data && result.data.length ? (
          <FlatList
            data={result.data}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: day }) => (
              <View className="my-4">
                <View className="flex flex-row items-center justify-between gap-2">
                  <Text className="text-lg font-bold text-dark-900 dark:text-light-100">
                    {dayjs(day.date).format("ddd, DD MMM")}
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      day.totalAmount < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {day.totalAmount < 0
                      ? `- ${user?.currencyKey} ${day.totalAmount * -1}`
                      : `${user?.currencyKey} ${day.totalAmount}`}
                  </Text>
                </View>
                {day.transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </View>
            )}
            ListFooterComponent={
              <View className="flex flex-row h-[200px] items-center justify-center flex-grow">
                <Text className="text-dark-100 dark:text-light-900">
                  {result.data.length === 0 ? "No transactions found" : ""}
                </Text>
              </View>
            }
          />
        ) : (
          <View className="flex flex-col h-[200px] items-center justify-center flex-grow">
            <Text className="text-dark-100 dark:text-light-900">
              {t("home.noTransactions")}
            </Text>
            <Text className="text-dark-100 dark:text-light-900">
              {t("home.addTransaction")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
