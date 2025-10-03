// App Constants
export const APP_NAME = 'Women Safety App';
export const APP_VERSION = '1.0.0';

// Emergency Numbers
export const EMERGENCY_NUMBERS = {
  POLICE: '100',
  AMBULANCE: '108',
  WOMEN_HELPLINE: '1091',
  NATIONAL_EMERGENCY: '112',
} as const;

// API Keys (Replace with your actual keys)
export const API_KEYS = {
  GOOGLE_MAPS: 'your-google-maps-api-key',
  FIREBASE_API_KEY: 'your-firebase-api-key',
  FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_STORAGE_BUCKET: 'your-project.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  FIREBASE_APP_ID: 'your-app-id',
} as const;

// Location Settings
export const LOCATION_SETTINGS = {
  ACCURACY: 'high' as const,
  UPDATE_INTERVAL: 30000, // 30 seconds
  DISTANCE_INTERVAL: 100, // 100 meters
  MAX_AGE: 60000, // 1 minute
} as const;

// SOS Settings
export const SOS_SETTINGS = {
  SHAKE_THRESHOLD: 2.5,
  SHAKE_UPDATE_INTERVAL: 100,
  MESSAGE_TEMPLATE: 'SOS ALERT: {name} needs immediate help at {location}. Time: {time}',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#e74c3c',
    SECONDARY: '#2c3e50',
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#3498db',
    LIGHT: '#f8f9fa',
    DARK: '#2c3e50',
    MUTED: '#7f8c8d',
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  SETTINGS: 'app_settings',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  LOCATION_PERMISSION: 'location_permission',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOCATION_PERMISSION_DENIED: 'Location permission is required for this feature.',
  SMS_NOT_AVAILABLE: 'SMS is not available on this device.',
  FIREBASE_ERROR: 'An error occurred. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SOS_SENT: 'SOS alert sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  CONTACT_ADDED: 'Emergency contact added successfully!',
  CONTACT_REMOVED: 'Emergency contact removed successfully!',
  LOCATION_UPDATED: 'Location updated successfully!',
} as const;
