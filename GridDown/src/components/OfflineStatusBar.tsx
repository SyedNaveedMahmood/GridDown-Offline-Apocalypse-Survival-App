import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';

// Lazy-load native modules so a missing/broken module doesn't crash the app
let Location: typeof import('expo-location') | null = null;
let Battery: typeof import('expo-battery') | null = null;
try { Location = require('expo-location'); } catch {}
try { Battery = require('expo-battery'); } catch {}

export function OfflineStatusBar() {
  const { gpsCoords, gpsAcquired, setGPSCoords, batteryLevel, setBatteryLevel } = useAppStore();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Blinking [OFFLINE] badge
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  // GPS
  useEffect(() => {
    if (!Location) return;
    let subscription: any = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setGPSCoords({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          altitude: loc.coords.altitude,
          accuracy: loc.coords.accuracy,
        });

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 30000, distanceInterval: 10 },
          (loc) => {
            setGPSCoords({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              altitude: loc.coords.altitude,
              accuracy: loc.coords.accuracy,
            });
          }
        );
      } catch {
        // GPS not available — silent fail, status bar shows '-- acquiring GPS --'
      }
    })();

    return () => { try { subscription?.remove(); } catch {} };
  }, [setGPSCoords]);

  // Battery
  useEffect(() => {
    if (!Battery) return;
    let sub: any = null;

    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        if (typeof level === 'number') setBatteryLevel(level);
      } catch {}

      try {
        sub = Battery.addBatteryLevelListener(({ batteryLevel: level }: { batteryLevel: number }) => {
          if (typeof level === 'number') setBatteryLevel(level);
        });
      } catch {}
    })();

    return () => { try { sub?.remove(); } catch {} };
  }, [setBatteryLevel]);

  const formatCoords = () => {
    if (!gpsCoords) return '-- acquiring GPS --';
    const lat = gpsCoords.lat >= 0
      ? `${gpsCoords.lat.toFixed(4)}°N`
      : `${Math.abs(gpsCoords.lat).toFixed(4)}°S`;
    const lng = gpsCoords.lng >= 0
      ? `${gpsCoords.lng.toFixed(4)}°E`
      : `${Math.abs(gpsCoords.lng).toFixed(4)}°W`;
    return `${lat}  ${lng}`;
  };

  const batteryPct = batteryLevel !== null ? Math.round(batteryLevel * 100) : null;
  const batteryColor = batteryPct !== null && batteryPct < 20 ? Colors.danger : Colors.textMuted;

  return (
    <View style={styles.container}>
      <Text
        style={[styles.mono, styles.coords, !gpsAcquired && { color: Colors.textDim }]}
        numberOfLines={1}
      >
        {formatCoords()}
      </Text>

      <Animated.View style={[styles.badge, { opacity: blinkAnim }]}>
        <Text style={styles.badgeText}>[OFFLINE]</Text>
      </Animated.View>

      <Text style={[styles.mono, styles.battery, { color: batteryColor }]}>
        {batteryPct !== null ? `BATT ${batteryPct}%` : 'BATT --'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 28,
    backgroundColor: Colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  mono: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  coords: { flex: 1 },
  badge: {
    flex: 0,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginHorizontal: 8,
  },
  badgeText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.accent },
  battery: { flex: 1, textAlign: 'right' },
});
