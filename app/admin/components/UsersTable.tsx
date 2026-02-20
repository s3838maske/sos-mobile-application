import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { deleteUserAccount } from "../../../redux/slices/authSlice";
import { AppDispatch } from "../../../redux/store";
import { User } from "../../../redux/types";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
}

export default function UsersTable({ users, isLoading }: UsersTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}? This will remove their record from the database.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteUserAccount(user.uid)).unwrap();
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ],
    );
  };

  const handleToggleAdmin = (user: User) => {
    Alert.alert(
      "Coming Soon",
      "Toggling admin status will be available in the next update.",
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={60} color="#bdc3c7" />
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Registered Users ({users.length})
        </Text>
      </View>

      <ScrollView style={styles.tableContainer} nestedScrollEnabled={true}>
        {users.map((user) => (
          <View key={user.uid} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{user.name}</Text>
                {user.email === "admin@safetyapp.com" && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone || "No phone"}</Text>
              <Text style={styles.userDate}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.contactsText}>
                Contacts: {user.emergencyContacts?.length || 0}
              </Text>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleAdmin(user)}
              >
                <Ionicons name="shield-outline" size={18} color="#3498db" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(user)}
                disabled={user.email === "admin@safetyapp.com"}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={
                    user.email === "admin@safetyapp.com" ? "#bdc3c7" : "#e74c3c"
                  }
                />
              </TouchableOpacity>
            </View>
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
  tableContainer: {
    maxHeight: 400,
  },
  userCard: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  userPhone: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  userDate: {
    fontSize: 12,
    color: "#bdc3c7",
    marginTop: 4,
  },
  contactsText: {
    fontSize: 12,
    color: "#3498db",
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#f1f2f6",
  },
  deleteButton: {
    // backgroundColor: '#fff5f5',
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#7f8c8d",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 16,
  },
});
