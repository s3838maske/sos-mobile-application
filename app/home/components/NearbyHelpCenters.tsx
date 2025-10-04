import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LocationData } from '../../../redux/types';

interface HelpCenter {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'ngo';
  distance: string;
  phone: string;
  address: string;
}

interface NearbyHelpCentersProps {
  userLocation: LocationData | null;
}

export default function NearbyHelpCenters({ userLocation }: NearbyHelpCentersProps) {
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyHelpCenters();
    }
  }, [userLocation]);

  const fetchNearbyHelpCenters = async () => {
    setLoading(true);
    // Mock data - In real app, this would use Google Places API
    const mockCenters: HelpCenter[] = [
      {
        id: '1',
        name: 'Central Police Station',
        type: 'police',
        distance: '0.5 km',
        phone: '100',
        address: '123 Main Street, City Center',
      },
      {
        id: '2',
        name: 'City General Hospital',
        type: 'hospital',
        distance: '1.2 km',
        phone: '108',
        address: '456 Health Avenue, Medical District',
      },
      {
        id: '3',
        name: 'Women Safety NGO',
        type: 'ngo',
        distance: '0.8 km',
        phone: '1091',
        address: '789 Support Street, Community Center',
      },
    ];
    
    setTimeout(() => {
      setHelpCenters(mockCenters);
      setLoading(false);
    }, 1000);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'police':
        return 'shield';
      case 'hospital':
        return 'medical';
      case 'ngo':
        return 'people';
      default:
        return 'location';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'police':
        return '#3498db';
      case 'hospital':
        return '#e74c3c';
      case 'ngo':
        return '#9b59b6';
      default:
        return '#95a5a6';
    }
  };

  const handleCall = (phone: string) => {
    // In real app, this would use Linking to make a call
    console.log(`Calling ${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nearby Help Centers</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding nearby help centers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Help Centers</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {helpCenters.map((center) => (
          <View key={center.id} style={styles.centerCard}>
            <View style={styles.centerHeader}>
              <Ionicons
                name={getIconName(center.type) as any}
                size={24}
                color={getTypeColor(center.type)}
              />
              <Text style={styles.centerName}>{center.name}</Text>
            </View>
            
            <Text style={styles.centerDistance}>{center.distance}</Text>
            <Text style={styles.centerAddress}>{center.address}</Text>
            
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: getTypeColor(center.type) }]}
              onPress={() => handleCall(center.phone)}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={styles.callButtonText}>Call {center.phone}</Text>
            </TouchableOpacity>
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
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  scrollContent: {
    paddingRight: 15,
  },
  centerCard: {
    width: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  centerDistance: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
    marginBottom: 5,
  },
  centerAddress: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 16,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});
