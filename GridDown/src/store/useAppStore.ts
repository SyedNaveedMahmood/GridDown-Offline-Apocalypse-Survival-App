import { create } from 'zustand';

interface GPSCoords {
  lat: number;
  lng: number;
  altitude: number | null;
  accuracy: number | null;
}

interface AppState {
  // GPS
  gpsCoords: GPSCoords | null;
  gpsAcquired: boolean;
  setGPSCoords: (coords: GPSCoords | null) => void;

  // Battery
  batteryLevel: number | null;
  setBatteryLevel: (level: number | null) => void;

  // Font scale
  fontScale: number;
  setFontScale: (scale: number) => void;

  // DB ready
  dbReady: boolean;
  setDbReady: (ready: boolean) => void;

  // Path tracking
  isTracking: boolean;
  trackedPath: { lat: number; lng: number }[];
  setIsTracking: (v: boolean) => void;
  addPathPoint: (point: { lat: number; lng: number }) => void;
  clearPath: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  gpsCoords: null,
  gpsAcquired: false,
  setGPSCoords: (coords) => set({ gpsCoords: coords, gpsAcquired: coords !== null }),

  batteryLevel: null,
  setBatteryLevel: (level) => set({ batteryLevel: level }),

  fontScale: 1,
  setFontScale: (scale) => set({ fontScale: scale }),

  dbReady: false,
  setDbReady: (ready) => set({ dbReady: ready }),

  isTracking: false,
  trackedPath: [],
  setIsTracking: (v) => set({ isTracking: v }),
  addPathPoint: (point) =>
    set((state) => ({ trackedPath: [...state.trackedPath, point] })),
  clearPath: () => set({ trackedPath: [] }),
}));
