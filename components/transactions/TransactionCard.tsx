import icons from "@/constants/icons";
import { useUser } from "@/context/UserContext";
import { Transaction } from "@/db/schema";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  transaction: Transaction;
};

const TransactionCard = ({ transaction }: Props) => {
  const { user } = useUser();
  return (
    <TouchableOpacity
      key={transaction.id}
      className="flex flex-row gap-4 my-4"
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/transactions/[id]",
          params: { id: transaction.id }
        });
      }}
    >
      <View className="p-3 rounded-lg bg-light-500 dark:bg-dark-100">
        <Image source={icons[transaction.category?.icon]} className="w-6 h-6" />
      </View>
      <View className="flex-grow">
        <Text className="font-semibold text-dark-900 dark:text-light-100">
          {transaction.category?.name}
        </Text>
        <Text className="text-sm text-dark-100 dark:text-light-900">
          {transaction.note}
        </Text>
      </View>
      <View>
        <Text
          className={`font-semibold text-right ${
            transaction.type === "expense" ? "text-red-500" : "text-green-500"
          }`}
        >
          {transaction.type === "expense" ? `- ${user?.currencyKey} ` : null}
          {transaction.amount}
        </Text>
        <Text className="text-sm text-right text-dark-100 dark:text-light-900">
          {transaction.time}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionCard;
