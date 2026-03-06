import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import TrackingScreen from '../screens/TrackingScreen';
import WaypointsScreen from '../screens/WaypointsScreen';
import MapDownloadScreen from '../screens/MapDownloadScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'GPS Navigation' }}
        />
        <Stack.Screen 
          name="Tracking" 
          component={TrackingScreen} 
          options={{ title: 'Track Recording' }}
        />
        <Stack.Screen 
          name="Waypoints" 
          component={WaypointsScreen} 
          options={{ title: 'Waypoints' }}
        />
        <Stack.Screen 
          name="MapDownload" 
          component={MapDownloadScreen} 
          options={{ title: 'Offline Maps' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}