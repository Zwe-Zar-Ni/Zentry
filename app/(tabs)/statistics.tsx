import ExpenseOvertime from "@/components/statistics/ExpenseOvertime";
import MonthlyChart from "@/components/statistics/MonthlyChart";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StatisticsScreen = () => {
  return (
    <SafeAreaView className="min-h-screen p-1 bg-light-100 dark:bg-dark-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <MonthlyChart />
        </View>
        <View className="pt-6 border-t border-light-900 dark:border-dark-100">
          <ExpenseOvertime />
        </View>
        <View className="h-[120px]" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
