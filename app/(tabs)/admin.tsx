import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../redux/slices/authSlice";
import { fetchSOSEvents } from "../../redux/slices/sosSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { isAdminUser } from "../../services/authService";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import ActivityLogsTable from "../admin/components/ActivityLogsTable";
import EmergencyContactsTable from "../admin/components/EmergencyContactsTable";
import HeatmapView from "../admin/components/HeatmapView";
import SOSLogsTable from "../admin/components/SOSLogsTable";
import SystemSettings from "../admin/components/SystemSettings";
import UsersTable from "../admin/components/UsersTable";

type AdminTab =
  | "users"
  | "alerts"
  | "contacts"
  | "activity"
  | "heatmap"
  | "settings";

export default function AdminScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    user,
    allUsers,
    isLoading: authLoading,
  } = useSelector((state: RootState) => state.auth);
  const { events, isLoading: sosLoading } = useSelector(
    (state: RootState) => state.sos,
  );
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchSOSEvents(100)).unwrap(),
        dispatch(fetchAllUsers()).unwrap(),
      ]);
    } catch (error) {
      console.error("Data loading error:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const isAdmin = user ? isAdminUser(user.email) : false;

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={80} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Authorized administrators only.</Text>
        </View>
      </View>
    );
  }

  const stats = {
    totalUsers: allUsers?.length || 0,
    activeSOS: (events || []).filter((e) => e.status === "active").length,
    totalContacts:
      allUsers?.reduce(
        (acc, curr) => acc + (curr.emergencyContacts?.length || 0),
        0,
      ) || 0,
    todaySOS: (events || []).filter(
      (e) => new Date(e.timestamp).toDateString() === new Date().toDateString(),
    ).length,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersTable users={allUsers || []} isLoading={authLoading} />;
      case "alerts":
        return <SOSLogsTable events={events || []} isLoading={sosLoading} />;
      case "contacts":
        return (
          <EmergencyContactsTable
            users={allUsers || []}
            isLoading={authLoading}
          />
        );
      case "activity":
        return <ActivityLogsTable />;
      case "heatmap":
        return <HeatmapView events={events || []} />;
      case "settings":
        return <SystemSettings />;
      default:
        return null;
    }
  };

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "users", label: "Users", icon: "people" },
    { id: "alerts", label: "History", icon: "list" },
    { id: "contacts", label: "Contacts", icon: "call" },
    { id: "activity", label: "Pulse", icon: "pulse" },
    { id: "heatmap", label: "Map", icon: "map" },
    { id: "settings", label: "Config", icon: "settings" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>System Monitoring & Oversight</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.danger }]}>
              {stats.activeSOS}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.totalContacts}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.todaySOS}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                activeTab === tab.id && styles.activeTabBtn,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? COLORS.white : COLORS.textLight}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.tabContentWrapper}>{renderTabContent()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "800",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.7,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: "uppercase",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.lightGrey,
  },
  tabsWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  tabsContainer: {
    paddingHorizontal: 20,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 2,
    ...SHADOWS.light,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textLight,
    marginLeft: 8,
  },
  activeTabLabel: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  tabContentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.danger,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 10,
  },
});
