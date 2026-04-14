import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Barometer } from 'expo-sensors';
import { getRecentlyViewed, getFavorites, searchPlants, RecentItem } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import * as FileSystem from 'expo-file-system';

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

const SEASON_FORAGE: Record<string, string> = {
  Spring: 'Dandelion, Ramps, Stinging Nettle, Morels',
  Summer: 'Blackberries, Chanterelles, Purslane, Lamb\'s Quarters',
  Fall: 'Acorns, Hickory Nuts, Hen of the Woods, Elderberries',
  Winter: 'Pine Needle Tea, Chickory Root, Cattail Rhizomes',
};

const QUICK_ACTIONS = [
  { label: 'FORAGE', desc: 'Find wild food', icon: '🌿', tab: 'Forage' },
  { label: 'MEDICAL', desc: 'Emergency reference', icon: '✚', tab: 'Medical' },
  { label: 'WATER', desc: 'Purification guide', icon: '💧', tab: 'Tools' },
  { label: 'FIRE', desc: 'Starting fire', icon: '🔥', tab: 'Tools' },
];

export function HomeScreen() {
  const nav = useNavigation<any>();
  const { gpsCoords, gpsAcquired, dbReady } = useAppStore();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [pressure, setPressure] = useState<number | null>(null);
  const [prevPressure, setPrevPressure] = useState<number | null>(null);
  const [wikiDownloaded, setWikiDownloaded] = useState(false);
  const [plantCount, setPlantCount] = useState(0);
  const season = getSeason();

  useEffect(() => {
    if (!dbReady) return;
    getRecentlyViewed(6).then(setRecentItems);
    searchPlants('', undefined, undefined).then((p) => setPlantCount(p.length));
  }, [dbReady]);

  useEffect(() => {
    FileSystem.getInfoAsync((FileSystem.documentDirectory ?? '') + 'zim/').then((info) => {
      setWikiDownloaded(info.exists);
    });
  }, []);

  useEffect(() => {
    const sub = Barometer.addListener(({ pressure: p }) => {
      if (!p) return;
      setPrevPressure((prev) => prev ?? p);
      setPressure(p);
    });
    Barometer.setUpdateInterval(60000);
    return () => sub.remove();
  }, []);

  const pressureTrend = pressure && prevPressure
    ? pressure - prevPressure > 0.5 ? '↑' : pressure - prevPressure < -0.5 ? '↓' : '→'
    : '→';

  const STATUS_ITEMS = [
    { label: 'Plant database loaded', ok: plantCount > 0 },
    { label: 'Wikipedia pack downloaded', ok: wikiDownloaded },
    { label: 'GPS acquired', ok: gpsAcquired },
    { label: 'Offline mode active', ok: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.appName}>GridDown</Text>
          <Text style={styles.subtitle}>Offline Survival Reference</Text>
          <OfflineStatusBar />
          <View style={styles.rule} />
        </View>

        {/* Quick access */}
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => nav.navigate(action.tab)}
              accessibilityLabel={`${action.label}: ${action.desc}`}
              accessibilityRole="button"
            >
              <Text style={styles.quickIcon}>{action.icon}</Text>
              <Text style={styles.quickLabel}>{action.label}</Text>
              <Text style={styles.quickDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current conditions */}
        <SectionHeader title="CURRENT CONDITIONS" />
        <View style={styles.conditionsCard}>
          <View style={styles.condRow}>
            <Text style={styles.condLabel}>PRESSURE</Text>
            <Text style={styles.condValue}>
              {pressure ? `${Math.round(pressure)} hPa ${pressureTrend}` : '-- no barometer --'}
            </Text>
          </View>
          <View style={styles.condRow}>
            <Text style={styles.condLabel}>SEASON</Text>
            <Text style={styles.condValue}>{season}</Text>
          </View>
          <View style={styles.condRow}>
            <Text style={styles.condLabel}>BEST FORAGE</Text>
            <Text style={styles.condValueSmall}>{SEASON_FORAGE[season]}</Text>
          </View>
        </View>

        {/* Recently viewed */}
        {recentItems.length > 0 && (
          <>
            <SectionHeader title="RECENTLY VIEWED" />
            <FlatList
              horizontal
              data={recentItems}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentContent}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recentChip} accessibilityRole="button">
                  <Text style={styles.recentType}>{item.item_type.toUpperCase()}</Text>
                  <Text style={styles.recentName} numberOfLines={2}>{item.item_name}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* System status */}
        <SectionHeader title="SYSTEM STATUS" />
        <View style={styles.statusCard}>
          {STATUS_ITEMS.map((s, i) => (
            <View key={i} style={styles.statusRow}>
              <Text style={[styles.statusIcon, s.ok ? styles.ok : styles.notOk]}>
                {s.ok ? '✓' : '✗'}
              </Text>
              <Text style={styles.statusLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 60 },
  hero: { paddingHorizontal: 16, paddingTop: 16 },
  appName: { fontFamily: Fonts.display, fontSize: 44, color: Colors.gold },
  subtitle: { fontFamily: Fonts.bodyReg, fontSize: 14, fontStyle: 'italic', color: Colors.textMuted, marginBottom: 8 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 0 },
  quickCard: {
    width: '50%',
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.text, letterSpacing: 1, marginBottom: 4 },
  quickDesc: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted },
  conditionsCard: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accentDim,
    marginHorizontal: 12, padding: 14,
  },
  condRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  condLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted, letterSpacing: 1 },
  condValue: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.text },
  condValueSmall: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.text, flex: 1, textAlign: 'right' },
  recentContent: { paddingHorizontal: 12, gap: 8 },
  recentChip: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accentDim,
    padding: 10, width: 100,
  },
  recentType: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.accentDim, letterSpacing: 1, marginBottom: 4 },
  recentName: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.text, lineHeight: 18 },
  statusCard: {
    backgroundColor: Colors.surface, marginHorizontal: 12, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.border,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  statusIcon: { fontSize: 16, width: 20 },
  ok: { color: Colors.accent },
  notOk: { color: Colors.danger },
  statusLabel: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text },
});
