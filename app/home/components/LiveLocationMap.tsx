import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { LocationData } from '../../../redux/types';

interface LiveLocationMapProps {
  location: LocationData | null;
  permissionGranted: boolean;
}

export default function LiveLocationMap({ location, permissionGranted }: LiveLocationMapProps) {
  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Ionicons name="location-outline" size={40} color="#bdc3c7" />
          <Text style={styles.placeholderText}>
            Location permission required
          </Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Ionicons name="location-outline" size={40} color="#bdc3c7" />
          <Text style={styles.placeholderText}>
            Getting your location...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={50} color="#3498db" />
          <Text style={styles.mapText}>Live Location Map</Text>
          <Text style={styles.coordinatesText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.accuracyText}>
            Accuracy: {location.accuracy.toFixed(0)}m
          </Text>
        </View>
      </View>
      
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name="location" size={16} color="#27ae60" />
          <Text style={styles.statusText}>Live Tracking</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="time" size={16} color="#3498db" />
          <Text style={styles.statusText}>
            {new Date(location.timestamp).toLocaleTimeString()}
          </Text>
        </View>
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#2c3e50',
  },
});
