import icons from "@/constants/icons";
import { useUser } from "@/context/UserContext";
import { Budget } from "@/db/schema";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface ModifiedBudget extends Budget {
  used: number;
}

const BudgetCard = ({ budget }: { budget: ModifiedBudget }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [data, setData] = useState<{ value: number; color: string }[]>([]);
  useEffect(() => {
    setData([
      {
        value: budget.amount - budget.used,
        color: user?.dark_mode === 1 ? "#1A1A1A" : "#CFD4DA"
      },
      {
        value: budget.used,
        color: "#875CFF"
      }
    ]);
  }, [budget.amount, budget.used, user?.dark_mode]);
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        router.push({
          pathname: "/budgets/[id]",
          params: { id: budget.id }
        });
      }}
      className="relative flex flex-row justify-between gap-4 p-4 mt-4 rounded-xl bg-primary-100 dark:bg-primary-200"
    >
      <View className="flex-grow max-w-[180px]">
        <View className="flex flex-row items-center gap-2 mb-2">
          <Image source={icons[budget.category?.icon]} className="w-6 h-6" />
          <Text className="text-xl font-bold text-dark-900 ">
            {budget.category?.name}
          </Text>
        </View>
        <View className="flex flex-row gap-2 mt-1">
          <Text className="w-[75px] font-semibold text-dark-100">
            {t("labels.total")}
          </Text>
          <Text className="text-dark-100">-</Text>
          <Text className="flex-grow text-lg font-semibold text-right text-dark-100">
            {user?.currencyKey} {budget.amount}
          </Text>
        </View>
        <View className="flex flex-row gap-2">
          <Text className="w-[75px] font-semibold text-warning-500">
            {t("labels.spent")}
          </Text>
          <Text className="text-warning-500">-</Text>
          <Text className="flex-grow text-lg font-semibold text-right text-warning-500">
            {user?.currencyKey} {budget.used}
          </Text>
        </View>
        <View className="flex flex-row gap-2 border-t dark:border-primary-200">
          <Text className="w-[75px] font-semibold text-success-500">
            {t("labels.remaining")}
          </Text>
          <Text className="text-success-500">-</Text>
          <Text className="flex-grow text-lg font-semibold text-right text-success-500">
            {user?.currencyKey}{" "}
            {budget.amount - budget.used > 0 ? budget.amount - budget.used : 0}
          </Text>
        </View>
      </View>
      <View>
        <PieChart
          data={data}
          strokeColor={
            user?.dark_mode === 1 ? "rgb(216, 212, 255)" : "rgb(234 232 255)"
          }
          strokeWidth={4}
          isAnimated={true}
          radius={60}
          donut={true}
          innerCircleColor={
            user?.dark_mode === 1 ? "rgb(216, 212, 255)" : "rgb(234 232 255)"
          }
          innerRadius={45}
          centerLabelComponent={() => {
            return (
              <Text className="text-2xl font-bold text-dark-100">
                {Math.round(budget.used * (100 / budget.amount))}%
              </Text>
            );
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default BudgetCard;
