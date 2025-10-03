import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { signOutUser } from '../../redux/slices/authSlice';
import { getCurrentLocation, requestLocationPermission } from '../../redux/slices/locationSlice';
import { logSOSEvent, setSOSActive } from '../../redux/slices/sosSlice';
import { AppDispatch, RootState } from '../../redux/store';
import LiveLocationMap from './components/LiveLocationMap';
import NearbyHelpCenters from './components/NearbyHelpCenters';
import SOSButton from './components/SOSButton';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isActive: sosActive } = useSelector((state: RootState) => state.sos);
  const { currentLocation, permissionGranted } = useSelector((state: RootState) => state.location);

  const [shakeEnabled, setShakeEnabled] = useState(true);

  useEffect(() => {
    // Request location permission on mount
    dispatch(requestLocationPermission());
    
    // Get initial location
    dispatch(getCurrentLocation());

    // Setup shake detection only on mobile platforms
    if (shakeEnabled && Platform.OS !== 'web') {
      Accelerometer.setUpdateInterval(100);
      const subscription = Accelerometer.addListener(handleShake);
      return () => subscription?.remove();
    }
  }, [shakeEnabled]);

  const handleShake = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    if (acceleration > 2.5) {
      handleSOSPress();
    }
  };

  const handleSOSPress = async () => {
    try {
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationString = `${location.coords.latitude}, ${location.coords.longitude}`;
      
      // Create SOS event
          const sosEvent = {
            userId: user?.uid || '',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || 0,
            },
            message: `SOS ALERT: ${user?.name} needs immediate help at ${locationString}. Time: ${new Date().toLocaleString()}`,
            timestamp: new Date().toISOString(),
          };

      // Log to Firestore
      await dispatch(logSOSEvent(sosEvent)).unwrap();
      
      // Send SMS to emergency contacts
      if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
        const phoneNumbers = user.emergencyContacts.map(contact => contact.phone);
        const isAvailable = await SMS.isAvailableAsync();
        
        if (isAvailable) {
          await SMS.sendSMSAsync(phoneNumbers, sosEvent.message);
        }
      }

      // Send SMS to helpline (112)
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(['112'], sosEvent.message);
      }

      Alert.alert(
        'SOS Alert Sent!',
        'Emergency contacts and helpline have been notified with your location.',
        [{ text: 'OK', onPress: () => dispatch(setSOSActive(true)) }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS alert. Please try again.');
      console.error('SOS Error:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            dispatch(signOutUser());
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const toggleShakeDetection = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Shake Detection',
        'Shake detection is only available on mobile devices.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShakeEnabled(!shakeEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* SOS Button */}
        <View style={styles.sosSection}>
          <SOSButton 
            onPress={handleSOSPress}
            isActive={sosActive}
          />
          <Text style={styles.sosText}>
            {sosActive ? 'SOS ACTIVE - Help is on the way!' : 'Press and hold for SOS'}
          </Text>
        </View>

        {/* Location Map */}
        <View style={styles.mapSection}>
          <LiveLocationMap 
            location={currentLocation}
            permissionGranted={permissionGranted}
          />
        </View>

        {/* Nearby Help Centers */}
        <View style={styles.helpSection}>
          <NearbyHelpCenters 
            userLocation={currentLocation}
          />
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={toggleShakeDetection}
          >
            <Ionicons 
              name={shakeEnabled ? "phone-portrait" : "phone-portrait-outline"} 
              size={20} 
              color="#2c3e50" 
            />
            <Text style={styles.settingText}>
              Shake Detection: {Platform.OS === 'web' ? 'Not Available' : (shakeEnabled ? 'ON' : 'OFF')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sosText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },
  mapSection: {
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  helpSection: {
    marginBottom: 20,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
});
