# Chapter 5: Implementation and Testing

## Women Safety App – SOS Application

This document describes the **implementation approach**, **coding details**, **code efficiency**, **testing strategy**, and **modifications/improvements** for the SOS (Women Safety) application, as per the project report Chapter 5 requirements.

---

## 1. Implementation Approaches

### 1.1 Plan of Implementation

The application was built in a **modular, layer-based** manner:

| Phase | Description |
|-------|-------------|
| **1. Foundation** | Project setup with Expo, TypeScript, Redux store, and Firebase/SQLite configuration. |
| **2. Auth & User** | Authentication (login/signup/forgot-password), user profile, and emergency contacts with Firestore and offline SQLite sync. |
| **3. Core SOS** | SOS trigger (manual + shake), location capture, SMS to contacts, logging to Firestore and SQLite. |
| **4. Location** | Permission handling, current location, live tracking with configurable interval, and map UI. |
| **5. Admin** | Admin dashboard, SOS logs table, heatmap, user management, activity logs, and system settings. |
| **6. Polish** | Fake call, nearby help centers, geocoding, validations, theme constants, and UX (animations, loading states). |

### 1.2 Standards Used in Implementation

- **Language & typing**: **TypeScript** across the codebase for type safety and better tooling.
- **State management**: **Redux Toolkit** with **slices** (auth, sos, location); async logic via **createAsyncThunk**; **redux-persist** with AsyncStorage for session persistence.
- **Architecture**: Separation of **UI** (`app/`), **state** (`redux/`), **services** (Firebase, SMS, location, SQLite), and **utils** (validations, theme, constants, helpers, geocoding).
- **Routing**: **Expo Router** file-based routing; auth gate in `app/index.tsx` redirects to login, home, or admin based on auth state and `isAdminUser(email)`.
- **Styling**: Central **theme** (`utils/theme.ts`: COLORS, SIZES, SHADOWS) and **constants** (`utils/constants.ts`) for consistency.
- **Offline-first**: Critical data (user profile, emergency contacts, SOS logs) mirrored to **expo-sqlite** with a **sequential task queue** to avoid concurrent DB access issues.
- **Error handling**: Try/catch in services; errors surfaced via Redux (`error` in slices) or `Alert` in UI; geocoding and SMS failures degrade gracefully (e.g., save without address, log offline).

---

## 2. Coding Details and Code Efficiency

### 2.1 Important Code Snippets

Only representative sections are included; full source is in the repository.

#### 2.1.1 Entry Point – Auth Check and Routing

**File:** `app/index.tsx`

- Initializes SQLite, then subscribes to Firebase `onAuthStateChanged`.
- If user exists: fetches profile from Firestore (or builds fallback), dispatches `setUser`, stores token and `lastUserUid` for offline.
- If no user: tries offline profile using `lastUserUid` and `getUserProfileOffline` before clearing auth.
- After `initialized`, redirects: admin → `/(tabs)/admin`, user → `/(tabs)/home`, unauthenticated → `/auth/login`.
- Avoids redirect flicker by waiting for `initialized` and then routing in one effect.

```tsx
useEffect(() => {
  initDatabase().catch((err) => console.error("SQLite init error:", err));
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        const userData = await getUserById(user.uid);
        if (userData) dispatch(setUser(userData));
        else dispatch(setUser({ uid: user.uid, name: user.displayName || "User", ... }));
        await AsyncStorage.setItem("authToken", await user.getIdToken());
      } else {
        const lastUid = await AsyncStorage.getItem("lastUserUid");
        if (lastUid) {
          const offlineUser = await getUserProfileOffline(lastUid);
          if (offlineUser) dispatch(setUser(offlineUser));
        } else dispatch(setUser(null));
      }
    } finally {
      setInitialized(true);
    }
  });
  return () => unsubscribe();
}, [dispatch]);

useEffect(() => {
  if (!initialized) return;
  if (isAuthenticated) {
    router.replace(isAdmin ? "/(tabs)/admin" : "/(tabs)/home");
  } else {
    router.replace("/auth/login");
  }
}, [initialized, isAuthenticated, isAdmin]);
```

#### 2.1.2 SOS Flow – Manual and Shake Trigger

**File:** `app/(tabs)/home.tsx`

- **Manual**: User taps SOS button → `handleSOSPress`. If already active, resolves the active event; otherwise gets location, builds message with Google Maps link, sends SMS to emergency contacts (or 112), logs via `logSOSEvent` (Firestore) or `saveSOSLogOffline` on failure.
- **Shake**: Accelerometer listener; magnitude `sqrt(x²+y²+z²) > 2.5` triggers `handleSOSPress`. Update interval 100 ms; subscription cleaned up when “Shake SOS” is toggled off.

```tsx
useEffect(() => {
  if (shakeEnabled) {
    const sub = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > 2.5) {
        handleSOSPress();
      }
    });
    Accelerometer.setUpdateInterval(100);
    setSubscription(sub);
  } else {
    if (subscription) subscription.remove();
  }
  return () => { if (subscription) subscription.remove(); };
}, [shakeEnabled]);
```

#### 2.1.3 SOS Service – Logging and Geocoding

**File:** `services/sosService.ts`

- `logSOSEvent`: Converts coordinates to address via `getAddressFromCoordinates` (with try/catch so logging continues if geocoding fails), then writes to Firestore `sos_logs` with `status: 'active'`.
- `fetchSOSEvents`: Query ordered by `timestamp` desc, limited; maps docs to `SOSEvent[]` including `address` and `userName`.

```ts
// Geocoding is best-effort; we continue without address on failure
let address: string | undefined;
try {
  address = await getAddressFromCoordinates(eventData.location.latitude, eventData.location.longitude);
} catch (geocodeError) {
  console.warn('Geocoding failed, will save without address:', geocodeError);
}
const docRef = await addDoc(collection(db, 'sos_logs'), {
  ...eventData,
  address,
  timestamp: eventData.timestamp,
  status: 'active',
  createdAt: new Date(),
});
```

#### 2.1.4 SQLite – Sequential Queue (Concurrency Safety)

**File:** `services/sqliteService.ts`

- Single DB instance; opening is guarded by a promise so concurrent callers share one open.
- **Task queue**: All write/init operations go through `queueTask` so they run one-after-another, avoiding native NPEs and “database is locked” errors.

```ts
let dbTaskQueue: Promise<any> = Promise.resolve();

const queueTask = <T>(task: () => Promise<T>): Promise<T | void> => {
  const nextTask = dbTaskQueue.then(async () => {
    try {
      return await task();
    } catch (error) {
      console.error("[SQLite Queue] Task failed:", error);
    }
  });
  dbTaskQueue = nextTask;
  return nextTask;
};

export const saveSOSLogOffline = async (event: SOSEvent) => {
  if (!event?.id || !event?.userId) return;
  return queueTask(async () => {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO sos_logs (id, user_id, data) VALUES (?, ?, ?)",
      [event.id ?? "", event.userId ?? "", JSON.stringify(event)],
    );
  });
};
```

#### 2.1.5 Redux SOS Slice – Firestore + Offline Sync

**File:** `redux/slices/sosSlice.ts`

- Thunks: `logSOSEvent`, `fetchSOSEvents`, `updateSOSStatus` call the corresponding services.
- On `logSOSEvent.fulfilled`, the new event is prepended to `state.events`, `isActive` set true, and `saveSOSLogOffline(action.payload)` is called so offline copy is always updated when a log succeeds.
- Comment in code explicitly avoids syncing full fetch result to SQLite to prevent UI lock/NPE.

```ts
.addCase(logSOSEvent.fulfilled, (state, action) => {
  state.isLoading = false;
  state.events = [action.payload, ...state.events];
  state.isActive = true;
  saveSOSLogOffline(action.payload);
})
// Fetch: Don't sync all to SQLite here to avoid UI lock/NPE
```

#### 2.1.6 Location Tracking – Interval-Based Updates

**File:** `services/locationService.ts`

- Uses `getCurrentPositionAsync` in a **setInterval** (e.g. 10 s from `LOCATION_SETTINGS.UPDATE_INTERVAL`) instead of continuous watch, to balance battery and reliability.
- Returns a cleanup function that clears the interval; on permission/service error, still resolves with a no-op cleanup.

#### 2.1.7 Form Validation

**File:** `utils/validations.ts`

- Reusable validators: `validateEmail`, `validatePassword`, `validateName`, `validatePhoneNumber`, `validateEmergencyContact`, `validateLocation`, `validateSOSMessage`.
- Each returns `{ isValid, error? }`. `validateForm(formData, rules)` returns a map of field errors; `isFormValid(errors)` checks if there are none.

#### 2.1.8 Geocoding with Timeout and Fallback

**File:** `utils/geocoding.ts`

- `getAddressFromCoordinates`: Uses Nominatim API with `AbortController` and 8 s timeout; on failure or non-OK response, returns coordinates as fallback string so the app never blocks on geocoding.

### 2.2 Code Efficiency and Optimisation

| Area | Approach |
|------|----------|
| **SQLite** | Sequential queue prevents concurrent writes and native crashes; singleton DB open; explicit null checks (`event.id ?? ""`) before passing to native. |
| **Redux** | Async thunks keep UI responsive; only necessary state (e.g. auth, sos, location) persisted; serializable check configured to ignore persist actions and optional payload paths. |
| **Location** | Interval-based polling (e.g. 10 s) instead of high-frequency watch; fallback to `getLastKnownPositionAsync` when `getCurrentPositionAsync` fails. |
| **Geocoding** | Timeout (8 s) and fallback to coordinates; SOS logging does not block on geocoding failure. |
| **SOS fetch** | Limit (e.g. 50) and ordered query; no bulk sync of fetched events to SQLite to avoid heavy writes and UI lock. |
| **Shake** | Fixed update interval (100 ms) and single listener; cleanup on toggle and unmount. |
| **UI** | Loading flags (`isLoading`, `sosLoading`) and disabled buttons during async actions; animations use `useNativeDriver: true` where possible. |

---

## 3. Testing Approach

Testing is aligned with the **system design** (auth, SOS, location, admin, offline) and follows a **category-partition** style: define categories (e.g. auth state, SOS state, network), partition into choices (e.g. logged in / not, SOS active / resolved, online / offline), and design test cases for representative combinations. **State-machine-style** thinking applies to flows such as: Login → Home → SOS Active → Resolve → Home.

### 3.1 Functional Testing

- **Auth**: Login (valid/invalid), signup, forgot password, sign out; redirect to home vs admin by email; offline profile load when no Firebase user but `lastUserUid` and SQLite data exist.
- **SOS**: Manual trigger (location → SMS → Firestore/SQLite), shake trigger when enabled, resolve; behaviour when SMS unavailable or Firestore fails (offline log).
- **Location**: Permission grant/deny, get current location, start/stop tracking, map display.
- **Emergency contacts**: Add, edit, remove; sync to Firestore and SQLite.
- **Admin**: Dashboard stats, SOS logs list, heatmap, user list, system settings (e.g. wipe test SOS events).

### 3.2 User-Acceptance Testing (UAT)

- **Scenarios**: (1) User enables Shake SOS, shakes device, confirms SMS and alert resolution. (2) User turns on Live Tracking, moves, and verifies path/position. (3) User adds emergency contacts and triggers SOS; contacts receive SMS with location link. (4) Admin opens dashboard and verifies SOS counts and log entries. (5) App used with no network; SOS and profile/contacts still work via SQLite and SMS.
- **Devices**: Test on physical Android/iOS devices for location, SMS, and accelerometer.

**Note:** The repository does not currently include automated test suites (no Jest/Vitest scripts or `*.test.*` / `*.spec.*` files). The above describes the **intended** testing approach; adding unit and integration tests is recommended as a future improvement.

---

## 4. Unit Testing

Unit testing would target **one module at a time**, with dependencies mocked:

- **Utils**: `validations.ts` (each validator for valid/invalid inputs), `helpers.ts` (e.g. `generateSOSMessage`, `formatLocation`, `calculateDistance`), `geocoding.ts` (mock fetch; assert timeout and fallback).
- **Services**: `authService` (signIn, signUp, getUserById with mocked Firebase); `sosService` (logSOSEvent, fetchSOSEvents with mocked Firestore); `locationService` (getCurrentLocation, calculateDistance, isValidLocation with mocked Location API); `smsService` (isSMSAvailable, send with mocked expo-sms); `sqliteService` (queue ordering, save/read with in-memory or test DB).
- **Redux slices**: Auth (signIn/signUp/setUser and state); SOS (logSOSEvent, fetchSOSEvents, updateSOSStatus, addSOSEvent); Location (getCurrentLocation, setLocation, start/stop tracking). Mock the service layer.

Tests would **stay within one module** (e.g. one slice or one service file) and use mocks for other modules so that failures point to that unit.

---

## 5. Integrated Testing

Integrated testing would **combine modules** in a test environment:

- **Auth + Routing**: Login → Redux auth state updated → Expo Router redirect to home or admin; sign out → redirect to login.
- **SOS end-to-end**: Trigger SOS → location service → SOS service (Firestore) + SMS service + SQLite; Redux state and offline DB both updated; resolve updates Firestore and state.
- **Location + Map**: Grant permission → start tracking → location updates in Redux → map component receives and displays position; stop tracking clears subscription.
- **Offline**: Simulate no network; SOS and profile/contacts read from SQLite; SOS write goes to SQLite; when back online, verify Firestore and SQLite consistency if sync is implemented.

Application limits (e.g. max SOS events fetched, max contacts) and feature flags (e.g. admin tab visibility) would be tested here. E2E on device/emulator (e.g. Detox or Maestro) can cover full user flows.

---

## 6. Modifications and Improvements

The following modifications and improvements have been applied in the system:

| Modification | Purpose / Improvement |
|---------------|------------------------|
| **SQLite task queue** | Prevents concurrent DB access and native NPEs/locked DB; all init and writes go through `queueTask`. |
| **Geocoding fallback** | SOS logs are always saved; if Nominatim fails or times out, address is omitted and coordinates are used so the app never blocks on geocoding. |
| **Redux serializable check** | Store middleware ignores `FLUSH`, `REHYDRATE`, `PAUSE`, `PERSIST`, `PURGE`, `REGISTER` and optional paths (e.g. `payload.location.updatedAt`) so persist and location updates do not trigger false serialization errors. |
| **No bulk SQLite sync on fetch** | Fetching SOS events from Firestore does not write them all to SQLite, avoiding heavy writes and UI lock; offline copy is updated only when a new event is logged (in `logSOSEvent.fulfilled`). |
| **Explicit null/undefined handling in SQLite** | Parameters passed to `runAsync` use `event.id ?? ""` and `event.userId ?? ""` to avoid passing undefined to the native layer and NPEs. |
| **Location tracking cleanup** | `startLocationTracking` returns a cleanup function; home screen stores it in a ref and calls it when stopping tracking so the interval is always cleared. |
| **Accelerometer cleanup** | Shake listener is removed when “Shake SOS” is toggled off and on component unmount to avoid leaks and duplicate triggers. |
| **Last known location fallback** | If `getCurrentPositionAsync` fails, `getLastKnownPositionAsync` is tried before failing, improving behaviour in poor GPS conditions. |
| **Central theme and constants** | COLORS, SIZES, SHADOWS and LOCATION_SETTINGS, SOS_SETTINGS, ERROR_MESSAGES, etc. ensure consistent UI and behaviour and single place to tune intervals and thresholds. |

These changes improve **stability** (no DB lock/NPE), **resilience** (offline and geocoding failure), **predictability** (cleanup of subscriptions and intervals), and **maintainability** (central config and typed Redux).

---

## 7. Summary

- **Implementation**: Modular, layered (app, redux, services, utils), with TypeScript, Redux Toolkit, Expo Router, Firebase, and SQLite; auth gate and admin check drive routing.
- **Code**: Critical logic lives in entry (index), home (SOS + shake), sosService, sqliteService (queue), sosSlice, locationService, validations, and geocoding; code is commented where behaviour or design decisions need explanation.
- **Efficiency**: SQLite queue, limited Firestore reads, interval-based location, geocoding timeout/fallback, and careful Redux/serialization config.
- **Testing**: Approach is category-partition and state-machine-oriented for functional and UAT; unit tests would target utils and services/slices per module; integration tests would cover auth→routing, SOS flow, location→map, and offline behaviour. Current repo has no automated tests; adding them is recommended.
- **Modifications**: Queue for SQLite, geocoding fallback, serialization ignore rules, no bulk SQLite sync on fetch, null-safe SQLite params, subscription/interval cleanup, last-known location fallback, and central theme/constants.

---

*This document is part of the project report for the Women Safety App (SOS Application) and corresponds to Chapter 5: Implementation and Testing.*
