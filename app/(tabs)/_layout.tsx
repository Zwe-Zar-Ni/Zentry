import { LOGGED_IN, USER, useUser } from "@/context/UserContext";
import { User } from "@/db/schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Tabs } from "expo-router";
import { Activity, Bolt, Layers2, Plus, Rotate3D } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

export default function TabLayout() {
  const { user: contextUser } = useUser();
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: contextUser?.dark_mode === 1 ? "#1A1A1A" : "#F7F9FB"
        }}
      >
        <ActivityIndicator
          size="large"
          color={contextUser?.dark_mode === 1 ? "#F7F9FB" : "#1A1A1A"}
        />
      </View>
    );
  }

  if (!loggedIn || !user) {
    return <Redirect href="/auth/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#9a6cf7",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
            backgroundColor: "white",
            borderTopWidth: 0,
            borderTopColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10
          },
          default: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,
            backgroundColor:
              contextUser?.dark_mode === 1 ? "#111111" : "#F7F9FB"
          }
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500"
        },
        tabBarIconStyle: {
          marginBottom: 4
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full`}>
              <Rotate3D color={color} size={24} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full`}>
              <Activity color={color} size={24} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <View className={` rounded-full`}>
              <View className="flex flex-row items-center justify-center w-16 h-16 mt-2 rounded-full bg-primary-500">
                <Plus color="white" size={27} />
              </View>
            </View>
          ),
          tabBarLabel: () => null
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full`}>
              <Layers2 color={color} size={24} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full`}>
              <Bolt color={color} size={24} />
            </View>
          )
        }}
      />
    </Tabs>
  );
}
