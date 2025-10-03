import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSOSEvents } from '../../redux/slices/sosSlice';
import { AppDispatch, RootState } from '../../redux/store';
import HeatmapView from './components/HeatmapView';
import SOSLogsTable from './components/SOSLogsTable';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { events, isLoading } = useSelector((state: RootState) => state.sos);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'heatmap'>('logs');

  useEffect(() => {
    // Fetch all SOS events for admin view
    if (user?.uid) {
      dispatch(fetchSOSEvents(user.uid));
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) {
      await dispatch(fetchSOSEvents(user.uid));
    }
    setRefreshing(false);
  };

  const stats = {
    totalSOS: events.length,
    activeSOS: events.filter(e => e.status === 'active').length,
    resolvedSOS: events.filter(e => e.status === 'resolved').length,
    todaySOS: events.filter(e => 
      new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={isLoading ? "#bdc3c7" : "#2c3e50"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="warning" size={24} color="#e74c3c" />
            <Text style={styles.statNumber}>{stats.totalSOS}</Text>
            <Text style={styles.statLabel}>Total SOS</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color="#f39c12" />
            <Text style={styles.statNumber}>{stats.activeSOS}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            <Text style={styles.statNumber}>{stats.resolvedSOS}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color="#3498db" />
            <Text style={styles.statNumber}>{stats.todaySOS}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
            onPress={() => setActiveTab('logs')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={activeTab === 'logs' ? '#e74c3c' : '#7f8c8d'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'logs' && styles.activeTabText
            ]}>
              SOS Logs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'heatmap' && styles.activeTab]}
            onPress={() => setActiveTab('heatmap')}
          >
            <Ionicons 
              name="map" 
              size={20} 
              color={activeTab === 'heatmap' ? '#e74c3c' : '#7f8c8d'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'heatmap' && styles.activeTabText
            ]}>
              Heatmap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'logs' ? (
          <SOSLogsTable events={events} isLoading={isLoading} />
        ) : (
          <HeatmapView events={events} />
        )}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#e74c3c',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
});
