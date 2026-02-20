import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { User } from "../../../redux/types";

interface EmergencyContactsTableProps {
  users: User[];
  isLoading: boolean;
}

export default function EmergencyContactsTable({
  users,
  isLoading,
}: EmergencyContactsTableProps) {
  // Flatten all contacts from all users
  const allContacts = users.flatMap((user) =>
    (user.emergencyContacts || []).map((contact) => ({
      ...contact,
      ownerName: user.name,
      ownerEmail: user.email,
      userId: user.uid,
    })),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading secondary contacts...</Text>
      </View>
    );
  }

  if (allContacts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="call-outline" size={60} color="#bdc3c7" />
        <Text style={styles.emptyText}>No emergency contacts found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          All Emergency Contacts ({allContacts.length})
        </Text>
      </View>

      <ScrollView style={styles.tableContainer} nestedScrollEnabled={true}>
        {allContacts.map((contact, index) => (
          <View key={`${contact.userId}-${index}`} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.relationBadge}>
                  <Text style={styles.relationText}>{contact.relation}</Text>
                </View>
              </View>
              <Text style={styles.contactPhone}>{contact.phone}</Text>

              <View style={styles.ownerInfo}>
                <Ionicons
                  name="person-circle-outline"
                  size={12}
                  color="#7f8c8d"
                />
                <Text style={styles.ownerText}>
                  Owned by:{" "}
                  <Text style={styles.boldText}>{contact.ownerName}</Text> (
                  {contact.ownerEmail})
                </Text>
              </View>
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
    maxHeight: 450,
  },
  contactCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  contactInfo: {
    width: "100%",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginRight: 8,
  },
  relationBadge: {
    backgroundColor: "#3498db",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  relationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  contactPhone: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "600",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f8f9fa",
  },
  ownerText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  boldText: {
    fontWeight: "bold",
    color: "#2c3e50",
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
