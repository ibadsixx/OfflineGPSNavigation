import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export interface Waypoint {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  description?: string;
  created_at: string;
}

export interface TrackPoint {
  id?: number;
  track_id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface Track {
  id?: number;
  name: string;
  created_at: string;
  description?: string;
}

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase(
        {
          name: 'gps_navigation.db',
          location: 'default',
        },
        this.onSuccess,
        this.onError
      );

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private onSuccess = () => {
    console.log('Database opened successfully');
  };

  private onError = (error: any) => {
    console.error('Database error:', error);
  };

  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const createWaypointsTable = `
      CREATE TABLE IF NOT EXISTS waypoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        description TEXT,
        created_at TEXT NOT NULL
      )
    `;

    const createTracksTable = `
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        description TEXT
      )
    `;

    const createTrackPointsTable = `
      CREATE TABLE IF NOT EXISTS track_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track_id INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        speed REAL,
        heading REAL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
      )
    `;

    try {
      await this.database.executeSql(createWaypointsTable);
      await this.database.executeSql(createTracksTable);
      await this.database.executeSql(createTrackPointsTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  async saveWaypoint(waypoint: Omit<Waypoint, 'id'>): Promise<number> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT INTO waypoints (name, latitude, longitude, altitude, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.database.executeSql(query, [
        waypoint.name,
        waypoint.latitude,
        waypoint.longitude,
        waypoint.altitude || null,
        waypoint.description || null,
        waypoint.created_at,
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Failed to save waypoint:', error);
      throw error;
    }
  }

  async getWaypoints(): Promise<Waypoint[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT * FROM waypoints ORDER BY created_at DESC';

    try {
      const [result] = await this.database.executeSql(query);
      const waypoints: Waypoint[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        waypoints.push(result.rows.item(i));
      }

      return waypoints;
    } catch (error) {
      console.error('Failed to get waypoints:', error);
      throw error;
    }
  }

  async deleteWaypoint(id: number): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = 'DELETE FROM waypoints WHERE id = ?';

    try {
      await this.database.executeSql(query, [id]);
    } catch (error) {
      console.error('Failed to delete waypoint:', error);
      throw error;
    }
  }

  async createTrack(name: string, description?: string): Promise<number> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = 'INSERT INTO tracks (name, created_at, description) VALUES (?, ?, ?)';

    try {
      const [result] = await this.database.executeSql(query, [
        name,
        new Date().toISOString(),
        description || null,
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Failed to create track:', error);
      throw error;
    }
  }

  async saveTrackPoint(trackId: number, point: Omit<TrackPoint, 'id' | 'track_id'>): Promise<number> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT INTO track_points (track_id, latitude, longitude, altitude, speed, heading, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.database.executeSql(query, [
        trackId,
        point.latitude,
        point.longitude,
        point.altitude || null,
        point.speed || null,
        point.heading || null,
        point.timestamp,
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Failed to save track point:', error);
      throw error;
    }
  }

  async getTrackPoints(trackId: number): Promise<TrackPoint[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT * FROM track_points WHERE track_id = ? ORDER BY timestamp ASC';

    try {
      const [result] = await this.database.executeSql(query, [trackId]);
      const points: TrackPoint[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        points.push(result.rows.item(i));
      }

      return points;
    } catch (error) {
      console.error('Failed to get track points:', error);
      throw error;
    }
  }

  async getTracks(): Promise<(Track & { point_count?: number })[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT t.*, COUNT(tp.id) as point_count
      FROM tracks t
      LEFT JOIN track_points tp ON t.id = tp.track_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    try {
      const [result] = await this.database.executeSql(query);
      const tracks: (Track & { point_count?: number })[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        tracks.push(result.rows.item(i));
      }

      return tracks;
    } catch (error) {
      console.error('Failed to get tracks:', error);
      throw error;
    }
  }

  async deleteTrack(trackId: number): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      await this.database.executeSql('DELETE FROM track_points WHERE track_id = ?', [trackId]);
      await this.database.executeSql('DELETE FROM tracks WHERE id = ?', [trackId]);
    } catch (error) {
      console.error('Failed to delete track:', error);
      throw error;
    }
  }
}

export default new DatabaseService();