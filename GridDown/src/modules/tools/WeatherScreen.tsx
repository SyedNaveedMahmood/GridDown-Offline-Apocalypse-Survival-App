import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Barometer } from 'expo-sensors';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

const CLOUDS = [
  { name: 'Cumulonimbus', alt: 'Any altitude', symbol: '⛈', warning: true, meaning: 'IMMINENT STORM. Thunderstorms, lightning, heavy rain, hail, tornadoes. Seek shelter immediately.' },
  { name: 'Cumulus', alt: 'Low-mid', symbol: '⛅', warning: false, meaning: 'Fair weather if small and flat-based. Growing rapidly = storm developing within 2-4 hours.' },
  { name: 'Stratus', alt: 'Low', symbol: '🌫', warning: false, meaning: 'Low gray layer covering sky. Drizzle or light rain. Fog at ground level. Little change expected.' },
  { name: 'Nimbostratus', alt: 'Low-mid', symbol: '🌧', warning: false, meaning: 'Steady, persistent rain or snow. Will last hours to days. Plan for sustained precipitation.' },
  { name: 'Cirrus', alt: 'High (>20,000ft)', symbol: '🌤', warning: false, meaning: 'Thin wispy white streaks. Fair now but weather change likely in 24-48 hours. Watch for worsening.' },
  { name: 'Cirrostratus', alt: 'High', symbol: '🌥', warning: false, meaning: 'Thin sheet covering sky, halo around sun or moon. Rain or snow within 12-24 hours.' },
  { name: 'Altostratus', alt: 'Mid (6,500-20,000ft)', symbol: '☁', warning: false, meaning: 'Gray to blue-gray sheet. Sun appears as through frosted glass. Continuous rain within 6-12 hours.' },
  { name: 'Altocumulus', alt: 'Mid', symbol: '🌤', warning: false, meaning: 'Gray/white patchy clouds. Thunderstorms possible in afternoon if warm and humid.' },
  { name: 'Fog', alt: 'Ground level', symbol: '🌁', warning: false, meaning: 'Stratus at ground level. Navigation hazard. Typically burns off mid-morning. Do not travel in dense fog.' },
  { name: 'Clear Sky', alt: 'N/A', symbol: '☀', warning: false, meaning: 'Fair weather. Cold overnight (no cloud cover = radiation cooling). Morning frost possible.' },
];

const NATURAL_SIGNS = [
  { sign: 'Red sky at morning', meaning: 'Weather warning. Moisture and dust particles indicate approaching weather system. Do not travel far.', reliable: true },
  { sign: 'Red sky at evening', meaning: 'Fair weather approaching from west. Good conditions likely tomorrow.', reliable: true },
  { sign: 'Rapidly building cumulus clouds', meaning: 'Convective storm developing. Seek shelter within 1-2 hours.', reliable: true },
  { sign: 'Sudden drop in temperature', meaning: 'Cold front approaching. May bring strong winds and storms.', reliable: true },
  { sign: 'Unusual insect activity', meaning: 'Many insects flying low = low pressure approaching. Storm within hours.', reliable: false },
  { sign: 'Pine cone opening', meaning: 'Dry weather. Closing = moisture increasing.', reliable: false },
  { sign: 'Smoke rising straight up', meaning: 'High pressure, stable air. Fair weather.', reliable: true },
  { sign: 'Smoke drifting low to ground', meaning: 'Low pressure, moisture. Storm approaching.', reliable: true },
];

export function WeatherScreen() {
  const nav = useNavigation();
  const [pressure, setPressure] = useState<number | null>(null);
  const [history, setHistory] = useState<{ time: number; pressure: number }[]>([]);

  useEffect(() => {
    Barometer.setUpdateInterval(30000);
    const sub = Barometer.addListener(({ pressure: p }) => {
      if (!p) return;
      setPressure(Math.round(p * 10) / 10);
      setHistory((prev) => {
        const next = [...prev, { time: Date.now(), pressure: p }];
        return next.slice(-6); // Keep 3 hours at 30-min intervals
      });
    });
    return () => sub.remove();
  }, []);

  const trend = history.length >= 2
    ? history[history.length - 1].pressure - history[0].pressure
    : 0;
  const trendArrow = trend > 1 ? '↑ Rising' : trend < -1 ? '↓ Falling' : '→ Stable';
  const trendColor = trend > 1 ? Colors.accent : trend < -1 ? Colors.danger : Colors.textMuted;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🌩 Weather Reading</Text>
        <Text style={styles.sourceNote}>Source: FM 21-76 weather chapter. USN weather guides (public domain).</Text>

        <SectionHeader title="BAROMETRIC PRESSURE" />
        <View style={styles.pressureCard}>
          <Text style={styles.pressureValue}>
            {pressure !== null ? `${pressure} hPa` : '-- no sensor --'}
          </Text>
          {pressure !== null && (
            <>
              <Text style={[styles.trendText, { color: trendColor }]}>{trendArrow}</Text>
              <Text style={styles.trendNote}>
                {trend < -2 ? '⚠ Rapid pressure drop — storm approaching' :
                 trend < -1 ? 'Pressure falling — weather deteriorating' :
                 trend > 2 ? 'Rapid pressure rise — clearing' :
                 trend > 1 ? 'Pressure rising — improving conditions' :
                 'Pressure stable'}
              </Text>
            </>
          )}
        </View>

        <SectionHeader title="CLOUD TYPES" />
        {CLOUDS.map((cloud, i) => (
          <View key={i} style={[styles.cloudCard, cloud.warning && styles.cloudCardWarn]}>
            <View style={styles.cloudHeader}>
              <Text style={styles.cloudIcon}>{cloud.symbol}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cloudName}>{cloud.name}</Text>
                <Text style={styles.cloudAlt}>{cloud.alt}</Text>
              </View>
              {cloud.warning && (
                <View style={styles.warnBadge}>
                  <Text style={styles.warnBadgeText}>⚠ SHELTER</Text>
                </View>
              )}
            </View>
            <Text style={styles.cloudMeaning}>{cloud.meaning}</Text>
          </View>
        ))}

        <SectionHeader title="NATURAL SIGNS" />
        {NATURAL_SIGNS.map((s, i) => (
          <View key={i} style={styles.signCard}>
            <View style={styles.signHeader}>
              <Text style={styles.signName}>{s.sign}</Text>
              <Text style={[styles.reliableLabel, { color: s.reliable ? Colors.accent : Colors.textDim }]}>
                {s.reliable ? '✓ RELIABLE' : '~ FOLKLORE'}
              </Text>
            </View>
            <Text style={styles.signMeaning}>{s.meaning}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  scroll: { paddingBottom: 60 },
  title: { fontFamily: Fonts.display, fontSize: FontSize.h2, color: Colors.gold, paddingHorizontal: 16, marginBottom: 4 },
  sourceNote: { fontFamily: Fonts.bodyReg, fontSize: 11, color: Colors.textMuted, paddingHorizontal: 16, fontStyle: 'italic', marginBottom: 12 },
  pressureCard: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accentDim,
    marginHorizontal: 12, padding: 20, alignItems: 'center',
  },
  pressureValue: { fontFamily: Fonts.mono, fontSize: 36, color: Colors.text, letterSpacing: 2 },
  trendText: { fontFamily: Fonts.mono, fontSize: 18, marginTop: 8, letterSpacing: 2 },
  trendNote: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
  cloudCard: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.border,
    marginHorizontal: 12, marginVertical: 4, padding: 12,
  },
  cloudCardWarn: { borderLeftColor: Colors.danger },
  cloudHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cloudIcon: { fontSize: 28 },
  cloudName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text },
  cloudAlt: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted },
  warnBadge: { borderWidth: 1, borderColor: Colors.danger, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2 },
  warnBadgeText: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.danger },
  cloudMeaning: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  signCard: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.border,
    marginHorizontal: 12, marginVertical: 4, padding: 12,
  },
  signHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  signName: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.text, flex: 1 },
  reliableLabel: { fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 1 },
  signMeaning: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
});
