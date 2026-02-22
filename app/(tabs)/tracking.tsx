import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentLocation,
  requestLocationPermission,
  setLocation,
  startLocationTracking,
  stopTracking,
} from "../../redux/slices/locationSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { startLocationTracking as startLocationService } from "../../services/locationService";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import LocationPermission from "../tracking/components/LocationPermission";
import MapTracker from "../tracking/components/MapTracker";

export default function TrackingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentLocation, isTracking, permissionGranted, isLoading } =
    useSelector((state: any) => state.location);

  const subscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    dispatch(requestLocationPermission());
  }, []);

  // Update current location every 10 seconds if permission is granted
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (permissionGranted) {
      // Initial fetch
      dispatch(getCurrentLocation());

      // Setup interval
      pollInterval = setInterval(() => {
        dispatch(getCurrentLocation());
      }, 10000); // 10 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [permissionGranted]);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const handleRequestPermission = async () => {
    try {
      await dispatch(requestLocationPermission()).unwrap();
    } catch (error: any) {
      if (error.message === "PERMISSION_DENIED") {
        Alert.alert(
          "Permission Required",
          "SOS Guard needs location access to provide emergency features. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      } else if (error.message === "SERVICES_DISABLED") {
        Alert.alert(
          "GPS Disabled",
          "Your device's location services are turned off. Please turn them on in your phone's quick settings to continue.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Error",
          "An unexpected error occurred while requesting permission.",
        );
      }
    }
  };

  const handleStartTracking = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      // Proactively check permission and services again
      await dispatch(requestLocationPermission()).unwrap();

      await dispatch(startLocationTracking(user.uid)).unwrap();

      const cleanup = await startLocationService(
        (location) => {
          dispatch(setLocation(location));
        },
        (error: any) => {
          console.error("Location tracking error:", error);
          const message =
            error.message === "SERVICES_DISABLED"
              ? "Please turn on your device's location services (GPS) to enable tracking."
              : "Location tracking encountered an error.";
          Alert.alert("Tracking Status", message);
        },
      );

      subscriptionRef.current = cleanup;
      Alert.alert(
        "Tracking Started",
        "Your location is now being shared with emergency contacts.",
        [{ text: "OK" }],
      );
    } catch (error: any) {
      console.error("Tracking Error:", error);
      let errorMessage = "Failed to start tracking. Please try again.";

      if (error.message === "PERMISSION_DENIED") {
        errorMessage =
          "Location permission is required. Please grant it in your phone settings.";
      } else if (error.message === "SERVICES_DISABLED") {
        errorMessage =
          "Please turn on your GPS/Location services to start tracking.";
      }

      Alert.alert("Access Required", errorMessage);
    }
  };

  const handleStopTracking = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
    dispatch(stopTracking());
    Alert.alert(
      "Tracking Stopped",
      "Your location is no longer being shared.",
      [{ text: "OK" }],
    );
  };

  if (!permissionGranted) {
    return <LocationPermission onRequestPermission={handleRequestPermission} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Live Tracking</Text>
        <Text style={styles.subtitle}>
          Continuous location share for safety
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Current Position</Text>
            {isTracking && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {currentLocation ? (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>LATITUDE</Text>
                <Text style={styles.statValue}>
                  {currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>LONGITUDE</Text>
                <Text style={styles.statValue}>
                  {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ACCURACY</Text>
                <Text style={styles.statValue}>
                  {currentLocation.accuracy?.toFixed(0)}m
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>UPDATED</Text>
                <Text style={styles.statValue}>
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noLocationText}>Fetching location data...</Text>
          )}
        </View>

        <View style={styles.mapCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="map" size={24} color={COLORS.secondary} />
            <Text style={styles.cardTitle}>Real-time Map</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapTracker location={currentLocation} isTracking={isTracking} />
          </View>
        </View>

        <View style={styles.controlCard}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isTracking ? styles.stopButton : styles.startButton,
            ]}
            onPress={isTracking ? handleStopTracking : handleStartTracking}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Applying...</Text>
            ) : (
              <>
                <Ionicons
                  name={isTracking ? "stop-circle" : "play-circle"}
                  size={24}
                  color={COLORS.white}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.buttonText}>
                  {isTracking ? "Stop Live Tracking" : "Start Live Tracking"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            {isTracking
              ? "Your location is being continuously shared with your emergency contacts."
              : "Enable this to let your trusted contacts track your journey in real-time."}
          </Text>
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Encryption & Privacy</Text>
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={16} color={COLORS.success} />
            <Text style={styles.privacyText}>
              End-to-end encrypted location logs
            </Text>
          </View>
          <View style={styles.privacyRow}>
            <Ionicons name="people" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>
              Shared only with your designated contacts
            </Text>
          </View>
          <View style={styles.privacyRow}>
            <Ionicons name="time" size={16} color={COLORS.success} />
            <Text style={styles.privacyText}>
              Automatically expires after 24 hours
            </Text>
          </View>
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
    marginTop: -25,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    color: COLORS.danger,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 15,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  noLocationText: {
    color: COLORS.textLight,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  mapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.lightGrey,
  },
  controlCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
    alignItems: "center",
  },
  actionButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.light,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  infoText: {
    marginTop: 15,
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  privacyCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
    padding: 20,
    ...SHADOWS.medium,
  },
  privacyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  privacyText: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 13,
    marginLeft: 10,
  },
  featureText: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 13,
    marginLeft: 10,
  },
});
