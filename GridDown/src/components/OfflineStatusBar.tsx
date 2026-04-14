import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';

export function OfflineStatusBar() {
  const { gpsCoords, gpsAcquired, setGPSCoords, batteryLevel, setBatteryLevel } = useAppStore();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start blinking animation
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Get initial fix
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setGPSCoords({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          altitude: loc.coords.altitude,
          accuracy: loc.coords.accuracy,
        });
      } catch {}

      // Poll every 30 seconds
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
    })();

    return () => {
      subscription?.remove();
    };
  }, [setGPSCoords]);

  useEffect(() => {
    Battery.getBatteryLevelAsync().then((level) => setBatteryLevel(level));
    const sub = Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
      setBatteryLevel(level);
    });
    return () => sub.remove();
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
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textMuted,
  },
  coords: {
    flex: 1,
  },
  badge: {
    flex: 0,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginHorizontal: 8,
  },
  badgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.accent,
  },
  battery: {
    flex: 1,
    textAlign: 'right',
  },
});
