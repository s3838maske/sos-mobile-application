import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import FakeCallUI from "../emergency/components/FakeCallUI";

const EMERGENCY_NUMBERS = {
  police: "112",
  womenHelpline: "1091",
  domesticViolence: "181",
  ambulance: "108",
};

export default function EmergencyScreen() {
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const callerName = "Home";

  const handleEmergencyCall = (number: string, service: string) => {
    Alert.alert(
      `Call ${service}`,
      `Are you sure you want to call ${service} at ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${number}`),
        },
      ],
    );
  };

  const handleFakeCall = () => {
    setFakeCallActive(true);
  };

  if (fakeCallActive) {
    return (
      <FakeCallUI
        callerName={callerName}
        duration="∞"
        onEndCall={() => setFakeCallActive(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Hub</Text>
        <Text style={styles.subtitle}>Instant help and safety tools</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Helplines</Text>
          <View style={styles.grid}>
            {[
              {
                id: "police",
                label: "Police",
                num: "112",
                icon: "shield",
                color: "#34495E",
              },
              {
                id: "women",
                label: "Women",
                num: "1091",
                icon: "woman",
                color: "#8E44AD",
              },
              {
                id: "fire",
                label: "Fire",
                num: "101",
                icon: "flame",
                color: "#E67E22",
              },
              {
                id: "med",
                label: "Ambulance",
                num: "108",
                icon: "medical",
                color: "#27AE60",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.callBtn, { borderLeftColor: item.color }]}
                onPress={() => handleEmergencyCall(item.num, item.label)}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <View>
                  <Text style={styles.callLabel}>{item.label}</Text>
                  <Text style={styles.callNum}>{item.num}</Text>
                </View>
                <Ionicons
                  name="call"
                  size={18}
                  color={COLORS.primary}
                  style={styles.callIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.fakeCallCard} onPress={handleFakeCall}>
          <View style={styles.fakeCallHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SMART TOOL</Text>
            </View>
            <Ionicons name="call" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.fakeCallTitle}>Simulate Fake Call</Text>
          <Text style={styles.fakeCallDesc}>
            Need an excuse to leave? Activate a realistic incoming call
            instantly.
          </Text>
          <View style={styles.fakeCallBtn}>
            <Text style={styles.fakeCallBtnText}>Activate Now</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Protocols</Text>
          {[
            { icon: "flashlight", text: "Keep your phone charged above 20%" },
            { icon: "walk", text: "Walk in well-lit areas at night" },
            { icon: "share-social", text: "Share your route with a friend" },
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons
                name={tip.icon as any}
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>
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
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "800",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    marginLeft: 5,
  },
  grid: {
    gap: 12,
  },
  callBtn: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    ...SHADOWS.light,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  callLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  callNum: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  callIcon: {
    marginLeft: "auto",
  },
  fakeCallCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
    padding: 25,
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  fakeCallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  fakeCallTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fakeCallDesc: {
    color: COLORS.white,
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  fakeCallBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
  },
  fakeCallBtnText: {
    color: COLORS.secondary,
    fontWeight: "bold",
    fontSize: 15,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
});
