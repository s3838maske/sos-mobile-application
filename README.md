# Women Safety App

A comprehensive React Native application built with Expo for women's safety, featuring SOS alerts, location tracking, emergency contacts, and real-time monitoring.

## Features

### 🚨 Emergency Features
- **SOS Button**: One-tap emergency alert with location sharing
- **Shake Detection**: Automatic SOS trigger via device shake
- **Fake Call**: Simulate incoming calls to escape uncomfortable situations
- **Emergency Contacts**: Quick access to trusted contacts
- **SMS Alerts**: Automatic SMS notifications to emergency contacts and helplines

### 📍 Location Services
- **Live Location Tracking**: Real-time GPS tracking with permission management
- **Location Sharing**: Share location with emergency contacts during SOS
- **Nearby Help Centers**: Find police stations, hospitals, and NGOs
- **Location History**: Track movement patterns for safety analysis

### 👤 User Management
- **Firebase Authentication**: Secure login and signup
- **Profile Management**: Update personal information and emergency contacts
- **Emergency Contacts**: Add, edit, and manage emergency contacts
- **User Preferences**: Customize app settings and notifications

### 📊 Admin Dashboard
- **SOS Analytics**: View and analyze emergency alerts
- **Risk Heatmap**: Visual representation of high-risk areas
- **User Management**: Monitor app usage and safety metrics
- **Real-time Monitoring**: Live tracking of active SOS events

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tab)
- **State Management**: Redux Toolkit
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Location Services**: Expo Location
- **SMS**: Expo SMS
- **Maps**: React Native Maps
- **Sensors**: Expo Sensors (Accelerometer)

## Project Structure

```
WomenSafetyApp/
├── app/                          # File-based routing (Expo Router)
│   ├── _layout.tsx              # Root layout with providers
│   ├── _providers.tsx           # Redux and theme providers
│   ├── index.tsx                # Entry screen
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── home/                    # Home screen with SOS features
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── SOSButton.tsx
│   │       ├── LiveLocationMap.tsx
│   │       └── NearbyHelpCenters.tsx
│   ├── emergency/               # Emergency features
│   │   ├── fakeCall.tsx
│   │   └── components/
│   │       ├── FakeCallUI.tsx
│   │       └── CallButton.tsx
│   ├── profile/                 # User profile management
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── ProfileCard.tsx
│   │       └── EmergencyContacts.tsx
│   ├── tracking/                # Location tracking
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── MapTracker.tsx
│   │       └── LocationPermission.tsx
│   └── admin/                   # Admin dashboard
│       ├── dashboard.tsx
│       └── components/
│           ├── SOSLogsTable.tsx
│           └── HeatmapView.tsx
├── navigation/                  # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── TabNavigator.tsx
│   └── routes.ts
├── redux/                       # State management
│   ├── store.ts
│   ├── types.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── sosSlice.ts
│       └── locationSlice.ts
├── services/                    # External services
│   ├── firebase.ts
│   ├── locationService.ts
│   └── smsService.ts
├── utils/                       # Utility functions
│   ├── constants.ts
│   ├── helpers.ts
│   └── validations.ts
└── assets/                      # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sos-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `services/firebase.ts` with your Firebase config

4. **Configure API Keys**
   - Update `utils/constants.ts` with your API keys
   - Add Google Maps API key for location services

5. **Start the development server**
   ```bash
   npm start
   ```

## Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Update the Firebase configuration in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Firestore Collections

The app uses the following Firestore collections:

- **users**: User profiles and emergency contacts
- **sos_logs**: Emergency SOS events
- **tracking**: Location tracking data

### Permissions

The app requires the following permissions:

- **Location**: For GPS tracking and emergency location sharing
- **SMS**: For sending emergency alerts
- **Phone**: For making emergency calls

## Usage

### For Users

1. **Sign Up/Login**: Create an account or sign in
2. **Add Emergency Contacts**: Add trusted contacts in your profile
3. **Enable Location Tracking**: Grant location permissions for safety features
4. **Use SOS Features**: 
   - Tap the SOS button for emergency alerts
   - Shake your device to trigger SOS
   - Use fake call feature for uncomfortable situations

### For Admins

1. **Access Admin Dashboard**: Available for admin users
2. **Monitor SOS Events**: View real-time emergency alerts
3. **Analyze Risk Areas**: Use heatmap to identify high-risk locations
4. **Manage Users**: Monitor app usage and safety metrics

## Key Features Implementation

### SOS Alert System

```typescript
// Trigger SOS alert
const handleSOSPress = async () => {
  const location = await getCurrentLocation();
  const sosEvent = {
    userId: user.uid,
    location: formatLocation(location),
    message: generateSOSMessage(user.name, location),
    status: 'active'
  };
  
  await dispatch(logSOSEvent(sosEvent));
  await sendSMSToEmergencyContacts(user, location);
  await sendSMSToHelpline(location, user);
};
```

### Location Tracking

```typescript
// Start location tracking
const startTracking = () => {
  const cleanup = startLocationTracking(
    (location) => {
      dispatch(setLocation(location));
      updateLocationInFirestore(user.uid, location);
    },
    (error) => console.error('Location error:', error)
  );
  
  return cleanup;
};
```

### Shake Detection

```typescript
// Setup shake detection
useEffect(() => {
  Accelerometer.setUpdateInterval(100);
  const subscription = Accelerometer.addListener(handleShake);
  return () => subscription?.remove();
}, []);

const handleShake = ({ x, y, z }) => {
  const acceleration = Math.sqrt(x * x + y * y + z * z);
  if (acceleration > 2.5) {
    handleSOSPress();
  }
};
```

## Security Features

- **Encrypted Data**: All sensitive data is encrypted
- **Secure Authentication**: Firebase Auth with secure token management
- **Privacy Protection**: Location data only shared during emergencies
- **Permission Management**: Granular control over app permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Disclaimer

This app is designed for safety purposes. Always ensure you have proper permissions and follow local laws regarding location tracking and emergency services.