import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

const SHELTERS = [
  {
    name: 'Debris Hut',
    time: '2-4 hours',
    insulation: '★★★★★',
    materials: 'Branches, leaves, forest debris',
    steps: [
      'Find or create a ridgepole: long branch 9-10 feet, propped one end on a forked stick about waist height, other end on ground.',
      'Lay sticks along sides of ridgepole like ribs of a fish.',
      'Pack debris (leaves, grass, bracken) over the frame. Must be AT LEAST 2-3 feet thick on all sides — arm\'s length minimum. More is better.',
      'Pile debris inside for bedding — 4 inches minimum under you.',
      'Make door plug from leaves packed into a bag or bundle. Crawl in feet-first.',
      'Size: just big enough for body — smaller = warmer. You heat it with body heat alone.',
    ],
    note: 'Source: FM 21-76 Ch.5. Tom Brown Field Guide to Wilderness Survival.',
  },
  {
    name: 'Lean-To',
    time: '30-60 minutes',
    insulation: '★★☆☆☆',
    materials: 'Poles, branches, bark, tarp',
    steps: [
      'Find two trees 7-8 feet apart. Lash a horizontal crossbar between them at shoulder height.',
      'Lean branches from crossbar to ground at 45° angle.',
      'Layer bark, branches, and debris from bottom to top like roof tiles.',
      'Build a fire in front (not inside) reflecting heat into lean-to.',
      'Minimal warmth alone — fire is required for cold weather.',
    ],
    note: 'Source: FM 21-76 Ch.5. Best for rain protection in warm weather.',
  },
  {
    name: 'Snow Quinzhee',
    time: '4-6 hours',
    insulation: '★★★★☆',
    materials: 'Snow — requires at least 6 feet of snow',
    steps: [
      'Pile gear under a large mound of snow — 8-10 feet high, 10 feet wide.',
      'Let snow sinter (bond) for 2 hours minimum. This is critical — do not skip.',
      'Push 12-inch sticks into mound all around as depth gauges.',
      'Remove gear. Hollow out inside — stop hollowing when you reach sticks.',
      'Poke a ventilation hole in the ceiling.',
      'Temperature inside stays around 32°F (0°C) — far warmer than outside in extreme cold.',
    ],
    note: 'Source: FM 21-76 Ch.5. Allow sintering time — rushing creates cave-in risk.',
  },
];

const CHECKLIST = [
  { item: 'Not in a flood plain or dry riverbed', good: true },
  { item: 'No dead trees or widowmakers overhead', good: true },
  { item: 'Within 200 feet of water source', good: true },
  { item: 'Natural windbreak to north/northwest', good: true },
  { item: 'Level ground for sleeping', good: true },
  { item: 'Not in exposed hilltop (lightning/wind)', good: false },
  { item: 'Not in dense brush (insects, animals)', good: false },
  { item: 'Not at valley bottom (cold air sinks)', good: false },
];

export function ShelterScreen() {
  const nav = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>⛺ Emergency Shelter</Text>
        <Text style={styles.sourceNote}>Source: FM 21-76 Ch.5 Shelter Construction</Text>

        <SectionHeader title="SITE SELECTION CHECKLIST" />
        {CHECKLIST.map((c, i) => (
          <View key={i} style={styles.checkRow}>
            <Text style={[styles.checkIcon, c.good ? styles.good : styles.bad]}>
              {c.good ? '✓' : '✗'}
            </Text>
            <Text style={styles.checkText}>{c.item}</Text>
          </View>
        ))}

        {SHELTERS.map((shelter, i) => (
          <View key={i}>
            <SectionHeader title={shelter.name.toUpperCase()} />
            <View style={styles.shelterCard}>
              <View style={styles.shelterMeta}>
                <Text style={styles.metaLabel}>TIME: <Text style={styles.metaValue}>{shelter.time}</Text></Text>
                <Text style={styles.metaLabel}>INSULATION: <Text style={styles.metaValue}>{shelter.insulation}</Text></Text>
                <Text style={styles.metaLabel}>MATERIALS: <Text style={styles.metaValue}>{shelter.materials}</Text></Text>
              </View>
              {shelter.steps.map((step, j) => (
                <View key={j} style={styles.step}>
                  <Text style={styles.stepNum}>{j + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
              <Text style={styles.shelterNote}>{shelter.note}</Text>
            </View>
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
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  checkIcon: { fontSize: 16, width: 24, marginRight: 8 },
  good: { color: Colors.accent },
  bad: { color: Colors.danger },
  checkText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1 },
  shelterCard: { backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accent, marginHorizontal: 12, marginVertical: 4, padding: 14 },
  shelterMeta: { marginBottom: 12 },
  metaLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  metaValue: { color: Colors.text },
  step: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  stepNum: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, minWidth: 22 },
  stepText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1, lineHeight: 22 },
  shelterNote: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginTop: 10, lineHeight: 20 },
});
