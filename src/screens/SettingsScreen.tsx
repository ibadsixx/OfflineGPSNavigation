import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Switch, TextInput, Alert } from 'react-native';
import GPSService from '../services/GPSService';

export default function SettingsScreen() {
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [distanceFilter, setDistanceFilter] = useState('5');
  const [updateInterval, setUpdateInterval] = useState('2000');
  const [mapStyle, setMapStyle] = useState('outdoors-v12');
  const [compassEnabled, setCompassEnabled] = useState(true);

  const testGPS = async () => {
    try {
      const permissionsGranted = await GPSService.requestPermissions();
      if (!permissionsGranted) {
        Alert.alert('Permission Denied', 'Location permission is required for GPS testing.');
        return;
      }

      const position = await GPSService.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        distanceFilter: parseInt(distanceFilter),
        updateInterval: parseInt(updateInterval)
      });

      Alert.alert('GPS Test Success', 
        `Latitude: ${position.latitude}\n` +
        `Longitude: ${position.longitude}\n` +
        `Accuracy: ${position.accuracy}m\n` +
        `Speed: ${position.speed || 0}m/s\n` +
        `Heading: ${position.heading || 0}°`
      );
    } catch (error) {
      Alert.alert('GPS Test Failed', 'Could not get GPS position');
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all waypoints and tracks?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data clearing
            Alert.alert('Cleared', 'All data has been cleared');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Settings</Text>
        <View style={styles.settingItem}>
          <Text>High Accuracy</Text>
          <Switch value={highAccuracy} onValueChange={setHighAccuracy} />
        </View>
        <View style={styles.settingItem}>
          <Text>Distance Filter (meters)</Text>
          <TextInput
            style={styles.input}
            value={distanceFilter}
            onChangeText={setDistanceFilter}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.settingItem}>
          <Text>Update Interval (ms)</Text>
          <TextInput
            style={styles.input}
            value={updateInterval}
            onChangeText={setUpdateInterval}
            keyboardType="numeric"
          />
        </View>
        <Button title="Test GPS" onPress={testGPS} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map Settings</Text>
        <View style={styles.settingItem}>
          <Text>Map Style</Text>
          <TextInput
            style={styles.input}
            value={mapStyle}
            onChangeText={setMapStyle}
          />
        </View>
        <View style={styles.settingItem}>
          <Text>Compass</Text>
          <Switch value={compassEnabled} onValueChange={setCompassEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Button title="Clear All Data" onPress={clearData} color="red" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.infoText}>
          Offline GPS Navigation App
          {'\n'}Version: 1.0.0
          {'\n'}Works without internet connection
        </Text>
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
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 10
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});