import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { isAdminUser } from "../../services/authService";

export default function TabLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user ? isAdminUser(user.email) : false;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#e74c3c",
        tabBarInactiveTintColor: "#7f8c8d",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          // backgroundColor: "#ffffff",
          // borderTopWidth: 1,
          // borderTopColor: "#e1e8ed",
          paddingBottom: 0,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: isAdmin ? null : "/home",
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabBarIcon}>
              <Ionicons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          href: isAdmin ? null : "/tracking",
          title: "Tracking",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabBarIcon}>
              <Ionicons name="location" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          href: isAdmin ? null : "/emergency",
          title: "Emergency",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabBarIcon}>
              <Ionicons name="call" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabBarIcon}>
              <Ionicons name="person" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? "/admin" : null,
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabBarIcon}>
              <Ionicons name="shield" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarIcon: {
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
