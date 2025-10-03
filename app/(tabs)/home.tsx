import { router } from "expo-router";
import { Accelerometer } from "expo-sensors";
import * as SMS from "expo-sms";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "../../redux/slices/authSlice";
import {
  getCurrentLocation,
  setLocation,
  startLocationTracking,
  stopTracking,
} from "../../redux/slices/locationSlice";
import { logSOSEvent } from "../../redux/slices/sosSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { startLocationTracking as startLocationService } from "../../services/locationService";
import LiveLocationMap from "../home/components/LiveLocationMap";
import SOSButton from "../home/components/SOSButton";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentLocation, isTracking } = useSelector(
    (state: RootState) => state.location
  );
  const { isActive } = useSelector((state: RootState) => state.sos);

  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const locationSubscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Request location permission and get current location
    // dispatch(getCurrentLocation());
  }, []);

  // Cleanup location subscription on unmount
  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current();
        locationSubscriptionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (shakeEnabled) {
      const sub = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        // Simple shake detection (threshold can be adjusted)
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
      if (subscription) {
        subscription.remove();
      }
    };
  }, [shakeEnabled]);

  const handleSOSPress = async () => {
    try {
      // Get current location
      const locationResult = await dispatch(getCurrentLocation());

      if (locationResult.payload) {
        const location = locationResult.payload as any;

        // Log SOS event to Firestore
        await dispatch(
          logSOSEvent({
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
            },
            message: "Emergency SOS activated",
            timestamp: new Date().toISOString(),
          })
        );

        // Send SMS to emergency contacts
        if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            const emergencyNumbers = user.emergencyContacts.map(
              (contact) => contact.phone
            );
            const message = `EMERGENCY SOS ALERT!\n\nUser: ${
              user.name
            }\nLocation: ${location.latitude}, ${
              location.longitude
            }\nTime: ${new Date().toLocaleString()}\n\nPlease help immediately!`;

            await SMS.sendSMSAsync(emergencyNumbers, message);
          }
        }

        Alert.alert(
          "SOS Activated",
          "Emergency contacts have been notified and your location has been shared.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("SOS Error:", error);
      Alert.alert("Error", "Failed to activate SOS. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const toggleTracking = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      if (isTracking) {
        // Stop tracking
        if (locationSubscriptionRef.current) {
          locationSubscriptionRef.current();
          locationSubscriptionRef.current = null;
        }
        dispatch(stopTracking());
        Alert.alert(
          "Tracking Stopped",
          "Live location tracking has been stopped."
        );
      } else {
        // Start tracking
        await dispatch(startLocationTracking(user.uid)).unwrap();

        // Start continuous location service
        const cleanup = await startLocationService(
          (location) => {
            // Update Redux state with new location
            dispatch(setLocation(location));
          },
          (error) => {
            console.error("Location tracking error:", error);
            Alert.alert(
              "Tracking Error",
              "Location tracking encountered an error."
            );
          }
        );

        locationSubscriptionRef.current = cleanup;
        Alert.alert(
          "Tracking Started",
          "Live location tracking has been started."
        );
      }
    } catch (error) {
      console.error("Tracking Error:", error);
      Alert.alert("Error", "Failed to toggle tracking. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOutUser()).unwrap();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}!</Text>
            <Text style={styles.subtitle}>Your safety is our priority</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SOS Button */}
      <View style={styles.sosSection}>
        <SOSButton isActive={isActive} onPress={handleSOSPress} />
        <Text style={styles.sosText}>
          Press the button or shake your device to activate SOS
        </Text>
      </View>

      {/* Shake Detection Toggle */}
      <View style={styles.toggleSection}>
        <Text style={styles.toggleLabel}>Enable Shake Detection</Text>
        <Switch
          value={shakeEnabled}
          onValueChange={setShakeEnabled}
          trackColor={{ false: "#767577", true: "#e74c3c" }}
          thumbColor={shakeEnabled ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      {/* Live Location Map */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <LiveLocationMap location={currentLocation} permissionGranted={true} />
      </View>

      {/* Location Tracking Toggle */}
      <View style={styles.trackingSection}>
        <View style={styles.trackingHeader}>
          <Text style={styles.sectionTitle}>Live Tracking</Text>
          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking && styles.trackingButtonActive,
            ]}
            onPress={toggleTracking}
          >
            <Text
              style={[
                styles.trackingButtonText,
                isTracking && styles.trackingButtonTextActive,
              ]}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.trackingDescription}>
          {isTracking
            ? "Your location is being shared with emergency contacts"
            : "Enable live tracking to share your location with emergency contacts"}
        </Text>
      </View>

      {/* Nearby Help Centers */}
      <View style={styles.helpSection}>
        <Text style={styles.sectionTitle}>Nearby Help Centers</Text>
        {/* <NearbyHelpCenters /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#e74c3c",
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.9,
  },
  sosSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#ffffff",
    margin: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sosText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 15,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  mapSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  trackingSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  trackingButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackingButtonActive: {
    backgroundColor: "#27ae60",
  },
  trackingButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  trackingButtonTextActive: {
    color: "#ffffff",
  },
  trackingDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
