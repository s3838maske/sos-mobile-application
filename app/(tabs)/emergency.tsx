import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CallButton from '../emergency/components/CallButton';
import FakeCallUI from '../emergency/components/FakeCallUI';

const EMERGENCY_NUMBERS = {
  police: '112',
  womenHelpline: '1091',
  domesticViolence: '181',
  ambulance: '108',
};

export default function EmergencyScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [callDuration, setCallDuration] = useState('30');

  const handleEmergencyCall = (number: string, service: string) => {
    Alert.alert(
      `Call ${service}`,
      `Are you sure you want to call ${service} at ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${number}`);
          }
        }
      ]
    );
  };

  const handleFakeCall = () => {
    if (fakeCallActive) {
      setFakeCallActive(false);
      Alert.alert('Fake Call Ended', 'The fake call has been ended.');
    } else {
      setFakeCallActive(true);
      Alert.alert(
        'Fake Call Started',
        `Incoming call from ${callerName}. This will help you appear busy if needed.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleAnswerCall = () => {
    Alert.alert('Call Answered', 'Fake call is now active.');
  };

  const handleDeclineCall = () => {
    setFakeCallActive(false);
    Alert.alert('Call Declined', 'Fake call has been declined.');
  };


  if (fakeCallActive) {
    return (
      <FakeCallUI
        callerName={callerName}
        duration={callDuration}
        onEndCall={handleDeclineCall}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Services</Text>
        <Text style={styles.subtitle}>
          Quick access to emergency contacts and services
        </Text>
      </View>

      {/* Emergency Numbers */}
      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Emergency Numbers</Text>
        
        <CallButton
          title="Police"
          icon="shield"
          color="#e74c3c"
          onPress={() => handleEmergencyCall(EMERGENCY_NUMBERS.police, 'Police')}
        />
        
        <CallButton
          title="Women Helpline"
          icon="call"
          color="#9b59b6"
          onPress={() => handleEmergencyCall(EMERGENCY_NUMBERS.womenHelpline, 'Women Helpline')}
        />
        
        <CallButton
          title="Domestic Violence"
          icon="heart"
          color="#e67e22"
          onPress={() => handleEmergencyCall(EMERGENCY_NUMBERS.domesticViolence, 'Domestic Violence Helpline')}
        />
        
        <CallButton
          title="Ambulance"
          icon="medical"
          color="#27ae60"
          onPress={() => handleEmergencyCall(EMERGENCY_NUMBERS.ambulance, 'Ambulance')}
        />
      </View>

      {/* Fake Call Feature */}
      <View style={styles.fakeCallSection}>
        <Text style={styles.sectionTitle}>Fake Call</Text>
        <Text style={styles.fakeCallDescription}>
          Simulate an incoming call to help you appear busy or create an excuse to leave a situation.
        </Text>
        
        <View style={styles.fakeCallControls}>
          <Text style={styles.controlLabel}>Caller Name:</Text>
          <Text style={styles.controlValue}>{callerName}</Text>
          
          <Text style={styles.controlLabel}>Call Duration:</Text>
          <Text style={styles.controlValue}>{callDuration} seconds</Text>
        </View>

        <CallButton
          title="Start Fake Call"
          icon="call"
          color="#3498db"
          onPress={handleFakeCall}
        />
      </View>

      {/* Safety Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>
            Always keep your phone charged and easily accessible
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>
            Share your location with trusted contacts when traveling alone
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>
            Trust your instincts - if something feels wrong, leave immediately
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>4</Text>
          <Text style={styles.tipText}>
            Keep emergency numbers saved in your phone
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.quickActionsDescription}>
          These actions can help you in emergency situations:
        </Text>
        
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionText}>Send SOS with location to emergency contacts</Text>
        </View>
        
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>Share live location with trusted contacts</Text>
        </View>
        
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>🚨</Text>
          <Text style={styles.actionText}>Activate emergency mode with one tap</Text>
        </View>
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
  emergencySection: {
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
  fakeCallSection: {
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
  fakeCallDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  fakeCallControls: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  controlValue: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsSection: {
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
  tipItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  quickActionsSection: {
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
  quickActionsDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});
