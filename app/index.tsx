import { LOGGED_IN, USER } from "@/context/UserContext";
import { User } from "@/db/schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Redirect } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  Text,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";

const IndexPage = () => {
  const { width } = Dimensions.get("window");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const userString = await AsyncStorage.getItem(USER);
      const loggedIn = await AsyncStorage.getItem(LOGGED_IN);
      if (userString && loggedIn === "1") {
        setUser(JSON.parse(userString));
        setLoggedIn(true);
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  if (loggedIn && user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View className="h-full">
      <View className="flex flex-row justify-center w-full pt-16 h-1/2 bg-primary-400">
        <Image
          source={require("../assets/images/index.png")}
          style={{ width: 250, height: 250 }}
        />
      </View>
      <View className="relative bg-white h-1/2">
        <View className="absolute top-[-50px] rotate-180 bg-white">
          <Svg width={width} height={50} viewBox={`0 0 ${width} ${50}`}>
            <Path
              d={`M0 0 Q${width / 2} ${
                50 * 2
              } ${width} 0 L${width} ${50} L0 ${50} Z`}
              fill="#9885ff"
            />
          </Svg>
        </View>
        <View className="absolute top-[-90px] flex flex-row justify-center items-center w-full">
          <View className="overflow-hidden rounded-lg bg-dark-900">
            <Image
              source={require("../assets/images/icons/ios-dark.png")}
              style={{ width: 75, height: 75 }}
            />
          </View>
        </View>
        <View className="flex flex-col items-center justify-center h-full">
          <Text className="px-4 py-1 font-bold rounded-lg text-dark-900 bg-primary-200">
            Zentry
          </Text>
          <Text className="my-4 text-5xl font-black leading-[1.2] text-center">
            Your Financial Adventure Begins Here
          </Text>
          <Link href="/auth/login" className="p-4 rounded-xl bg-primary-500">
            <ArrowRight color="white" size={27} />
          </Link>
        </View>
      </View>
      <StatusBar hidden={true} />
    </View>
  );
};

export default IndexPage;
