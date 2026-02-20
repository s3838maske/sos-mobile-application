import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalAlerts, setGlobalAlerts] = useState(true);
  const [shakeSensitivity, setShakeSensitivity] = useState("Medium");

  const handleSave = () => {
    Alert.alert(
      "Settings Updated",
      "System configurations have been saved successfully.",
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global App State</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Maintenance Mode</Text>
            <Text style={styles.settingDesc}>
              Restrict app access for maintenance
            </Text>
          </View>
          <Switch
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            trackColor={{ false: "#767577", true: "#e74c3c" }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Global SOS Alerts</Text>
            <Text style={styles.settingDesc}>
              Enable/Disable SMS sending worldwide
            </Text>
          </View>
          <Switch
            value={globalAlerts}
            onValueChange={setGlobalAlerts}
            trackColor={{ false: "#767577", true: "#e74c3c" }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Thresholds</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Alert.alert("Sensitivity", "Configure shake threshold...")
          }
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Standard Shake Sensitivity</Text>
            <Text style={styles.settingDesc}>
              Default setting for new users
            </Text>
          </View>
          <Text style={styles.settingValue}>{shakeSensitivity}</Text>
          <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Access</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Admin PIN Protection</Text>
            <Text style={styles.settingDesc}>
              Require PIN to open Admin Panel
            </Text>
          </View>
          <Text style={styles.settingValue}>Disabled</Text>
          <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Apply Changes</Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert("Warning", "This will wipe all test SOS events.")
          }
        >
          <Text style={styles.dangerButtonText}>Clear All SOS Logs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: "#3498db",
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dangerZone: {
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#feb2b2",
    marginBottom: 30,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#c53030",
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: "#c53030",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
