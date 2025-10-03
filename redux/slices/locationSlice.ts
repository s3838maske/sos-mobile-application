import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LocationData, LocationState } from '../types';

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  permissionGranted: false,
  error: null,
};

// Async thunks
export const requestLocationPermission = createAsyncThunk(
  'location/requestPermission',
  async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    return true;
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: new Date().toISOString(),
    };
    
    return locationData;
  }
);

export const startLocationTracking = createAsyncThunk(
  'location/startTracking',
  async (userId: string, { dispatch }) => {
    try {
      // Check permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        updatedAt: new Date(),
      };
      
      // Store initial location in Firestore
      await addDoc(collection(db, 'tracking'), locationData);
      
      // Update Redux state with current location
      dispatch(setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: new Date().toISOString(),
      }));

      return { success: true, location: locationData };
    } catch (error) {
      throw error;
    }
  }
);

export const updateLocationInFirestore = createAsyncThunk(
  'location/updateInFirestore',
  async ({ userId, location }: { userId: string; location: LocationData }) => {
    await addDoc(collection(db, 'tracking'), {
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      updatedAt: location.timestamp,
    });
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    stopTracking: (state) => {
      state.isTracking = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Permission
      .addCase(requestLocationPermission.fulfilled, (state) => {
        state.permissionGranted = true;
        state.error = null;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.permissionGranted = false;
        state.error = action.error.message || 'Permission denied';
      })
      // Get Current Location
      .addCase(getCurrentLocation.pending, (state) => {
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to get location';
      })
      // Start Tracking
      .addCase(startLocationTracking.pending, (state) => {
        state.isTracking = true;
        state.error = null;
      })
      .addCase(startLocationTracking.fulfilled, (state) => {
        state.isTracking = true;
        state.error = null;
      })
      .addCase(startLocationTracking.rejected, (state, action) => {
        state.isTracking = false;
        state.error = action.error.message || 'Failed to start tracking';
      });
  },
});

export const { setLocation, setTracking, clearError, stopTracking } = locationSlice.actions;
export default locationSlice.reducer;
