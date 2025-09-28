import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import icons from "@/constants/icons";
import { useUser } from "@/context/UserContext";
import CategoryController from "@/controller/CategoryController";
import TransactionController from "@/controller/TransactionController";
import { Category } from "@/db/schema";
import { calculateChartSteps } from "@/utils/charts";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Button, ButtonText } from "../ui/button";

const ExpenseOvertime = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [expenses, setExpenses] = useState<{ label: string; value: number }[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<{
    id: number;
    showDialog: boolean;
  }>({
    id: 1,
    showDialog: false
  });
  const [config, setConfig] = useState({
    stepValue: 0,
    noOfSections: 0
  });

  const fetchData = useCallback(
    async (categoryId: number) => {
      const { data } = await TransactionController.getCategoryExpensesOverTime(
        categoryId,
        user?.id ?? 1
      );
      setExpenses(() =>
        data.map((e: any) => {
          const [day, month, year] = e.month.split("-");
          const date = new Date(`${year}-${month}-${day}`);
          return {
            value: e.totalExpense,
            label: dayjs(date).format("MMM")
          };
        })
      );
      setConfig(
        calculateChartSteps(
          data.map((e: any) => ({ ...e, total: e.totalExpense }))
        )
      );
    },
    [user?.id]
  );

  useEffect(() => {
    (async () => {
      const { data: cats }: { data: Category[] } =
        await CategoryController.index();
      setCategories(cats);
      setSelected({ id: cats[0].id, showDialog: false });
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData])
  );

  return (
    <View>
      <Text className="text-2xl font-bold text-dark-900 dark:text-light-100">
        {t("stats.overTime")}
      </Text>
      <Text className="mt-1 mb-3 text-dark-900 dark:text-light-100">
        {t("stats.overTimeDescription")}
      </Text>
      <View className="flex flex-row items-center justify-between px-2 mb-2">
        <Text className="text-lg font-bold text-dark-900 dark:text-light-100">
          {expenses[0]?.label} - {expenses[expenses.length - 1]?.label}
        </Text>
        <Button
          className=" rounded-xl data-[hover=true]:bg-primary-200 data-[active=true]:bg-primary-200 bg-primary-100"
          onPress={() => setSelected({ ...selected, showDialog: true })}
        >
          <Image
            source={icons[categories.find((c) => c.id === selected.id)?.icon]}
            className="w-6 h-6"
          />
          <ButtonText className=" text-dark-100">
            {categories && categories.length
              ? categories.find((c) => c.id === selected.id)?.name
              : null}
          </ButtonText>
        </Button>
      </View>
      <AlertDialog
        isOpen={selected.showDialog}
        onClose={() => setSelected({ ...selected, showDialog: false })}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogBody>
            <Text className="mb-1 text-lg font-semibold text-center text-dark-100 dark:text-light-900">
              {t("labels.expense")}
            </Text>
            <View className="flex flex-row flex-wrap items-center gap-y-4">
              {categories && categories.length
                ? categories
                    .filter((c) => c.type === "expense")
                    .map((category) => (
                      <Button
                        key={category.id}
                        onPress={() => {
                          setSelected({
                            showDialog: false,
                            id: category.id
                          });
                          fetchData(category.id);
                        }}
                        variant="link"
                        className={` bg-transparent w-[25%] min-h-[75px] flex flex-col justify-center items-center`}
                      >
                        <View
                          className={`p-3 rounded-lg bg-primary-100 dark:bg-dark-100 border-2 ${
                            selected.id === category.id
                              ? "border-primary-500"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            source={icons[category.icon]}
                            className="w-6 h-6"
                          />
                        </View>
                        <ButtonText className="text-center text-2xs text-dark-100 dark:text-light-500">
                          {category.name}
                        </ButtonText>
                      </Button>
                    ))
                : null}
            </View>
            <Text className="mt-2 mb-1 text-lg font-semibold text-center text-dark-100 dark:text-light-900">
              {t("labels.income")}
            </Text>
            <View className="flex flex-row flex-wrap items-center gap-y-4">
              {categories && categories.length
                ? categories
                    .filter((c) => c.type === "income")
                    .map((category) => (
                      <Button
                        key={category.id}
                        onPress={() => {
                          setSelected({
                            showDialog: false,
                            id: category.id
                          });
                          fetchData(category.id);
                        }}
                        variant="link"
                        className={` bg-transparent w-[25%] min-h-[75px] flex flex-col justify-center items-center`}
                      >
                        <View
                          className={`p-3 rounded-lg bg-light-100 dark:bg-dark-100 border-2 ${
                            selected.id === category.id
                              ? "border-primary-500"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            source={icons[category.icon]}
                            className="w-6 h-6"
                          />
                        </View>
                        <ButtonText className="text-center text-2xs text-dark-100 dark:text-light-500">
                          {category.name}
                        </ButtonText>
                      </Button>
                    ))
                : null}
            </View>
          </AlertDialogBody>
          <AlertDialogFooter />
        </AlertDialogContent>
      </AlertDialog>
      <View className="mb-2">
        <LineChart
          width={Dimensions.get("window").width - 110}
          stepValue={config.stepValue}
          noOfSections={config.noOfSections}
          data={expenses}
          color={"#9467FE"}
          yAxisColor={user?.dark_mode === 1 ? "#303030" : "#eee"}
          xAxisColor={user?.dark_mode === 1 ? "#303030" : "#eee"}
          curved
          thickness={3}
          hideDataPoints
          rulesType="solid"
          rulesColor={user?.dark_mode ? "#2F2F2F" : "#E8ECEE"}
          yAxisTextStyle={{
            fontSize: 10,
            color: user?.dark_mode === 1 ? "white" : "black"
          }}
          xAxisLabelTextStyle={{
            fontSize: 12,
            color: user?.dark_mode === 1 ? "white" : "black"
          }}
          spacing={45}
          stepHeight={20}
          yAxisLabelWidth={60}
          yAxisLabelPrefix={user?.currencyKey}
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
        />
      </View>
      {expenses && expenses.length ? (
        <View className="mt-4 ">
          {expenses.map((e) => (
            <View
              key={e.label}
              className="flex flex-row items-center justify-between rounded-xl"
            >
              <View className="w-1/2 p-2 border rounded border-light-900 dark:border-dark-100">
                <Text className="text-lg font-bold text-dark-900 dark:text-light-100">
                  {e.label}
                </Text>
              </View>
              <View className="flex flex-row justify-end w-1/2 p-2 border rounded border-light-900 dark:border-dark-100">
                <Text className="text-lg font-bold text-dark-900 dark:text-light-100">
                  {user?.currencyKey} {e.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default ExpenseOvertime;
