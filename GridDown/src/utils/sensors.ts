import { Barometer, Magnetometer } from 'expo-sensors';

export type BarometerReading = {
  pressure: number; // hPa
  relativeAltitude?: number | null;
};

export type MagnetometerReading = {
  x: number;
  y: number;
  z: number;
};

/**
 * Subscribe to barometer readings.
 * Calls `onReading` whenever a new pressure sample is available.
 * Returns an unsubscribe function.
 */
export function subscribeBarometer(
  onReading: (reading: BarometerReading) => void,
  intervalMs = 1000
): () => void {
  Barometer.setUpdateInterval(intervalMs);
  const sub = Barometer.addListener((data) => {
    onReading({
      pressure: data.pressure,
      relativeAltitude: (data as any).relativeAltitude ?? null,
    });
  });
  return () => sub.remove();
}

/**
 * Subscribe to magnetometer (compass) readings.
 * Calls `onReading` with raw x/y/z values whenever a new sample arrives.
 * Returns an unsubscribe function.
 */
export function subscribeMagnetometer(
  onReading: (reading: MagnetometerReading) => void,
  intervalMs = 100
): () => void {
  Magnetometer.setUpdateInterval(intervalMs);
  const sub = Magnetometer.addListener(onReading);
  return () => sub.remove();
}

/**
 * Convert raw magnetometer x/y to compass heading (0-359 degrees).
 * 0 = North, 90 = East, 180 = South, 270 = West.
 */
export function magnetometerToHeading(x: number, y: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return Math.round((360 - angle) % 360);
}

/**
 * Get a human-readable pressure trend description from two readings.
 * falling = storm approaching, rising = improving, steady = stable.
 */
export type PressureTrend = 'falling' | 'rising' | 'steady';

export function getPressureTrend(
  older: number,
  newer: number
): PressureTrend {
  const delta = newer - older;
  if (delta < -0.5) return 'falling';
  if (delta > 0.5) return 'rising';
  return 'steady';
}

/**
 * Barometer availability check.
 */
export async function isBarometerAvailable(): Promise<boolean> {
  const { granted, status } = await Barometer.requestPermissionsAsync().catch(() => ({ granted: false, status: 'denied' as const }));
  return granted || status === 'granted';
}
