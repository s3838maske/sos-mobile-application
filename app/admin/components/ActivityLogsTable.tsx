import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "auth" | "system" | "sos";
}

export default function ActivityLogsTable() {
  // Mock data for system activity
  const logs: ActivityLog[] = [
    {
      id: "1",
      user: "system",
      action: "Cloud Sync Successful",
      time: "2 mins ago",
      type: "system",
    },
    {
      id: "2",
      user: "john@example.com",
      action: "User Logged In",
      time: "15 mins ago",
      type: "auth",
    },
    {
      id: "3",
      user: "sarah@safety.com",
      action: "Contact Added",
      time: "1 hour ago",
      type: "auth",
    },
    {
      id: "4",
      user: "admin@safetyapp.com",
      action: "Settings Updated",
      time: "3 hours ago",
      type: "system",
    },
    {
      id: "5",
      user: "mike@help.com",
      action: "SOS Resolved",
      time: "5 hours ago",
      type: "sos",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "auth":
        return "lock-open-outline";
      case "sos":
        return "alert-circle-outline";
      default:
        return "cog-outline";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "auth":
        return "#3498db";
      case "sos":
        return "#e74c3c";
      default:
        return "#7f8c8d";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent System Activity</Text>
      </View>

      <ScrollView style={styles.list} nestedScrollEnabled={true}>
        {logs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: getColor(log.type) + "15" },
              ]}
            >
              <Ionicons
                name={getIcon(log.type) as any}
                size={20}
                color={getColor(log.type)}
              />
            </View>
            <View style={styles.logContent}>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.logUser}>By {log.user}</Text>
            </View>
            <Text style={styles.logTime}>{log.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  list: {
    maxHeight: 400,
  },
  logItem: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  logUser: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  logTime: {
    fontSize: 11,
    color: "#bdc3c7",
  },
});
