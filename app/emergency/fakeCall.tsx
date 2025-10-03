import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CallButton from './components/CallButton';
import FakeCallUI from './components/FakeCallUI';

const { width, height } = Dimensions.get('window');

export default function EmergencyScreen() {
  const router = useRouter();
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isFakeCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFakeCallActive]);

  const handleStartFakeCall = () => {
    setIsFakeCallActive(true);
    setCallDuration(0);
  };

  const handleEndFakeCall = () => {
    setIsFakeCallActive(false);
    setCallDuration(0);
  };

  const handleCallHelpline = () => {
    // In real app, this would use Linking to make a call
    console.log('Calling helpline...');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFakeCallActive) {
    return (
      <FakeCallUI
        callerName={callerName}
        duration={formatDuration(callDuration)}
        onEndCall={handleEndFakeCall}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Emergency Options</Text>
        <Text style={styles.subtitle}>
          Choose an option to help you in an emergency situation
        </Text>

        <View style={styles.optionsContainer}>
          {/* Fake Call Option */}
          <View style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <Ionicons name="phone-portrait" size={30} color="#9b59b6" />
              <Text style={styles.optionTitle}>Fake Call</Text>
            </View>
            <Text style={styles.optionDescription}>
              Simulate an incoming call to help you escape from an uncomfortable situation
            </Text>
            
            <View style={styles.fakeCallSettings}>
              <Text style={styles.settingLabel}>Caller Name:</Text>
              <View style={styles.nameOptions}>
                {['Mom', 'Dad', 'Sister', 'Friend'].map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.nameOption,
                      callerName === name && styles.nameOptionSelected
                    ]}
                    onPress={() => setCallerName(name)}
                  >
                    <Text style={[
                      styles.nameOptionText,
                      callerName === name && styles.nameOptionTextSelected
                    ]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <CallButton
              title="Start Fake Call"
              onPress={handleStartFakeCall}
              icon="phone-portrait"
              color="#9b59b6"
            />
          </View>

          {/* Emergency Call Option */}
          <View style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <Ionicons name="call" size={30} color="#e74c3c" />
              <Text style={styles.optionTitle}>Emergency Call</Text>
            </View>
            <Text style={styles.optionDescription}>
              Call emergency helpline numbers immediately
            </Text>

            <View style={styles.helplineNumbers}>
              <View style={styles.helplineItem}>
                <Text style={styles.helplineLabel}>Police:</Text>
                <Text style={styles.helplineNumber}>100</Text>
              </View>
              <View style={styles.helplineItem}>
                <Text style={styles.helplineLabel}>Ambulance:</Text>
                <Text style={styles.helplineNumber}>108</Text>
              </View>
              <View style={styles.helplineItem}>
                <Text style={styles.helplineLabel}>Women Helpline:</Text>
                <Text style={styles.helplineNumber}>1091</Text>
              </View>
            </View>

            <CallButton
              title="Call Emergency"
              onPress={handleCallHelpline}
              icon="call"
              color="#e74c3c"
            />
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 15,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 20,
  },
  fakeCallSettings: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 10,
  },
  nameOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nameOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  nameOptionSelected: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  nameOptionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  nameOptionTextSelected: {
    color: 'white',
  },
  helplineNumbers: {
    marginBottom: 20,
  },
  helplineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  helplineLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  helplineNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});
