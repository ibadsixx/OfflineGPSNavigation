import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MapView, type MapViewRef, PointAnnotation, ShapeSource, LineLayer, Camera, UserLocation } from '@maplibre/maplibre-react-native';
import GPSService from '../services/GPSService';
import { GPSPosition } from '../services/GPSService';

interface GPSMapProps {
  showTrack?: boolean;
  showWaypoints?: boolean;
  waypoints?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  trackPoints?: Array<{
    latitude: number;
    longitude: number;
  }>;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
}

const { width, height } = Dimensions.get('window');

const GPSMap: React.FC<GPSMapProps> = ({
  showTrack = true,
  showWaypoints = true,
  waypoints = [],
  trackPoints = [],
  onMapPress
}) => {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [camera, setCamera] = useState<{ zoom: number; center: [number, number] }>({
    zoom: 15,
    center: [0, 0]
  });
  const mapRef = useRef<MapViewRef>(null);

  useEffect(() => {
    const gpsService = GPSService;

    const startTracking = async () => {
      try {
        const hasPermission = await gpsService.requestPermissions();
        if (!hasPermission) {
          console.warn('Location permissions not granted');
          return;
        }

        gpsService.startTracking(
          {
            enableHighAccuracy: true,
            distanceFilter: 5,
            updateInterval: 2000
          },
          (position) => {
            setCurrentPosition(position);
            if (position.heading) {
              setHeading(position.heading);
            }
          }
        );
      } catch (error) {
        console.error('Error starting GPS tracking:', error);
      }
    };

    startTracking();

    return () => {
      gpsService.stopTracking();
    };
  }, []);

  const handleMapPress = (event: any) => {
    if (onMapPress) {
      const { coordinate } = event;
      onMapPress({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      });
    }
  };

  const centerOnUser = () => {
    if (currentPosition) {
      setCamera({
        zoom: 15,
        center: [currentPosition.longitude, currentPosition.latitude]
      });
    }
  };

  const mapStyle = 'https://demotiles.maplibre.org/style.json';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={mapStyle}
        onPress={handleMapPress}
      >
        <Camera
          zoomLevel={camera.zoom}
          centerCoordinate={camera.center}
          animationMode="flyTo"
          animationDuration={1000}
        />

        <UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
        />

        {/* Current position marker */}
        {currentPosition && (
          <PointAnnotation
            id="currentPosition"
            coordinate={[currentPosition.longitude, currentPosition.latitude]}
            title="You are here"
          >
            <></>
          </PointAnnotation>
        )}

        {/* Track polyline */}
        {showTrack && trackPoints.length > 1 && (
          <ShapeSource
            id="trackSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: trackPoints.map(point => [point.longitude, point.latitude])
              },
              properties: {}
            }}
          >
            <LineLayer
              id="trackLayer"
              style={{
                lineColor: '#007AFF',
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </ShapeSource>
        )}

        {/* Waypoint markers */}
        {showWaypoints && waypoints.map((waypoint) => (
          <PointAnnotation
            key={waypoint.id}
            id={`waypoint-${waypoint.id}`}
            coordinate={[waypoint.longitude, waypoint.latitude]}
            title={waypoint.name}
          >
            <></>
          </PointAnnotation>
        ))}
      </MapView>

      {/* Compass overlay */}
      {currentPosition && (
        <View style={styles.compassContainer}>
          <View style={[styles.compassArrow, { transform: [{ rotate: `${heading}deg` }] }]}>
            <View style={styles.compassNeedle} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  map: {
    width: width,
    height: height
  },
  compassContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  compassArrow: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  compassNeedle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'red'
  }
});

export default GPSMap;
