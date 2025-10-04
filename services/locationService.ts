import * as Location from 'expo-location';
import { LocationData } from '../redux/types';
import { LOCATION_SETTINGS } from '../utils/constants';

// Request location permissions
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

// Check if location services are enabled
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const isEnabled = await isLocationEnabled();
    if (!isEnabled) {
      throw new Error('Location services are disabled');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Start location tracking with proper subscription management
export const startLocationTracking = (
  onLocationUpdate: (location: LocationData) => void,
  onError?: (error: Error) => void
): Promise<(() => void)> => {
  return new Promise(async (resolve) => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const isEnabled = await isLocationEnabled();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      // Use interval-based location updates instead of watchPositionAsync
      const updateLocation = async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          timestamp: new Date().toISOString(),
        };
          onLocationUpdate(locationData);
        } catch (error) {
          console.error('Error getting location update:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      };

      // Get initial location
      await updateLocation();

      // Set up interval for periodic updates
      intervalId = setInterval(updateLocation, LOCATION_SETTINGS.UPDATE_INTERVAL);

      // Return cleanup function
      resolve(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    } catch (error) {
      console.error('Error starting location tracking:', error);
      if (onError) {
        onError(error as Error);
      }
      // Return empty cleanup function on error
      resolve(() => {});
    }
  });
};

// Get location from address (geocoding)
export const getLocationFromAddress = async (address: string): Promise<LocationData | null> => {
  try {
    const result = await Location.geocodeAsync(address);
    if (result.length > 0) {
      const location = result[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: 0, // Geocoded locations don't have accuracy
        timestamp: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

// Get address from location (reverse geocoding)
export const getAddressFromLocation = async (location: LocationData): Promise<string | null> => {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (result.length > 0) {
      const address = result[0];
      const addressParts = [
        address.street,
        address.city,
        address.region,
        address.country,
      ].filter(Boolean);
      
      return addressParts.join(', ');
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    throw error;
  }
};

// Calculate distance between two locations
export const calculateDistance = (
  location1: LocationData,
  location2: LocationData
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (location2.latitude - location1.latitude) * Math.PI / 180;
  const dLon = (location2.longitude - location1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(location1.latitude * Math.PI / 180) * Math.cos(location2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Check if location is within radius
export const isLocationWithinRadius = (
  center: LocationData,
  point: LocationData,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
};

// Format location for display
export const formatLocation = (location: LocationData): string => {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

// Validate location data
export const isValidLocation = (location: LocationData): boolean => {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};
