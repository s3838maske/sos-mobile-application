import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../../utils/theme";

interface LocationPermissionProps {
  onRequestPermission: () => void;
}

export default function LocationPermission({
  onRequestPermission,
}: LocationPermissionProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Ionicons name="location" size={40} color={COLORS.white} />
        <Text style={styles.title}>Location Required</Text>
        <Text style={styles.subtitle}>Help us keep you safe</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={50}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.cardTitle}>Why we need this?</Text>
          <Text style={styles.description}>
            SOS Guard uses your location to provide critical safety features
            during emergencies.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="flash" size={20} color={COLORS.success} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Instant SOS</Text>
                <Text style={styles.featureDesc}>
                  Sends your exact coordinates to responders.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="walk" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Live Journey</Text>
                <Text style={styles.featureDesc}>
                  Let loved ones track your way home.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="medkit" size={20} color={COLORS.warning} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Nearby Help</Text>
                <Text style={styles.featureDesc}>
                  Locate the nearest police or hospitals.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.grantButton}
          onPress={onRequestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.grantButtonText}>Grant Permission</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your location data is end-to-end encrypted and never shared with third
          parties.
        </Text>
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
    backgroundColor: COLORS.primary,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
    marginTop: 15,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    marginTop: -30,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    ...SHADOWS.heavy,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  featureList: {
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  grantButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 30,
    ...SHADOWS.medium,
  },
  grantButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  privacyNote: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
