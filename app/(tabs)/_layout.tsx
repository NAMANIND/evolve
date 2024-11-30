import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "../../components/TabBar";

function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#ccc",
        tabBarLabelStyle: {
          fontFamily: "Poppins-Regular",
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#ccc",
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logger"
        options={{
          headerTitle: "Log Activity",
          tabBarLabel: "Log Activity",
          tabBarIcon: ({ color }) => (
            <Ionicons name="magnet-sharp" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default TabLayout;
