import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LocationData } from '../../../redux/types';

interface MapTrackerProps {
  location: LocationData | null;
  isTracking: boolean;
}

export default function MapTracker({ location, isTracking }: MapTrackerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons 
          name="map" 
          size={60} 
          color={isTracking ? "#27ae60" : "#bdc3c7"} 
        />
        <Text style={styles.mapTitle}>
          {isTracking ? 'Live Location Tracking' : 'Location Tracking'}
        </Text>
        
        {location ? (
          <>
            <Text style={styles.coordinatesText}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracyText}>
              Accuracy: {location.accuracy.toFixed(0)}m
            </Text>
            <View style={styles.trackingStatus}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isTracking ? '#27ae60' : '#e74c3c' }
              ]} />
              <Text style={styles.statusText}>
                {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noLocationText}>
            Getting your location...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  accuracyText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
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
  noLocationText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 15,
    textAlign: 'center',
  },
});
