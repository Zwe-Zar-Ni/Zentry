import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { chartColors } from "@/config/charts";
import { useUser } from "@/context/UserContext";
import TransactionController from "@/controller/TransactionController";
import { Transaction } from "@/db/schema";
import { calculateChartSteps } from "@/utils/charts";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import { Calendar } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import TransactionCard from "../transactions/TransactionCard";
import { Button, ButtonText } from "../ui/button";
import MonthPicker from "../ui/MonthPicker";

type History = {
  name: string;
  total: number;
  id: number;
  icon: string;
};

const MonthlyChart = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [config, setConfig] = useState({
    stepValue: 0,
    noOfSections: 0
  });
  const [selected, setSelected] = useState<{
    month: string;
    type: "expense" | "income";
    showDialog: boolean;
  }>({
    month: dayjs().format("YYYY-MM-DD"),
    type: "expense",
    showDialog: false
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = useCallback(
    async (
      month: string = dayjs().format("DD-MM-YYYY"),
      type: "expense" | "income" = "expense"
    ) => {
      const {
        data
      }: {
        data: History[];
      } = await TransactionController.fetchCategoryData(type, month, user?.id);
      setHistory(
        data.map((d) => ({
          label: d.name,
          value: d.total,
          icon: d.icon,
          id: d.id,
          frontColor:
            chartColors[Math.floor(Math.random() * chartColors.length)]
        }))
      );
      setConfig(calculateChartSteps(data));
    },
    [user?.id]
  );

  const selectedChange = useCallback(
    (type: "expense" | "income", month: string) => {
      setSelected({ type, month, showDialog: false });
      const [y, m, d] = month.split("-");
      const rearrangedDate = `${d}-${m}-${y}`;
      fetchData(rearrangedDate, type);
      setTransactions([]);
    },
    [fetchData]
  );

  const fetchSelectedCategoryTransactions = async (categoryId: number) => {
    const [y, m, d] = selected.month.split("-");
    const rearrangedDate = `${d}-${m}-${y}`;
    const { data } = await TransactionController.fetchByCategory(
      categoryId,
      rearrangedDate,
      user?.id
    );
    setTransactions(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  return (
    <View>
      <AlertDialog
        isOpen={selected.showDialog}
        onClose={() => setSelected({ ...selected, showDialog: false })}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogBody>
            <MonthPicker
              date={selected.month}
              setDate={(date) => {
                selectedChange(selected.type, date);
              }}
            />
          </AlertDialogBody>
          <AlertDialogFooter />
        </AlertDialogContent>
      </AlertDialog>
      <Text className="text-2xl font-bold text-dark-900 dark:text-light-100">
        {t("stats.monthlyChart")}
      </Text>
      <Text className="mt-1 mb-3 text-dark-900 dark:text-light-100">
        {t("stats.monthlyDescription")}
      </Text>
      <View className="flex flex-row items-center justify-between px-2">
        <Text className="text-lg font-bold text-dark-900 dark:text-light-100">
          {dayjs(selected.month).format("MMMM YYYY")}
        </Text>
        <View className="flex flex-row items-center gap-4">
          <View className="flex flex-row justify-end gap-2 m-2 overflow-hidden rounded-xl">
            <Button
              className={`  border-0 rounded-l-none ${
                selected.type === "expense"
                  ? "border-b border-primary-500"
                  : "border-0"
              }`}
              onPress={() => {
                selectedChange("expense", selected.month);
              }}
              variant={"link"}
            >
              <ButtonText
                className={`${
                  selected.type === "expense"
                    ? "text-primary-500"
                    : "text-dark-100 dark:text-light-500"
                }`}
              >
                {t("labels.expense")}
              </ButtonText>
            </Button>
            <Button
              className={`  border-0 rounded-l-none ${
                selected.type === "income"
                  ? "border-b border-primary-500"
                  : "border-0"
              }`}
              onPress={() => {
                selectedChange("income", selected.month);
              }}
              variant="link"
            >
              <ButtonText
                className={`${
                  selected.type === "income"
                    ? "text-primary-500"
                    : "text-dark-100 dark:text-light-500"
                }`}
              >
                {t("labels.income")}
              </ButtonText>
            </Button>
          </View>
          <Button
            onPress={() => {
              setSelected({ ...selected, showDialog: true });
            }}
            className="bg-primary-100 w-10 h-10 rounded-xl data-[hover=true]:bg-primary-200 data-[active=true]:bg-primary-200"
          >
            <Calendar size={18} color="black" />
          </Button>
        </View>
      </View>
      <View className="mt-2">
        <BarChart
          data={history}
          width={Dimensions.get("window").width - 110}
          stepValue={config.stepValue}
          noOfSections={config.noOfSections}
          stepHeight={30}
          yAxisLabelWidth={60}
          barWidth={20}
          spacing={40}
          initialSpacing={5}
          yAxisColor={user?.dark_mode === 1 ? "#303030" : "#eee"}
          xAxisColor={user?.dark_mode === 1 ? "#303030" : "#eee"}
          yAxisTextStyle={{
            fontSize: 10,
            color: user?.dark_mode === 1 ? "white" : "black"
          }}
          xAxisLabelTextStyle={{
            fontSize: 12,
            color: user?.dark_mode === 1 ? "white" : "black"
          }}
          yAxisLabelPrefix={user?.currencyKey}
          roundedTop
          rulesColor={user?.dark_mode ? "#2F2F2F" : "#E8ECEE"}
          rulesType="solid"
          isAnimated
          formatYLabel={(value) =>
            Number(value) > 1000 ? `${Number(value) / 1000}k` : value
          }
          renderTooltip={(item: any, index: any) => {
            return (
              <View
                style={{
                  marginBottom: 4,
                  marginLeft: -6,
                  backgroundColor: "#eee",
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4
                }}
              >
                <Text>
                  {Number(item.value) > 1000
                    ? `${Number(item.value) / 1000}k`
                    : item.value}
                </Text>
              </View>
            );
          }}
          onPress={(item: any) => fetchSelectedCategoryTransactions(item.id)}
        />
      </View>
      {transactions && transactions.length ? (
        <View className="mt-4">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default MonthlyChart;
