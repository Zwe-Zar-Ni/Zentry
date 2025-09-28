import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const MonthPicker = ({
  date: dt,
  setDate
}: {
  date: string;
  setDate: (date: string) => void;
}) => {
  const [year, setYear] = useState<string>(dayjs(dt).format("YYYY"));
  const [months, setMonths] = useState<string[]>([]);

  const generateMonths = (y: string) => {
    const m = [];
    for (let i = 1; i <= 12; i++) {
      m.push(`${y}-${i.toString().padStart(2, "0")}-01`);
    }
    setMonths(m);
  };

  useEffect(() => {
    generateMonths(year);
  }, [year]);

  return (
    <View>
      <View className="flex flex-row items-center justify-between gap-4 mb-4">
        <TouchableOpacity
          onPress={() => {
            setYear((Number(year) - 1).toString());
          }}
        >
          <ChevronLeft
            color={colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"}
          />
        </TouchableOpacity>
        <Text className="font-semibold text-dark-500 dark:text-light-500">
          {year}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setYear((Number(year) + 1).toString());
          }}
        >
          <ChevronRight
            color={colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"}
          />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row flex-wrap items-center justify-center gap-2">
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setDate(month);
            }}
            className="w-[30%] py-4 rounded-lg bg-primary-100 dark:bg-dark-100"
          >
            <Text
              className={`font-bold text-center text-dark-900 dark:text-light-100`}
            >
              {dayjs(month).format("MMM")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default MonthPicker;
