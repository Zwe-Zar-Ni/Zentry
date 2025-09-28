import React from "react";
import { colorScheme } from "react-native-css-interop";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";

type Props = {
  date: DateType;
  setDate: (e: DateType) => void;
  type?: "day" | "time" | "month";
};

const DatePicker = ({ date, setDate, type = "day" }: Props) => {
  return (
    <DateTimePicker
      mode="single"
      date={date}
      timePicker={type === "time"}
      initialView={type === "time" ? "time" : "day"}
      styles={{
        day_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        month: {
          backgroundColor: colorScheme.get() === "dark" ? "#2F2F2F" : "#E8ECEE",
          borderRadius: 6
        },
        month_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        year_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        weekday_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        button_next: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        button_prev: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        month_selector_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        year_selector_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111"
        },
        time_label: {
          color: colorScheme.get() === "dark" ? "#F7F9FB" : "#111111",
          fontSize: 18
        },
        day: {
          borderRadius: 6
        },
        today: { borderColor: "cornflowerblue", borderWidth: 1 },
        selected: { backgroundColor: "#875CFF" },
        selected_label: { color: "white" }
      }}
      onChange={({ date }) => {
        setDate(date);
      }}
    />
  );
};

export default DatePicker;
