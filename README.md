# Offline GPS Navigation App

A React Native application for offline GPS navigation that works on both land and sea using only satellite GNSS positioning. The app works without internet connection and without a SIM card.

## Features

- **Offline Map Support**: Uses MapLibre for map rendering with offline tile support
- **GPS Tracking**: High-accuracy GPS tracking with configurable distance filter and update intervals
- **Track Recording**: Records GPS tracks and saves them locally
- **Waypoint Management**: Save, view, and delete waypoints
- **Compass Support**: Heading and direction display
- **SQLite Database**: Local storage for waypoints and tracks
- **Permissions Handling**: Proper location and storage permissions

## Tech Stack

- React Native CLI
- TypeScript
- @maplibre/maplibre-react-native
- react-native-geolocation-service
- react-native-permissions
- react-native-sensors
- react-native-fs
- react-native-sqlite-storage
- @react-navigation/native

## Project Structure

```
OfflineGPSNavigation/
├── src/
│   ├── components/
│   │   └── GPSMap.tsx
│   ├── screens/
│   │   ├── MapScreen.tsx
│   │   ├── TrackingScreen.tsx
│   │   ├── WaypointsScreen.tsx
│   │   ├── MapDownloadScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   └── GPSService.ts
│   ├── database/
│   │   └── DatabaseService.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd OfflineGPSNavigation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **For Android, ensure you have the Android SDK set up.**

## Running the App

### iOS
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## Permissions

The app requires the following permissions:

### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS (`ios/OfflineGPSNavigation/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to your location for GPS navigation.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs access to your location for GPS navigation.</string>
```

## Configuration

### GPS Settings
- **High Accuracy**: Uses GPS satellites for maximum precision
- **Distance Filter**: Minimum distance (in meters) before a position update is triggered (default: 5m)
- **Update Interval**: Time between position updates in milliseconds (default: 2000ms)

### Offline Maps
- Map tiles can be downloaded for offline use
- Supports local tile folders in `/storage/maps/{z}/{x}/{y}.png` format
- MBTiles support is planned

## Usage

1. **Map Screen**: View your current position on the map, see GPS info panel
2. **Tracking**: Start/stop track recording, view recorded tracks
3. **Waypoints**: Save current location as waypoint, manage saved waypoints
4. **Offline Maps**: Download maps for offline use
5. **Settings**: Configure GPS accuracy, map style, and app preferences

## Database Schema

### Waypoints Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `latitude` (REAL)
- `longitude` (REAL)
- `altitude` (REAL)
- `description` (TEXT)
- `created_at` (TEXT)

### Tracks Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `created_at` (TEXT)
- `description` (TEXT)

### Track Points Table
- `id` (INTEGER PRIMARY KEY)
- `track_id` (INTEGER)
- `latitude` (REAL)
- `longitude` (REAL)
- `altitude` (REAL)
- `speed` (REAL)
- `heading` (REAL)
- `timestamp` (TEXT)

## Notes

- The app is designed to work completely offline after initial setup
- GPS accuracy depends on device hardware and satellite visibility
- For sea navigation, ensure the device has an unobstructed view of the sky
- Track recording can consume significant battery; use judiciously

## Troubleshooting

### TypeScript Errors
If you encounter TypeScript module resolution errors, ensure `tsconfig.json` has proper path mappings and `skipLibCheck` is enabled.

### Map Not Showing
- Check internet connection for initial map style loading
- Verify MapLibre is properly linked: `npx react-native link @maplibre/maplibre-react-native`
- For iOS, run `pod install` in the `ios` directory

### GPS Not Working
- Ensure location permissions are granted
- On Android, check that "High Accuracy" mode is enabled in device settings
- On iOS, verify location services are enabled

## License

MIT