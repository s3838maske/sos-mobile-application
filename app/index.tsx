import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { auth } from '../services/firebase';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Persist token for session continuity
          const token = await user.getIdToken();
          await AsyncStorage.setItem('authToken', token);

          dispatch(setUser({
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            phone: user.phoneNumber || '',
            emergencyContacts: [],
            createdAt: new Date().toISOString(),
          }));
        } else {
          await AsyncStorage.removeItem('authToken');
          dispatch(setUser(null));
        }
      } finally {
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Navigate after auth state is initialized to avoid flicker and conflicting redirects
  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/home' as any);
    } else {
      router.replace('/auth/login' as any);
    }
  }, [initialized, isAuthenticated]);

  if (isLoading || !initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Women Safety App</Text>
      <Text style={styles.subtitle}>Your safety is our priority</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#2c3e50',
  },
});
