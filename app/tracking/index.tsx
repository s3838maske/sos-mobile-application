import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentLocation,
  requestLocationPermission,
  setLocation,
  startLocationTracking,
  stopTracking
} from '../../redux/slices/locationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { startLocationTracking as startLocationService } from '../../services/locationService';
import LocationPermission from './components/LocationPermission';
import MapTracker from './components/MapTracker';

export default function TrackingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    currentLocation, 
    isTracking, 
    permissionGranted, 
    error 
  } = useSelector((state: RootState) => state.location);

  const [isEnabled, setIsEnabled] = useState(isTracking);
  const subscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Request permission on mount
    dispatch(requestLocationPermission());
  }, []);

  useEffect(() => {
    if (permissionGranted && !currentLocation) {
      dispatch(getCurrentLocation());
    }
  }, [permissionGranted]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const handleToggleTracking = async () => {
    if (!permissionGranted) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to enable tracking. Please grant permission in settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to enable tracking');
      return;
    }

    try {
      if (isEnabled) {
        // Stop tracking
        if (subscriptionRef.current) {
          subscriptionRef.current();
          subscriptionRef.current = null;
        }
        dispatch(stopTracking());
        setIsEnabled(false);
        Alert.alert('Tracking Stopped', 'Location tracking has been disabled');
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
            console.error('Location tracking error:', error);
            Alert.alert('Tracking Error', 'Location tracking encountered an error.');
          }
        );
        
        subscriptionRef.current = cleanup;
        setIsEnabled(true);
        Alert.alert('Tracking Started', 'Location tracking is now active');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle tracking');
      console.error('Tracking error:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await dispatch(requestLocationPermission()).unwrap();
    } catch (error) {
      Alert.alert('Permission Denied', 'Location permission is required for tracking');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Tracking</Text>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isEnabled ? '#27ae60' : '#e74c3c' }
          ]} />
          <Text style={styles.statusText}>
            {isEnabled ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {!permissionGranted ? (
          <LocationPermission onRequestPermission={handleRequestPermission} />
        ) : (
          <>
            {/* Tracking Controls */}
            <View style={styles.controlsSection}>
              <View style={styles.controlItem}>
                <View style={styles.controlInfo}>
                  <Ionicons name="location" size={24} color="#2c3e50" />
                  <View style={styles.controlText}>
                    <Text style={styles.controlTitle}>Live Tracking</Text>
                    <Text style={styles.controlDescription}>
                      {isEnabled 
                        ? 'Your location is being tracked and shared with emergency contacts'
                        : 'Enable to start sharing your location with emergency contacts'
                      }
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggleTracking}
                  trackColor={{ false: '#bdc3c7', true: '#27ae60' }}
                  thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Map Display */}
            <View style={styles.mapSection}>
              <MapTracker 
                location={currentLocation}
                isTracking={isEnabled}
              />
            </View>

            {/* Location Info */}
            {currentLocation && (
              <View style={styles.locationInfo}>
                <Text style={styles.infoTitle}>Current Location</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>
                    Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>
                    Accuracy: {currentLocation.accuracy.toFixed(0)} meters
                  </Text>
                </View>
              </View>
            )}

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-outline" size={20} color="#3498db" />
              <Text style={styles.privacyText}>
                Your location data is encrypted and only shared with your emergency contacts during SOS situations.
              </Text>
            </View>
          </>
        )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  controlsSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controlText: {
    marginLeft: 15,
    flex: 1,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  controlDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  mapSection: {
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  locationInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  privacyText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
