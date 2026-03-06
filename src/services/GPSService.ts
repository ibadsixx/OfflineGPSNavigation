import Geolocation, { GeoOptions, GeoPosition, GeoError, GeoWatchOptions } from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
}

export interface GPSServiceOptions {
  enableHighAccuracy: boolean;
  distanceFilter: number;
  updateInterval: number;
}

class GPSService {
  private watchId: number | null = null;
  private isTracking = false;
  private currentPosition: GPSPosition | null = null;
  private positionCallback: ((position: GPSPosition) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for GPS navigation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        return new Promise((resolve) => {
          Geolocation.requestAuthorization('whenInUse');
          // Assume granted for now - in production you'd check the actual status
          setTimeout(() => resolve(true), 100);
        });
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  getCurrentPosition(options: GPSServiceOptions = {
    enableHighAccuracy: true,
    distanceFilter: 5,
    updateInterval: 2000
  }): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      const geoOptions: GeoOptions = {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.updateInterval,
        maximumAge: 0,
      };

      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const gpsPosition: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude ?? undefined,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.currentPosition = gpsPosition;
          resolve(gpsPosition);
        },
        (error: GeoError) => {
          console.error('Error getting current position:', error);
          reject(error);
        },
        geoOptions
      );
    });
  }

  startTracking(options: GPSServiceOptions = {
    enableHighAccuracy: true,
    distanceFilter: 5,
    updateInterval: 2000
  }, callback: (position: GPSPosition) => void): void {
    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return;
    }

    this.positionCallback = callback;
    this.isTracking = true;

    const geoOptions: GeoWatchOptions = {
      enableHighAccuracy: options.enableHighAccuracy,
      distanceFilter: options.distanceFilter,
      interval: options.updateInterval,
      fastestInterval: options.updateInterval / 2,
    };

    this.watchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        this.currentPosition = gpsPosition;
        if (this.positionCallback) {
          this.positionCallback(gpsPosition);
        }
      },
      (error: GeoError) => {
        console.error('Error watching position:', error);
        this.stopTracking();
      },
      geoOptions
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.positionCallback = null;
  }

  watchPosition(callback: (position: GPSPosition) => void): void {
    this.positionCallback = callback;
  }

  getCurrentPositionSync(): GPSPosition | null {
    return this.currentPosition;
  }

  isTrackingActive(): boolean {
    return this.isTracking;
  }
}

export default new GPSService();