import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper
} from "@/components/ui/actionsheet";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import DatePicker from "@/components/ui/DatePicker";
import { Input, InputField } from "@/components/ui/input";
import icons from "@/constants/icons";
import { useUser } from "@/context/UserContext";
import CategoryController from "@/controller/CategoryController";
import TransactionController from "@/controller/TransactionController";
import { Category, Transaction } from "@/db/schema";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, ChevronLeft, Clock, Trash } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateType } from "react-native-ui-datepicker";

const TransactionDetails = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction>({
    id: 0,
    user_id: user?.id ?? 0,
    category_id: 1,
    amount: 0,
    type: "expense",
    date: dayjs().format("YYYY-MM-DD"),
    time: dayjs().format("HH:mm"),
    note: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState<{ drawer: boolean; value: DateType }>({
    drawer: false,
    value: dayjs()
  });
  const [time, setTime] = useState<{ drawer: boolean; value: DateType }>({
    drawer: false,
    value: dayjs()
  });
  const [dialog, setDialog] = useState<boolean>(false);

  const updateTransaction = async () => {
    const obj = {
      ...transaction,
      date: dayjs(date.value).format("YYYY-MM-DD"),
      time: dayjs(time.value).format("HH:mm")
    };
    //validate
    if (!obj.date || !obj.time || !obj.category_id || !obj.amount) {
      alert("Invalid data");
      return;
    }
    if (obj.amount <= 0) {
      alert("Invalid amount");
      return;
    }
    const res = await TransactionController.update(obj);
    if (res.status === 200) {
      setTransaction({
        id: 0,
        user_id: user?.id ?? 0,
        category_id: 1,
        amount: 0,
        type: "expense",
        date: dayjs().format("YYYY-MM-DD"),
        time: dayjs().format("HH:mm"),
        note: ""
      });
    }
    router.back();
  };

  useEffect(() => {
    (async () => {
      const { data: res }: { data: Transaction } =
        await TransactionController.show(Number(id));
      setTransaction(res);
      const t = dayjs()
        .hour(Number(res.time?.split(":")[0]))
        .minute(Number(res.time?.split(":")[1]));
      setDate({
        ...date,
        value: dayjs(res.date)
      });
      setTime({
        ...time,
        value: t
      });
    })();
  }, [id]);

  const deleteTransaction = async () => {
    if (transaction.id) {
      const res = await TransactionController.destroy(transaction.id);
      if (res.status === 200) {
        router.back();
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { data: cats }: { data: Category[] } =
        await CategoryController.index();
      setCategories(cats);
    })();
  }, []);

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
                  deleteTransaction();
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
          <Button variant="link" onPress={updateTransaction}>
            <ButtonText className="no-underline">
              {t("actions.update")}
            </ButtonText>
          </Button>
        </View>
        <View className="flex flex-row m-2 overflow-hidden rounded-xl bg-primary-100 dark:bg-dark-100">
          <Button
            className="w-1/2 border-0 rounded-r-none"
            onPress={() => {
              setTransaction({
                ...transaction,
                type: "expense",
                category_id:
                  categories.find((c) => c.type === "expense")?.id ?? 1
              });
            }}
            variant={transaction.type === "expense" ? "solid" : "outline"}
          >
            <ButtonText
              className={
                transaction.type === "expense"
                  ? "text-white"
                  : user?.dark_mode === 1
                  ? "text-light-500"
                  : "text-dark-500"
              }
            >
              {t("labels.expense")}
            </ButtonText>
          </Button>
          <Button
            className="w-1/2 border-0 rounded-l-none"
            onPress={() => {
              setTransaction({
                ...transaction,
                type: "income",
                category_id:
                  categories.find((c) => c.type === "income")?.id ?? 1
              });
            }}
            variant={transaction.type === "income" ? "solid" : "outline"}
          >
            <ButtonText
              className={
                transaction.type === "income"
                  ? "text-white"
                  : user?.dark_mode === 1
                  ? "text-light-500"
                  : "text-dark-500"
              }
            >
              {t("labels.income")}
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
                value={transaction.amount.toString()}
                onChangeText={(text) =>
                  setTransaction({ ...transaction, amount: Number(text) })
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
              ? categories
                  .filter((c) => c.type === transaction.type)
                  .map((category) => (
                    <Button
                      key={category.id}
                      onPress={() =>
                        setTransaction({
                          ...transaction,
                          category_id: category.id
                        })
                      }
                      variant="link"
                      className={` bg-transparent w-[25%] min-h-[75px] flex flex-col justify-center items-center`}
                    >
                      <View
                        className={`p-3 rounded-lg border-2 bg-primary-100  dark:bg-dark-100 ${
                          transaction.category_id === category.id
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
                          transaction.category_id === category.id
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
        <View className="mb-8">
          <Text className="mb-1 font-semibold text-dark-100 dark:text-light-500">
            {t("labels.note")}
          </Text>
          <Input className="bg-light-500 dark:bg-dark-100">
            <InputField
              value={transaction.note || ""}
              placeholder="Add a description"
              onChangeText={(text) =>
                setTransaction({ ...transaction, note: text })
              }
            />
          </Input>
        </View>
        <View className="flex flex-row items-center">
          <View className="flex flex-row items-center w-1/2 gap-2 pr-2">
            <Calendar size={24} color="#875CFF" />
            <Button
              className="flex-grow rounded-lg bg-primary-100 dark:bg-dark-100"
              onPress={() => setDate({ ...date, drawer: true })}
            >
              <ButtonText className="text-[15px] text-dark-100 dark:text-light-500">
                {dayjs(date.value).format("DD-MMM-YYYY")}
              </ButtonText>
            </Button>
            <Actionsheet
              isOpen={date.drawer}
              onClose={() => {
                setDate({
                  ...date,
                  drawer: false
                });
              }}
            >
              <ActionsheetBackdrop />
              <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                  <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <DatePicker
                  type="day"
                  date={date.value}
                  setDate={(e) => {
                    setDate({
                      ...date,
                      value: e
                    });
                  }}
                />
                <Button
                  className="w-full mt-4"
                  onPress={() => setDate({ ...date, drawer: false })}
                >
                  <ButtonText>Ok</ButtonText>
                </Button>
              </ActionsheetContent>
            </Actionsheet>
          </View>
          <View className="flex flex-row items-center w-1/2 gap-2 pl-2">
            <Clock size={24} color="#875CFF" />
            <Button
              className="flex-grow rounded-lg bg-primary-100 dark:bg-dark-100"
              onPress={() => setTime({ ...time, drawer: true })}
            >
              <ButtonText className="text-[15px] text-dark-100 dark:text-light-500">
                {dayjs(time.value).format("HH:mm")}
              </ButtonText>
            </Button>
            <Actionsheet
              isOpen={time.drawer}
              onClose={() => {
                setTime({
                  ...time,
                  drawer: false
                });
              }}
            >
              <ActionsheetBackdrop />
              <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                  <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <DatePicker
                  type="time"
                  date={time.value}
                  setDate={(e) => {
                    setTime({
                      ...time,
                      value: e
                    });
                  }}
                />
                <Button
                  className="w-full mt-4"
                  onPress={() => setTime({ ...time, drawer: false })}
                >
                  <ButtonText>Ok</ButtonText>
                </Button>
              </ActionsheetContent>
            </Actionsheet>
          </View>
        </View>
        <View className="h-[60px]" />
      </ScrollView>
      <View className="fixed px-2 bottom-8">
        <Button action="negative" onPress={() => setDialog(true)}>
          <Trash size="16" color="white" />
          <ButtonText>{t("actions.delete")}</ButtonText>
        </Button>
      </View>
      <StatusBar backgroundColor="#875CFF" />
    </SafeAreaView>
  );
};

export default TransactionDetails;
