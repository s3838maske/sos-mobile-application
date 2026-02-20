import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SMS from "expo-sms";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  addEmergencyContact,
  changePassword,
  refreshUserData,
  removeEmergencyContact,
  signOutUser,
  updateEmergencyContact,
  updateUserProfile,
} from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { EmergencyContact as EmergencyContactType } from "../../redux/types";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import EmergencyContacts from "../profile/components/EmergencyContacts";
import ProfileCard from "../profile/components/ProfileCard";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    location: "Checking...",
    sms: "Checking...",
  });

  const checkPermissions = async () => {
    const { status: locStatus } =
      await Location.getForegroundPermissionsAsync();
    const smsStatus = await SMS.isAvailableAsync();
    setPermissions({
      location: locStatus === "granted" ? "Granted" : "Denied",
      sms: smsStatus ? "Available" : "Unavailable",
    });
  };

  useEffect(() => {
    if (user?.uid) {
      dispatch(refreshUserData(user.uid));
      checkPermissions();
    }
  }, []);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      if (user) {
        await dispatch(updateUserProfile({ ...user, ...updatedData })).unwrap();
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleAddEmergencyContact = async (contact: EmergencyContactType) => {
    try {
      if (user?.uid) {
        await dispatch(
          addEmergencyContact({ userId: user.uid, contact }),
        ).unwrap();
        Alert.alert("Success", "Emergency contact added!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add contact.");
    }
  };

  const handleRemoveEmergencyContact = async (index: number) => {
    try {
      if (user?.uid) {
        await dispatch(
          removeEmergencyContact({ userId: user.uid, contactIndex: index }),
        ).unwrap();
        Alert.alert("Success", "Contact removed!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to remove contact.");
    }
  };

  const handleUpdateEmergencyContact = async (
    index: number,
    updatedContact: EmergencyContactType,
  ) => {
    try {
      if (user?.uid) {
        await dispatch(
          updateEmergencyContact({
            userId: user.uid,
            contactIndex: index,
            contact: updatedContact,
          }),
        ).unwrap();
        Alert.alert("Success", "Contact updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update contact.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Success", "Password updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(signOutUser()).unwrap();
            router.replace("/auth/login");
          } catch (error) {
            Alert.alert("Error", "Failed to logout.");
          }
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>My Profile</Text>
            <Text style={styles.statusText}>{user.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutIconButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.profileCardWrapper}>
          <ProfileCard
            user={user}
            isEditing={isEditing}
            onUpdate={handleSaveProfile}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowEmergencyContacts(true)}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ margin: 20 }}
            />
          ) : user.emergencyContacts && user.emergencyContacts.length > 0 ? (
            user.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={styles.contactIconCircle}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Remove", `Remove ${contact.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => handleRemoveEmergencyContact(index),
                      },
                    ]);
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.danger}
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No contacts added yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={20} color={COLORS.accent} />
              <Text style={styles.settingLabel}>Location Access</Text>
            </View>
            <Text
              style={[
                styles.statusBadge,
                permissions.location === "Granted"
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
            >
              {permissions.location}
            </Text>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="chatbox-ellipses"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.settingLabel}>SMS Services</Text>
            </View>
            <Text
              style={[
                styles.statusBadge,
                permissions.sms === "Available"
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
            >
              {permissions.sms}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowChangePassword(true)}
        >
          <View style={styles.menuInfo}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: COLORS.secondary + "15" },
              ]}
            >
              <Ionicons name="lock-closed" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuLabel}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>Version 1.2.0 • Build 241003</Text>
        </View>
      </ScrollView>

      <Modal visible={showChangePassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowChangePassword(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.saveBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEmergencyContacts} transparent animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.fullModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Contacts</Text>
              <TouchableOpacity onPress={() => setShowEmergencyContacts(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <EmergencyContacts
              contacts={user.emergencyContacts || []}
              isEditing={true}
              onAdd={handleAddEmergencyContact}
              onRemove={handleRemoveEmergencyContact}
              onUpdate={handleUpdateEmergencyContact}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 80,
    paddingBottom: 70,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 2,
    ...SHADOWS.medium,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontWeight: "800",
    color: COLORS.white,
  },
  statusText: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 5,
    fontWeight: "600",
  },
  logoutIconButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
    elevation: 8,
  },
  profileCardWrapper: {
    marginTop: -20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  contactRelation: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
  statusSuccess: {
    backgroundColor: COLORS.success + "15",
    color: COLORS.success,
  },
  statusError: {
    backgroundColor: COLORS.danger + "15",
    color: COLORS.danger,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  footerInfo: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 25,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 25,
    ...SHADOWS.heavy,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelBtn: {
    padding: 12,
    marginRight: 15,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  fullModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  fullModalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "90%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
