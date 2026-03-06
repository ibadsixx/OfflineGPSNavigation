import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import GPSService from '../services/GPSService';
import DatabaseService, { Track } from '../database/DatabaseService';

export default function TrackingScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackPoints, setTrackPoints] = useState<any[]>([]);
  const trackPointsRef = useRef<any[]>([]);

  useEffect(() => {
    return () => {
      if (isTracking) {
        GPSService.stopTracking();
      }
    };
  }, [isTracking]);

  const startTracking = async () => {
    try {
      const permissionsGranted = await GPSService.requestPermissions();
      if (!permissionsGranted) {
        Alert.alert('Permission Denied', 'Location permission is required for tracking.');
        return;
      }

      const trackName = `Track ${new Date().toLocaleString()}`;
      const trackId = await DatabaseService.createTrack(trackName, 'Auto-created track');
      setCurrentTrack({ id: trackId, name: trackName, created_at: new Date().toISOString() });
      setTrackPoints([]);
      trackPointsRef.current = [];

      GPSService.startTracking(
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          updateInterval: 2000
        },
        async (position: any) => {
          const point = {
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude,
            speed: position.speed,
            heading: position.heading,
            timestamp: new Date().toISOString()
          };

          trackPointsRef.current.push(point);
          setTrackPoints([...trackPointsRef.current]);

          if (currentTrack && currentTrack.id) {
            await DatabaseService.saveTrackPoint(currentTrack.id, point);
          }
        }
      );

      setIsTracking(true);
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const stopTracking = () => {
    GPSService.stopTracking();
    setIsTracking(false);
    Alert.alert('Tracking Stopped', `Track saved with ${trackPointsRef.current.length} points`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking</Text>
      <Text style={[styles.status, { color: isTracking ? 'green' : 'red' }]}>
        Status: {isTracking ? 'Recording...' : 'Stopped'}
      </Text>
      {currentTrack && (
        <Text style={styles.trackInfo}>
          Track ID: {currentTrack.id}
          {'\n'}Points: {trackPoints.length}
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
          onPress={isTracking ? stopTracking : startTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  status: {
    fontSize: 18,
    marginBottom: 20
  },
  trackInfo: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24
  },
  buttonContainer: {
    marginTop: 20
  }
});