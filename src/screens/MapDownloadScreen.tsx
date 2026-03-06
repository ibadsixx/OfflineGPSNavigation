import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Map: undefined;
  Tracking: undefined;
  Waypoints: undefined;
  MapDownload: undefined;
  Settings: undefined;
};

type MapDownloadScreenRouteProp = StackNavigationProp<RootStackParamList, 'MapDownload'>;

export default function MapDownloadScreen() {
  const [mapUrl, setMapUrl] = useState('');
  const [zoomLevel, setZoomLevel] = useState('15');
  const [region, setRegion] = useState('');
  const navigation = useNavigation();

  const downloadMap = () => {
    if (!mapUrl.trim()) {
      Alert.alert('Error', 'Please provide a map URL');
      return;
    }

    Alert.alert('Download Started', 'Map download will begin in the background');
    // TODO: Implement actual map download logic
  };

  const downloadOfflineMap = () => {
    if (!region.trim()) {
      Alert.alert('Error', 'Please provide a region name');
      return;
    }

    Alert.alert('Download Started', `Downloading map for ${region}`);
    // TODO: Implement offline map download
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Maps</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Download Map URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter map URL (e.g., https://example.com/tiles/{z}/{x}/{y}.png)"
          value={mapUrl}
          onChangeText={setMapUrl}
        />
        <TextInput
          style={styles.input}
          placeholder="Zoom level"
          value={zoomLevel}
          onChangeText={setZoomLevel}
          keyboardType="numeric"
        />
        <Button title="Download Map" onPress={downloadMap} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Download Region</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter region name (e.g., 'New York')"
          value={region}
          onChangeText={setRegion}
        />
        <Button title="Download Region Map" onPress={downloadOfflineMap} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MBTiles Support</Text>
        <Text style={styles.infoText}>
          MBTiles files can be loaded from your device storage.
        </Text>
        <Button title="Load MBTiles" onPress={() => {
          Alert.alert('MBTiles', 'MBTiles loading functionality coming soon');
        }} />
      </View>

      <Button 
        title="Back to Map" 
        onPress={() => navigation.navigate('Map' as never)} 
      />
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
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
    flex: 1
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});