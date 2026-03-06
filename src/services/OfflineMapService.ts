import RNFS from 'react-native-fs';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

export interface Tile {
  z: number;
  x: number;
  y: number;
  data: string; // base64 encoded image
}

export interface MapRegion {
  minZoom: number;
  maxZoom: number;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

class OfflineMapService {
  private storagePath: string = '';
  private mbtilesPath: string = '';
  private isInitialized: boolean = false;

  constructor() {
    this.initializeStoragePath();
  }

  private async initializeStoragePath(): Promise<void> {
    try {
      // For Android, use ExternalStorageDirectoryPath (SD Card)
      if (Platform.OS === 'android') {
        // Use ExternalStorageDirectoryPath for Android 10+ with Scoped Storage
        // This points to the primary shared storage (usually internal "SD Card" or external microSD)
        this.storagePath = `${RNFS.ExternalStorageDirectoryPath}/OfflineMaps`;
        
        // Verify the path is accessible by trying to access it
        try {
          const exists = await RNFS.exists(this.storagePath);
          if (!exists) {
            await this.ensureDirectoryExists(this.storagePath);
          }
        } catch (error) {
          console.warn('External storage not accessible, falling back to internal storage');
          this.storagePath = `${RNFS.DocumentDirectoryPath}/OfflineMaps`;
          await this.ensureDirectoryExists(this.storagePath);
        }
      } else {
        // For iOS, use DocumentDirectoryPath (iOS doesn't have SD Card concept)
        this.storagePath = `${RNFS.DocumentDirectoryPath}/OfflineMaps`;
        await this.ensureDirectoryExists(this.storagePath);
      }

      this.isInitialized = true;
      console.log('OfflineMapService initialized with storage path:', this.storagePath);
    } catch (error) {
      console.error('Failed to initialize storage path:', error);
      this.storagePath = `${RNFS.DocumentDirectoryPath}/OfflineMaps`;
      this.isInitialized = true;
    }
  }

  /**
   * Request storage permissions for Android
   */
  async requestStoragePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit storage permissions for app directories
    }

    try {
      // For Android 10+ (API 29+), we need READ_EXTERNAL_STORAGE and WRITE_EXTERNAL_STORAGE
      // For Android 13+ (API 33+), we also need READ_MEDIA_IMAGES
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      // Add READ_MEDIA_IMAGES for Android 13+
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }

      const result = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(result).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Storage Permission Required',
          'Offline maps need storage access to save map tiles to your SD Card.'
        );
      }

      return allGranted;
    } catch (error) {
      console.error('Error requesting storage permissions:', error);
      return false;
    }
  }

  /**
   * Check if storage is ready and accessible
   */
  async isStorageReady(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeStoragePath();
    }

    try {
      // Check if the storage path exists and is accessible
      const exists = await RNFS.exists(this.storagePath);
      if (!exists) {
        await this.ensureDirectoryExists(this.storagePath);
      }
      
      // Try to write a test file
      const testPath = `${this.storagePath}/.test_write`;
      await RNFS.writeFile(testPath, 'test', 'utf8');
      await RNFS.unlink(testPath);
      
      return true;
    } catch (error) {
      console.error('Storage not ready:', error);
      return false;
    }
  }

  /**
   * Download a tile and save it to SD Card
   * @param url - The tile URL with placeholders {z}, {x}, {y}
   * @param tileName - The tile filename (usually "{z}_{x}_{y}.png")
   */
  async downloadTile(url: string, tileName: string): Promise<void> {
    try {
      // Ensure storage is ready
      if (!(await this.isStorageReady())) {
        throw new Error('Storage is not ready or accessible');
      }

      // Parse tile coordinates from tileName (format: "z_x_y.png")
      const parts = tileName.replace('.png', '').split('_');
      if (parts.length !== 3) {
        throw new Error(`Invalid tile name format: ${tileName}`);
      }

      const [z, x, y] = parts.map(Number);
      if (isNaN(z) || isNaN(x) || isNaN(y)) {
        throw new Error(`Invalid tile coordinates in: ${tileName}`);
      }

      // Create directory structure: /OfflineMaps/z/x/
      const tileDir = `${this.storagePath}/${z}/${x}`;
      await this.ensureDirectoryExists(tileDir);

      // Construct the full URL by replacing placeholders
      const formattedUrl = url
        .replace('{z}', z.toString())
        .replace('{x}', x.toString())
        .replace('{y}', y.toString());

      // Download the tile
      const response = await fetch(formattedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download tile: ${response.status} ${response.statusText}`);
      }

      const base64 = await this.responseToBase64(response);
      const tilePath = `${tileDir}/${y}.png`;

      // Write the tile to SD Card
      await RNFS.writeFile(tilePath, base64, 'base64');
      
      console.log(`Tile saved to SD Card: ${tilePath}`);
    } catch (error) {
      console.error('Error downloading tile:', error);
      throw error;
    }
  }

  /**
   * Get the full path to a tile on the SD Card
   * @param tileName - The tile filename (usually "{z}_{x}_{y}.png")
   */
  getTilePath(tileName: string): string {
    // Parse tile coordinates from tileName
    const parts = tileName.replace('.png', '').split('_');
    if (parts.length !== 3) {
      console.error(`Invalid tile name format: ${tileName}`);
      return '';
    }

    const [z, x, y] = parts.map(Number);
    if (isNaN(z) || isNaN(x) || isNaN(y)) {
      console.error(`Invalid tile coordinates in: ${tileName}`);
      return '';
    }

    const tilePath = `${this.storagePath}/${z}/${x}/${y}.png`;
    return tilePath;
  }

  /**
   * Check if a tile exists on the SD Card
   * @param tileName - The tile filename (usually "{z}_{x}_{y}.png")
   */
  async tileExists(tileName: string): Promise<boolean> {
    try {
      const tilePath = this.getTilePath(tileName);
      if (!tilePath) {
        return false;
      }
      return await RNFS.exists(tilePath);
    } catch (error) {
      console.error('Error checking tile existence:', error);
      return false;
    }
  }

  /**
   * Get the base storage path (SD Card / OfflineMaps)
   */
  getStoragePath(): string {
    return this.storagePath;
  }

  /**
   * Get the total available space on the SD Card (in bytes)
   */
  async getAvailableSpace(): Promise<number> {
    try {
      const stats = await RNFS.getFSInfo();
      return stats.freeSpace || 0;
    } catch (error) {
      console.error('Error getting available space:', error);
      return 0;
    }
  }

  /**
   * Get the total used space by offline maps (in bytes)
   */
  async getUsedSpace(): Promise<number> {
    try {
      return await this.getFolderSize(this.storagePath);
    } catch (error) {
      console.error('Error calculating used space:', error);
      return 0;
    }
  }

  /**
   * Clear all offline maps from SD Card
   */
  async clearAllMaps(): Promise<void> {
    try {
      if (await RNFS.exists(this.storagePath)) {
        await RNFS.unlink(this.storagePath);
        await this.ensureDirectoryExists(this.storagePath);
        console.log('All offline maps cleared from SD Card');
      }
    } catch (error) {
      console.error('Error clearing maps:', error);
      throw error;
    }
  }

  /**
   * Get a list of all downloaded map regions (zoom levels)
   */
  async getAvailableZoomLevels(): Promise<number[]> {
    try {
      const directories = await RNFS.readdir(this.storagePath);
      const zoomLevels: number[] = [];

      for (const dir of directories) {
        const zoom = parseInt(dir, 10);
        if (!isNaN(zoom)) {
          zoomLevels.push(zoom);
        }
      }

      return zoomLevels.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error reading zoom levels:', error);
      return [];
    }
  }

  /**
   * Get a list of all tile coordinates for a given zoom level
   */
  async getTileCoordinatesForZoom(zoom: number): Promise<{ x: number; y: number }[]> {
    try {
      const zoomPath = `${this.storagePath}/${zoom}`;
      const xDirectories = await RNFS.readdir(zoomPath);
      const coordinates: { x: number; y: number }[] = [];

      for (const xDir of xDirectories) {
        const x = parseInt(xDir, 10);
        if (isNaN(x)) continue;

        const xPath = `${zoomPath}/${xDir}`;
        const yFiles = await RNFS.readdir(xPath);

        for (const yFile of yFiles) {
          const y = parseInt(yFile.replace('.png', ''), 10);
          if (!isNaN(y)) {
            coordinates.push({ x, y });
          }
        }
      }

      return coordinates;
    } catch (error) {
      console.error('Error reading tile coordinates:', error);
      return [];
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        // For Android external storage, use appropriate options
        const options = Platform.OS === 'android' 
          ? { NSURLIsExcludedFromBackupKey: true } 
          : undefined;
        await RNFS.mkdir(dirPath, options);
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  private async responseToBase64(response: Response): Promise<string> {
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async getFolderSize(path: string): Promise<number> {
    try {
      const files = await RNFS.readdir(path);
      let totalSize = 0;

      for (const file of files) {
        try {
          const stats = await RNFS.stat(`${path}/${file}`);
          if (stats.isFile()) {
            totalSize += Number(stats.size);
          } else if (stats.isDirectory()) {
            totalSize += await this.getFolderSize(`${path}/${file}`);
          }
        } catch (err) {
          // Skip files that can't be stat'd
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating folder size:', error);
      return 0;
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new OfflineMapService();
