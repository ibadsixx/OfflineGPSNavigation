import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import GPSMap from '../components/GPSMap';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Map: undefined;
  Tracking: undefined;
  Waypoints: undefined;
  MapDownload: undefined;
  Settings: undefined;
};

type MapScreenRouteProp = StackNavigationProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const navigation = useNavigation();
  const [speed, setSpeed] = useState<string>('0');
  const [heading, setHeading] = useState<string>('0');
  const [altitude, setAltitude] = useState<string>('0');

  useEffect(() => {
    const gpsService = require('../services/GPSService');
    
    const subscription = gpsService.watchPosition((position: any) => {
      setSpeed(position.speed?.toFixed(2) || '0');
      setHeading(position.heading?.toFixed(0) || '0');
      setAltitude(position.altitude?.toFixed(0) || '0');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as never);
  };

  return (
    <View style={styles.container}>
      <GPSMap 
        showTrack={false} 
        showWaypoints={false}
      />
      <View style={styles.infoPanel}>
        <Text style={styles.label}>GPS Info</Text>
        <Text style={styles.value}>Speed: {speed} m/s</Text>
        <Text style={styles.value}>Heading: {heading}°</Text>
        <Text style={styles.value}>Altitude: {altitude} m</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
          title="Start Tracking" 
          onPress={() => handleNavigate('Tracking')} 
        />
        <Button 
          title="Waypoints" 
          onPress={() => handleNavigate('Waypoints')} 
        />
        <Button 
          title="Offline Maps" 
          onPress={() => handleNavigate('MapDownload')} 
        />
        <Button 
          title="Settings" 
          onPress={() => handleNavigate('Settings')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    marginBottom: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  }
});