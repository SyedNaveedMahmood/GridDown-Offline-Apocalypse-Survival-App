import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

// Magnetic declination lookup — NOAA World Magnetic Model 2020-2025 (public domain)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DECLINATION_DATA: { grid: Record<string, number>; default: number } = require('../../assets/data/declination.json');

function getCardinal(deg: number): string {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const idx = Math.round(deg / 45) % 8;
  return cardinals[idx];
}

function getDeclination(lat: number, lng: number): number {
  // Round to nearest 10-degree grid point
  const latKey = Math.round(lat / 10) * 10;
  const lngKey = Math.round(lng / 10) * 10;
  const key = `${latKey}_${lngKey}`;
  return DECLINATION_DATA.grid[key] ?? DECLINATION_DATA.default;
}

export function CompassScreen() {
  const nav = useNavigation();
  const { gpsCoords } = useAppStore();
  const [heading, setHeading] = useState(0);
  const [useTrueNorth, setUseTrueNorth] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lastHeadingRef = useRef(0);

  useEffect(() => {
    let sub: any = null;
    try {
      Magnetometer.setUpdateInterval(100);
      sub = Magnetometer.addListener(({ x, y }: { x: number; y: number }) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        angle = (360 - angle) % 360;
        setHeading(Math.round(angle));
      });
    } catch {}
    return () => { try { sub?.remove(); } catch {} };
  }, []);

  useEffect(() => {
    const declination = gpsCoords
      ? getDeclination(gpsCoords.lat, gpsCoords.lng)
      : DECLINATION_TABLE.default;
    const adjustedHeading = useTrueNorth
      ? (heading + declination + 360) % 360
      : heading;

    Animated.timing(rotateAnim, {
      toValue: -adjustedHeading,
      duration: 100,
      useNativeDriver: true,
    }).start();
    lastHeadingRef.current = adjustedHeading;
  }, [heading, useTrueNorth, gpsCoords, rotateAnim]);

  const displayHeading = useTrueNorth && gpsCoords
    ? (heading + getDeclination(gpsCoords.lat, gpsCoords.lng) + 360) % 360
    : heading;

  const rotate = rotateAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        {/* Compass rose */}
        <View style={styles.compassRing}>
          <Animated.View style={[styles.compassInner, { transform: [{ rotate }] }]}>
            {/* Cardinal marks */}
            {['N', 'E', 'S', 'W'].map((dir, i) => (
              <Text
                key={dir}
                style={[styles.cardinal, {
                  position: 'absolute',
                  top: i === 0 ? 8 : i === 2 ? 248 : 128,
                  left: i === 3 ? 8 : i === 1 ? 248 : 128,
                  color: dir === 'N' ? Colors.danger : Colors.text,
                }]}
              >
                {dir}
              </Text>
            ))}
            {/* Needle */}
            <View style={styles.needleContainer}>
              <View style={styles.needleNorth} />
              <View style={styles.needleSouth} />
            </View>
          </Animated.View>
        </View>

        <Text style={styles.degrees}>{String(Math.round(displayHeading)).padStart(3, '0')}°</Text>
        <Text style={styles.cardinalDisplay}>{getCardinal(displayHeading)}</Text>

        <TouchableOpacity
          style={[styles.toggleBtn, useTrueNorth && styles.toggleBtnActive]}
          onPress={() => setUseTrueNorth((prev) => !prev)}
          accessibilityLabel={useTrueNorth ? 'Switch to Magnetic North' : 'Switch to True North'}
          accessibilityRole="button"
        >
          <Text style={[styles.toggleText, useTrueNorth && styles.toggleTextActive]}>
            {useTrueNorth ? '◉ TRUE NORTH' : '○ MAGNETIC NORTH'}
          </Text>
        </TouchableOpacity>

        {useTrueNorth && gpsCoords && (
          <Text style={styles.declinationNote}>
            Declination: {getDeclination(gpsCoords.lat, gpsCoords.lng) > 0 ? '+' : ''}
            {getDeclination(gpsCoords.lat, gpsCoords.lng)}°
          </Text>
        )}
      </View>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  compassRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  compassInner: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinal: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    fontWeight: 'bold',
  },
  needleContainer: {
    position: 'absolute',
    width: 4,
    height: 200,
    alignItems: 'center',
  },
  needleNorth: {
    width: 4,
    height: 100,
    backgroundColor: Colors.danger,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleSouth: {
    width: 4,
    height: 100,
    backgroundColor: Colors.textMuted,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  degrees: {
    fontFamily: Fonts.mono,
    fontSize: 48,
    color: Colors.gold,
    letterSpacing: 4,
  },
  cardinalDisplay: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.text,
  },
  toggleBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleBtnActive: { borderColor: Colors.accent },
  toggleText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMuted },
  toggleTextActive: { color: Colors.accent },
  declinationNote: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
});
