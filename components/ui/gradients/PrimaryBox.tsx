import React from "react";
import { View } from "react-native";

const PrimaryBox = ({
  children,
  className = "h-36"
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <View
      className={`${className} flex justify-center w-full overflow-hidden rounded-b-3xl`}
    >
      <View className="absolute top-0 left-0 w-full h-full bg-primary-500" />
      <View className="ml-2">{children}</View>
    </View>
  );
};

export default PrimaryBox;
