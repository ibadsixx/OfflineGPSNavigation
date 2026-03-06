import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import DatabaseService, { Waypoint } from '../database/DatabaseService';
import GPSService from '../services/GPSService';

export default function WaypointsScreen() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newWaypointName, setNewWaypointName] = useState('');
  const [currentPosition, setCurrentPosition] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    loadWaypoints();
  }, []);

  const loadWaypoints = async () => {
    try {
      const loadedWaypoints = await DatabaseService.getWaypoints();
      setWaypoints(loadedWaypoints);
    } catch (error) {
      console.error('Error loading waypoints:', error);
    }
  };

  const saveCurrentLocation = async () => {
    try {
      const position = await GPSService.getCurrentPosition();
      setCurrentPosition({
        latitude: position.latitude,
        longitude: position.longitude
      });
      setShowForm(true);
    } catch (error) {
      console.error('Error getting current position:', error);
      Alert.alert('Error', 'Could not get current GPS position');
    }
  };

  const saveWaypoint = async () => {
    if (!currentPosition || !newWaypointName.trim()) {
      Alert.alert('Error', 'Please provide a name and location');
      return;
    }

    try {
      await DatabaseService.saveWaypoint({
        name: newWaypointName,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        altitude: 0,
        created_at: new Date().toISOString()
      });

      setNewWaypointName('');
      setShowForm(false);
      setCurrentPosition(null);
      loadWaypoints();
      Alert.alert('Success', 'Waypoint saved');
    } catch (error) {
      console.error('Error saving waypoint:', error);
      Alert.alert('Error', 'Failed to save waypoint');
    }
  };

  const deleteWaypoint = async (id: number) => {
    try {
      await DatabaseService.deleteWaypoint(id);
      loadWaypoints();
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      Alert.alert('Error', 'Failed to delete waypoint');
    }
  };

  const renderWaypoint = ({ item }: { item: Waypoint }) => (
    <View style={styles.waypointItem}>
      <View style={styles.waypointInfo}>
        <Text style={styles.waypointName}>{item.name}</Text>
        <Text style={styles.waypointCoords}>
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </View>
      <Button title="Delete" onPress={() => deleteWaypoint(item.id!)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waypoints</Text>

      {!showForm ? (
        <Button title="Save Current Location" onPress={saveCurrentLocation} />
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Waypoint name"
            value={newWaypointName}
            onChangeText={setNewWaypointName}
          />
          {currentPosition && (
            <Text style={styles.coords}>
              Lat: {currentPosition.latitude.toFixed(6)}
              {'\n'}Lon: {currentPosition.longitude.toFixed(6)}
            </Text>
          )}
          <View style={styles.formButtons}>
            <Button title="Save" onPress={saveWaypoint} />
            <Button title="Cancel" onPress={() => {
              setShowForm(false);
              setCurrentPosition(null);
            }} />
          </View>
        </View>
      )}

      <FlatList
        data={waypoints}
        renderItem={renderWaypoint}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        style={styles.list}
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
  form: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4
  },
  coords: {
    marginBottom: 10,
    fontSize: 14,
    color: '#666'
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  list: {
    flex: 1
  },
  waypointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  waypointInfo: {
    flex: 1
  },
  waypointName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  waypointCoords: {
    fontSize: 12,
    color: '#666'
  }
});