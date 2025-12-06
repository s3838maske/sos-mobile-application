import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateSOSStatus } from '../../../redux/slices/sosSlice';
import { AppDispatch } from '../../../redux/store';
import { SOSEvent } from '../../../redux/types';

interface SOSLogsTableProps {
  events: SOSEvent[];
  isLoading: boolean;
}

export default function SOSLogsTable({ events, isLoading }: SOSLogsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#e74c3c';
      case 'resolved':
        return '#27ae60';
      case 'false_alarm':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'alert-circle';
      case 'resolved':
        return 'checkmark-circle';
      case 'false_alarm':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleViewOnMap = (event: SOSEvent) => {
    if (!event.location) {
      Alert.alert('Error', 'Location data not available for this event');
      return;
    }

    const { latitude, longitude } = event.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open maps application');
      }
    }).catch(() => {
      Alert.alert('Error', 'Failed to open maps application');
    });
  };

  const handleResolveEvent = (event: SOSEvent) => {
    Alert.alert(
      'Resolve SOS Event',
      `Are you sure you want to mark this SOS event as resolved?\n\nUser: ${event.userName || event.userId}\nTime: ${new Date(event.timestamp).toLocaleString()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Mark as False Alarm',
          style: 'destructive',
          onPress: () => resolveEvent(event.id, 'false_alarm')
        },
        {
          text: 'Resolve',
          onPress: () => resolveEvent(event.id, 'resolved')
        }
      ]
    );
  };

  const resolveEvent = async (eventId: string, status: 'resolved' | 'false_alarm') => {
    try {
      setResolvingId(eventId);
      await dispatch(updateSOSStatus({ eventId, status })).unwrap();
      Alert.alert(
        'Success',
        `SOS event has been marked as ${status === 'resolved' ? 'resolved' : 'false alarm'}`
      );
    } catch (error) {
      console.error('Error resolving event:', error);
      Alert.alert('Error', 'Failed to update event status. Please try again.');
    } finally {
      setResolvingId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading SOS logs...</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={60} color="#bdc3c7" />
        <Text style={styles.emptyText}>No SOS events found</Text>
        <Text style={styles.emptySubtext}>
          SOS events will appear here when users trigger emergency alerts
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOS Events ({events.length})</Text>
      </View>

      <ScrollView
        style={styles.tableContainer}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {events.map((event, index) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(event.status) as any}
                  size={16}
                  color={getStatusColor(event.status)}
                />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(event.status) }
                ]}>
                  {event.status.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#7f8c8d" />
                <Text style={styles.detailLabel}>User Name:</Text>
                <Text style={styles.detailValue}>{event.userName || event.userId || 'Unknown'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#7f8c8d" />
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {event.address || (event.location
                    ? `${event.location.latitude.toFixed(6)}, ${event.location.longitude.toFixed(6)}`
                    : 'Location unavailable')}
                </Text>
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Message:</Text>
                <Text style={styles.messageText}>{event.message || 'No message'}</Text>
              </View>
            </View>

            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewOnMap(event)}
                disabled={!event.location}
              >
                <Ionicons name="location" size={16} color="#3498db" />
                <Text style={styles.actionText}>View on Map</Text>
              </TouchableOpacity>

              {event.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => handleResolveEvent(event)}
                  disabled={resolvingId === event.id}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={[styles.actionText, styles.resolveText]}>
                    {resolvingId === event.id ? 'Resolving...' : 'Resolve'}
                  </Text>
                </TouchableOpacity>
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
  tableContainer: {
    maxHeight: 400,
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
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
  eventCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  eventDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    marginRight: 5,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  messageContainer: {
    marginTop: 10,
  },
  messageLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  resolveButton: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  actionText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 5,
  },
  resolveText: {
    color: 'white',
  },
});
