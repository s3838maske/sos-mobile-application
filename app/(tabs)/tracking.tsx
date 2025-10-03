import React, { useEffect, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    requestLocationPermission,
    setLocation,
    startLocationTracking,
    stopTracking
} from '../../redux/slices/locationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { startLocationTracking as startLocationService } from '../../services/locationService';
import LocationPermission from '../tracking/components/LocationPermission';
import MapTracker from '../tracking/components/MapTracker';

export default function TrackingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    currentLocation, 
    isTracking, 
    hasPermission, 
    isLoading 
  } = useSelector((state: RootState) => state.location);

  const subscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Request location permission when component mounts
    dispatch(requestLocationPermission());
  }, []);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const handleStartTracking = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      // First start the Redux tracking
      await dispatch(startLocationTracking(user.uid)).unwrap();
      
      // Then start the continuous location service
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
      Alert.alert(
        'Tracking Started',
        'Your location is now being shared with emergency contacts.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Tracking Error:', error);
      Alert.alert(
        'Error',
        'Failed to start tracking. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStopTracking = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
    dispatch(stopTracking());
    Alert.alert(
      'Tracking Stopped',
      'Your location is no longer being shared.',
      [{ text: 'OK' }]
    );
  };

  if (!hasPermission) {
    return <LocationPermission />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Tracking</Text>
        <Text style={styles.subtitle}>
          Share your location with emergency contacts
        </Text>
      </View>

      {/* Current Location Info */}
      <View style={styles.locationInfo}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        {currentLocation ? (
          <View style={styles.locationDetails}>
            <Text style={styles.coordinateText}>
              Latitude: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinateText}>
              Longitude: {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracyText}>
              Accuracy: {currentLocation.accuracy?.toFixed(0)}m
            </Text>
            <Text style={styles.timestampText}>
              Last Updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        ) : (
          <Text style={styles.noLocationText}>
            Location not available
          </Text>
        )}
      </View>

      {/* Map Display */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Location Map</Text>
        <MapTracker 
          location={currentLocation} 
          isTracking={isTracking}
        />
      </View>

      {/* Tracking Controls */}
      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>Tracking Controls</Text>
        
        <TouchableOpacity
          style={[
            styles.trackingButton,
            isTracking ? styles.stopButton : styles.startButton
          ]}
          onPress={isTracking ? handleStopTracking : handleStartTracking}
          disabled={isLoading}
        >
          <Text style={[
            styles.trackingButtonText,
            isTracking ? styles.stopButtonText : styles.startButtonText
          ]}>
            {isLoading ? 'Loading...' : isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.trackingDescription}>
          {isTracking 
            ? 'Your location is being continuously shared with emergency contacts. This helps them know your whereabouts in case of an emergency.'
            : 'Enable live tracking to automatically share your location with emergency contacts. This feature helps ensure your safety.'
          }
        </Text>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacySection}>
        <Text style={styles.privacyTitle}>Privacy Notice</Text>
        <Text style={styles.privacyText}>
          • Your location is only shared with your emergency contacts{'\n'}
          • Location data is stored securely and encrypted{'\n'}
          • You can stop tracking at any time{'\n'}
          • Location data is automatically deleted after 24 hours
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  locationDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  noLocationText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  controlsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trackingButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButtonText: {
    color: '#ffffff',
  },
  stopButtonText: {
    color: '#ffffff',
  },
  trackingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  privacySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});
