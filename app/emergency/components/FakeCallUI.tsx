import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface FakeCallUIProps {
  callerName: string;
  duration: string;
  onEndCall: () => void;
}

const { width, height } = Dimensions.get('window');

export default function FakeCallUI({ callerName, duration, onEndCall }: FakeCallUIProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAnswer = () => {
    // Simulate answering the call
    console.log('Call answered');
  };

  const handleDecline = () => {
    onEndCall();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Animated.View
        style={[
          styles.callContainer,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Caller Info */}
        <View style={styles.callerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="white" />
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callStatus}>Incoming call...</Text>
          <Text style={styles.callDuration}>{duration}</Text>
        </View>

        {/* Call Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.answerButton]}
            onPress={handleAnswer}
          >
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoText}>
            This is a fake call to help you escape from an uncomfortable situation.
          </Text>
          <Text style={styles.infoText}>
            Tap the red button to end the call.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  callContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 50,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34495e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 18,
    color: '#bdc3c7',
    marginBottom: 5,
  },
  callDuration: {
    fontSize: 16,
    color: '#95a5a6',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 50,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  answerButton: {
    backgroundColor: '#27ae60',
  },
  additionalInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
});
