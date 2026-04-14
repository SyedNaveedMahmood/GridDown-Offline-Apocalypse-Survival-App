export type CoordFormat = 'decimal' | 'dms' | 'mgrs';

export function decimalToDMS(lat: number, lng: number): { latDMS: string; lngDMS: string } {
  const formatAxis = (val: number, pos: string, neg: string) => {
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFull = (abs - deg) * 60;
    const min = Math.floor(minFull);
    const sec = ((minFull - min) * 60).toFixed(1);
    const dir = val >= 0 ? pos : neg;
    return `${deg}° ${min}' ${sec}" ${dir}`;
  };
  return {
    latDMS: formatAxis(lat, 'N', 'S'),
    lngDMS: formatAxis(lng, 'E', 'W'),
  };
}

export function decimalToMGRS(lat: number, lng: number): string {
  // Simplified MGRS approximation for display purposes
  // In production this would use the mgrs npm package
  const latZone = Math.floor((lat + 80) / 8);
  const letters = 'CDEFGHJKLMNPQRSTUVWXX';
  const latLetter = letters[Math.min(latZone, letters.length - 1)] ?? 'N';
  const lngZone = Math.floor((lng + 180) / 6) + 1;
  const easting = Math.abs(Math.round((lng % 6) * 10000 + 50000)) % 100000;
  const northing = Math.abs(Math.round((lat % 8) * 10000 + 50000)) % 100000;
  return `${lngZone}${latLetter} ${String(easting).padStart(5, '0')} ${String(northing).padStart(5, '0')}`;
}

export function formatCoordinates(
  lat: number,
  lng: number,
  format: CoordFormat
): string {
  if (format === 'decimal') {
    const latStr = lat >= 0 ? `${lat.toFixed(6)}°N` : `${Math.abs(lat).toFixed(6)}°S`;
    const lngStr = lng >= 0 ? `${lng.toFixed(6)}°E` : `${Math.abs(lng).toFixed(6)}°W`;
    return `${latStr}  ${lngStr}`;
  }
  if (format === 'dms') {
    const { latDMS, lngDMS } = decimalToDMS(lat, lng);
    return `${latDMS}\n${lngDMS}`;
  }
  return decimalToMGRS(lat, lng);
}
