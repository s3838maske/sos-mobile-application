import { Ionicons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import * as SMS from "expo-sms";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentLocation,
  setLocation,
  startLocationTracking,
  stopTracking,
} from "../../redux/slices/locationSlice";
import { logSOSEvent, updateSOSStatus } from "../../redux/slices/sosSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { startLocationTracking as startLocationService } from "../../services/locationService";
import { saveSOSLogOffline } from "../../services/sqliteService";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import LiveLocationMap from "../home/components/LiveLocationMap";
import NearbyHelpCenters from "../home/components/NearbyHelpCenters";
import SOSButton from "../home/components/SOSButton";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentLocation, isTracking } = useSelector(
    (state: RootState) => state.location,
  );
  const { isActive, events } = useSelector((state: RootState) => state.sos);

  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [sosLoading, setSosLoading] = useState(false);
  const locationSubscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    dispatch(getCurrentLocation());
  }, []);

  useEffect(() => {
    if (shakeEnabled) {
      const sub = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 2.5) {
          handleSOSPress();
        }
      });
      Accelerometer.setUpdateInterval(100);
      setSubscription(sub);
    } else {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [shakeEnabled]);

  const handleSOSPress = async () => {
    try {
      setSosLoading(true);

      if (isActive) {
        const activeEvent = events.find((e) => e.status === "active");
        if (activeEvent) {
          await dispatch(
            updateSOSStatus({ eventId: activeEvent.id, status: "resolved" }),
          ).unwrap();
          Alert.alert("SOS Deactivated", "Your active SOS has been resolved.");
        }
        return;
      }

      const locationResult = await dispatch(getCurrentLocation());

      if (locationResult.payload) {
        const location = locationResult.payload as any;
        const { latitude, longitude } = location;

        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const message = `Help! I am in danger.\nMy location: ${mapsLink}`;

        const eventData = {
          id: Date.now().toString(),
          location: {
            latitude,
            longitude,
            accuracy: location.accuracy,
            timestamp: new Date().toISOString(),
          },
          message: "Emergency SOS activated",
          timestamp: new Date().toISOString(),
          userId: user?.uid || "offline_user",
          userName: user?.name || "User",
          status: "active" as const,
        };

        try {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            const emergencyNumbers = user?.emergencyContacts?.length
              ? user.emergencyContacts.map((contact: any) => contact.phone)
              : ["112"];
            await SMS.sendSMSAsync(emergencyNumbers, message);
          }
        } catch (smsError) {
          console.error("SMS Error:", smsError);
        }

        try {
          await dispatch(logSOSEvent(eventData)).unwrap();
        } catch (error) {
          saveSOSLogOffline(eventData);
        }

        Alert.alert("SOS Activated", "Alerts sent to your emergency contacts.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to activate SOS.");
    } finally {
      setSosLoading(false);
    }
  };

  const toggleTracking = async () => {
    if (!user?.uid) return;
    try {
      if (isTracking) {
        if (locationSubscriptionRef.current) {
          locationSubscriptionRef.current();
          locationSubscriptionRef.current = null;
        }
        dispatch(stopTracking());
      } else {
        await dispatch(startLocationTracking(user.uid)).unwrap();
        const cleanup = await startLocationService(
          (loc) => dispatch(setLocation(loc)),
          (err) => console.error("Tracking error:", err),
        );
        locationSubscriptionRef.current = cleanup;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle tracking.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>
              Hello, {user?.name?.split(" ")[0] || "User"}
            </Text>
            <Text style={styles.statusText}>
              {isActive ? "🔴 Emergency Active" : "🟢 You are safe"}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={45} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* SOS Card */}
        <View style={[styles.card, styles.sosCard]}>
          <Text style={styles.cardTitle}>Emergency SOS</Text>
          <View style={styles.sosContainer}>
            {sosLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ margin: 50 }}
              />
            ) : (
              <SOSButton isActive={isActive} onPress={handleSOSPress} />
            )}
          </View>
          <Text style={styles.cardFooter}>
            Hold for 3 seconds or shake your phone
          </Text>
        </View>

        {/* Quick Toggles */}
        <View style={styles.row}>
          <View style={[styles.smallCard, { flex: 1, marginRight: 10 }]}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="hand-right" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.smallCardTitle}>Shake SOS</Text>
            <Switch
              value={shakeEnabled}
              onValueChange={setShakeEnabled}
              trackColor={{ false: COLORS.grey, true: COLORS.primary }}
              thumbColor={COLORS.white}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>

          <View style={[styles.smallCard, { flex: 1, marginLeft: 10 }]}>
            <View
              style={[
                styles.cardIconContainer,
                { backgroundColor: COLORS.success + "20" },
              ]}
            >
              <Ionicons name="navigate" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.smallCardTitle}>Live Tracking</Text>
            <Switch
              value={isTracking}
              onValueChange={toggleTracking}
              trackColor={{ false: COLORS.grey, true: COLORS.success }}
              thumbColor={COLORS.white}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Map Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Location</Text>
            <TouchableOpacity onPress={() => dispatch(getCurrentLocation())}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <LiveLocationMap
              location={currentLocation}
              permissionGranted={true}
            />
          </View>
        </View>

        {/* Safety Tips Card */}
        <View style={[styles.card, { backgroundColor: COLORS.secondary }]}>
          <Text style={[styles.cardTitle, { color: COLORS.white }]}>
            Safety Points
          </Text>
          <View style={styles.tipRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.success}
            />
            <Text style={styles.tipText}>
              Keep your location shared with family.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.success}
            />
            <Text style={styles.tipText}>
              Always check nearby help centers.
            </Text>
          </View>
        </View>

        {/* Nearby Help Centers */}
        <NearbyHelpCenters userLocation={currentLocation} />
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  profileButton: {
    padding: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  sosCard: {
    minHeight: 280,
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
  },
  sosContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  cardFooter: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  smallCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    ...SHADOWS.light,
  },
  cardIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  tipText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 10,
    opacity: 0.9,
  },
});
