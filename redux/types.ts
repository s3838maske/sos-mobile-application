export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface SOSEvent {
  id: string;
  userId: string;
  location: LocationData;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'false_alarm';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SOSState {
  events: SOSEvent[];
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LocationState {
  currentLocation: LocationData | null;
  isTracking: boolean;
  permissionGranted: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  sos: SOSState;
  location: LocationState;
}
