import { magnetometer } from 'react-native-sensors';
import { useEffect, useState } from 'react';

export interface CompassHeading {
  heading: number;
  accuracy: number;
  timestamp: number;
}

class CompassService {
  private subscription: any = null;
  private currentHeading = 0;
  private headingCallback: ((heading: number) => void) | null = null;

  startCompass(callback: (heading: number) => void): void {
    this.headingCallback = callback;
    
    try {
      this.subscription = magnetometer.subscribe(({ x, y, z }: { x: number; y: number; z: number }) => {
        // Calculate heading from magnetometer data
        const heading = this.calculateHeading(x, y);
        this.currentHeading = heading;
        
        if (this.headingCallback) {
          this.headingCallback(heading);
        }
      });
    } catch (error) {
      console.error('Error starting compass:', error);
    }
  }

  stopCompass(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.headingCallback = null;
  }

  getCurrentHeading(): number {
    return this.currentHeading;
  }

  private calculateHeading(x: number, y: number): number {
    // Basic heading calculation from magnetometer
    // This is a simplified version - in production you'd want to
    // incorporate accelerometer data for tilt compensation
    let heading = Math.atan2(y, x) * (180 / Math.PI);
    heading = (heading + 360) % 360; // Normalize to 0-360
    return heading;
  }
}

export default new CompassService();