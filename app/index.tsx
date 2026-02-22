import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { AppDispatch, RootState } from "../redux/store";
import { isAdminUser } from "../services/authService";
import { auth } from "../services/firebase";
import { getUserProfileOffline, initDatabase } from "../services/sqliteService";

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize SQLite Database
    initDatabase().catch((err) => console.error("SQLite init error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // ... existing online logic
          const { getUserById } = await import("../services/authService");
          const userData = await getUserById(user.uid);

          if (userData) {
            dispatch(setUser(userData));
          } else {
            // Basic fallback
            const newUser = {
              uid: user.uid,
              name: user.displayName || "User",
              email: user.email || "",
              phone: user.phoneNumber || "",
              emergencyContacts: [],
              createdAt: new Date().toISOString(),
            };
            dispatch(setUser(newUser));
          }

          const token = await user.getIdToken();
          await AsyncStorage.setItem("authToken", token);
        } else {
          // Attempt offline load if no user but maybe we have a local session
          const cachedToken = await AsyncStorage.getItem("authToken");
          if (cachedToken) {
            // This is a simplified check. In real app, you might decode token or check expiry
            // For now, let's try to find any offline profile
            // Note: We don't have the UID here easily without decoding.
            // In a real app, you'd store the last user's UID in AsyncStorage
            const lastUid = await AsyncStorage.getItem("lastUserUid");
            if (lastUid) {
              const offlineUser = await getUserProfileOffline(lastUid);
              if (offlineUser) {
                dispatch(setUser(offlineUser));
              }
            }
          } else {
            dispatch(setUser(null));
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user ? isAdminUser(user.email) : false;

  // Navigate after auth state is initialized to avoid flicker and conflicting redirects
  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      if (isAdmin) {
        router.replace("/(tabs)/admin" as any);
      } else {
        router.replace("/(tabs)/home" as any);
      }
    } else {
      router.replace("/auth/login" as any);
    }
  }, [initialized, isAuthenticated, isAdmin]);

  if (isLoading || !initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Women Safety App</Text>
      <Text style={styles.subtitle}>Your safety is our priority</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#2c3e50",
  },
});
