# Women Safety App - SOS Application

A robust mobile application designed to enhance women's safety through real-time monitoring, emergency alerts, and community support. Built with React Native and Expo, this application provides a lifeline during critical situations for both individuals and administrators.

---

## 👤 Normal User Features & Scenarios

### 1. 🚨 Emergency SOS (Manual & Shake)

- **Feature**: A prominent SOS button on the home screen and an automated shake-to-trigger mechanism.
- **Scenarios**:
  - **Manual Trigger**: User feels an immediate threat and taps the "SOS" button. The app instantly captures the location, logs an event, and triggers emergency protocols.
  - **Shake Trigger**: In a situation where reaching the phone's screen is impossible (e.g., phone is in a bag or pocket during a struggle), the user shakes the device vigorously. The accelerometer detects this and activates SOS automatically.
  - **Deactivation**: Once the user is safe, they can tap the active SOS button again to "Resolve" the alert, informing the system and contacts that they are no longer in danger.

### 2. 📍 Live Location Tracking

- **Feature**: Real-time GPS tracking that can be toggled on or off.
- **Scenarios**:
  - **Safe Passage**: User is taking a cab or walking through an unfamiliar area at night. They enable "Start Tracking" so their path is monitored continuously.
  - **Emergency Sharing**: During an active SOS, the live location is automatically shared with emergency contacts and the admin dashboard.

### 3. 📞 Fake Call

- **Feature**: Simulates an incoming phone call with a customizable caller ID.
- **Scenarios**:
  - **Exit Strategy**: User is in an uncomfortable social setting or being followed in a public space. They trigger a "Fake Call" to create a reason to leave or to show others they are talking to someone, deterring potential harassers.

### 4. 👥 Emergency Contacts Management

- **Feature**: Add, edit, and delete trusted contacts (Family, Friends, Authorities).
- **Scenarios**:
  - **Setup**: Upon first login, the user adds their parents and a close friend.
  - **Alerting**: During an SOS, these contacts receive an automated SMS with the user's name, precise location coordinates, and a timestamped help message.

### 5. 🏥 Nearby Help Centers

- **Feature**: Integration with Maps to find the closest Police Stations, Hospitals, and Safe Zones.
- **Scenarios**:
  - **Finding Shelter**: User is lost or needs immediate physical assistance. They open the "Nearby" tab to get directions to the nearest police station or 24/7 hospital.

### 6. 🔌 Offline Support

- **Feature**: SQLite integration for local data persistence.
- **Scenarios**:
  - **Poor Connectivity**: If a user is in a basement or area with no internet, the app logs the SOS event locally in the `sqlite` database. It attempts to send the SMS via the cellular network (SIM) even if data services are unavailable.

---

## 🛠️ Admin Features & Scenarios

### 1. 📊 Centralized Dashboard

- **Feature**: A high-level overview of safety metrics across the entire user base.
- **Scenarios**:
  - **Performance Tracking**: Admin checks the dashboard to see `Total SOS`, `Active SOS`, and `Resolved SOS` counts for the current day.

### 2. 📋 Live SOS Monitoring (Logs)

- **Feature**: A real-time data table displaying details of all active and past SOS events.
- **Scenarios**:
  - **Incident Response**: An admin sees a new "Active" alert pop up in the table. They immediately click on the entry to view the user's name, profile, and exact coordinates to coordinate with local authorities.

### 3. 🗺️ Risk Heatmap

- **Feature**: A geographical visualization based on SOS event density.
- **Scenarios**:
  - **Safety Planning**: Admin reviews the heatmap and notices a high density of SOS alerts in a specific neighborhood. They can report these findings to municipal authorities to improve street lighting or police patrolling in those "hotspots."

### 4. 👥 User Management & Safety Metrics

- **Feature**: Monitor registered users and their safety engagement.
- **Scenarios**:
  - **Usage Analysis**: Admin identifies periods of high app usage (e.g., late nights or festival seasons) and ensures monitoring staff are alert.

---

## 🚀 Tech Stack

- **Mobile Framework**: Expo (React Native)
- **Language**: TypeScript
- **State Management**: Redux Toolkit (Slices for SOS, Location, Auth)
- **Backend / Authentication**: Firebase (Auth, Firestore)
- **Database (Offline)**: SQLite (Expo-SQLite)
- **Maps & Location**: React Native Maps & Expo Location
- **Hardware Integration**: Expo Sensors (Accelerometer for Shake), Expo SMS

## 📂 Project Structure

```
Sos-application/
├── app/                  # Expo Router (tabs, auth, admin)
├── assets/               # Images, Icons, Fonts
├── redux/                # Store, Thunks, and Slices
├── services/             # Firebase, SQLite, SMS, Location Services
├── utils/                # Geocoding, Constants, Helpers
└── components/           # Specific UI components (SOS Button, Maps)
```

## ⚙️ Installation

1.  **Clone & Install**:
    ```bash
    git clone <repo-url>
    npm install
    ```
2.  **Firebase Config**:
    Add your configuration to `services/firebase.ts`.
3.  **Start Development**:
    ```bash
    npm run start
    ```

---

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For issues or feature requests, please open an issue in the repository.

---

_Disclaimer: This application is a safety tool. Always prioritize your safety and contact local emergency services (100/112) in life-threatening situations._
