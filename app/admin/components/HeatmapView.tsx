import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SOSEvent } from '../../../redux/types';

interface HeatmapViewProps {
  events: SOSEvent[];
}

export default function HeatmapView({ events }: HeatmapViewProps) {
  // Group events by location for heatmap visualization
  const locationGroups = events.reduce((acc, event) => {
    const key = `${event.latitude.toFixed(3)},${event.longitude.toFixed(3)}`;
    if (!acc[key]) {
      acc[key] = {
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        count: 0,
        events: [],
      };
    }
    acc[key].count++;
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, any>);

  const sortedLocations = Object.values(locationGroups)
    .sort((a: any, b: any) => b.count - a.count);

  const getIntensityColor = (count: number) => {
    if (count >= 10) return '#e74c3c'; // High intensity - red
    if (count >= 5) return '#f39c12';  // Medium intensity - orange
    if (count >= 2) return '#f1c40f';  // Low intensity - yellow
    return '#27ae60'; // Very low intensity - green
  };

  const getIntensityLabel = (count: number) => {
    if (count >= 10) return 'High Risk';
    if (count >= 5) return 'Medium Risk';
    if (count >= 2) return 'Low Risk';
    return 'Safe';
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={60} color="#bdc3c7" />
        <Text style={styles.emptyText}>No location data available</Text>
        <Text style={styles.emptySubtext}>
          SOS events with location data will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Risk Heatmap</Text>
        <Text style={styles.headerSubtitle}>
          Areas with higher SOS frequency are marked in red
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Risk Level:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>High (10+)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
            <Text style={styles.legendText}>Medium (5-9)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f1c40f' }]} />
            <Text style={styles.legendText}>Low (2-4)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
            <Text style={styles.legendText}>Safe (1)</Text>
          </View>
        </View>
      </View>

      {/* Heatmap Data */}
      <ScrollView style={styles.heatmapContainer} showsVerticalScrollIndicator={false}>
        {sortedLocations.map((location: any, index) => (
          <View key={index} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={[
                styles.intensityIndicator,
                { backgroundColor: getIntensityColor(location.count) }
              ]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>{location.location}</Text>
                <Text style={styles.coordinatesText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.countContainer}>
                <Text style={styles.countText}>{location.count}</Text>
                <Text style={styles.countLabel}>SOS</Text>
              </View>
            </View>

            <View style={styles.riskInfo}>
              <Text style={[
                styles.riskLabel,
                { color: getIntensityColor(location.count) }
              ]}>
                {getIntensityLabel(location.count)}
              </Text>
              <Text style={styles.lastIncidentText}>
                Last incident: {new Date(
                  Math.max(...location.events.map((e: SOSEvent) => new Date(e.timestamp).getTime()))
                ).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.recentEvents}>
              <Text style={styles.recentEventsTitle}>Recent Events:</Text>
              {location.events.slice(0, 3).map((event: SOSEvent, eventIndex: number) => (
                <View key={eventIndex} style={styles.eventItem}>
                  <Ionicons
                    name={event.status === 'active' ? 'alert-circle' : 'checkmark-circle'}
                    size={14}
                    color={event.status === 'active' ? '#e74c3c' : '#27ae60'}
                  />
                  <Text style={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
              {location.events.length > 3 && (
                <Text style={styles.moreEventsText}>
                  +{location.events.length - 3} more events
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  legend: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  heatmapContainer: {
    maxHeight: 400,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 20,
  },
  locationCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  intensityIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  countContainer: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  countLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  riskInfo: {
    marginBottom: 10,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  lastIncidentText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recentEvents: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  recentEventsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  eventTime: {
    fontSize: 11,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  moreEventsText: {
    fontSize: 11,
    color: '#bdc3c7',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
