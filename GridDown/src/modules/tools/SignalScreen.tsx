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

const GROUND_SIGNALS = [
  { symbol: 'V', meaning: 'Require assistance' },
  { symbol: 'X', meaning: 'Require medical assistance' },
  { symbol: '→', meaning: 'Proceeding in this direction' },
  { symbol: '△', meaning: 'Safe to land here' },
  { symbol: 'LL', meaning: 'All is well' },
  { symbol: 'N', meaning: 'No / Negative' },
  { symbol: 'Y', meaning: 'Yes / Affirmative' },
  { symbol: '✈', meaning: 'Do not attempt to land here' },
  { symbol: '||', meaning: 'Need food and water' },
  { symbol: 'F', meaning: 'Need fuel and oil' },
];

const MORSE = [
  { char: 'A', code: '·−' }, { char: 'B', code: '−···' }, { char: 'C', code: '−·−·' },
  { char: 'D', code: '−··' }, { char: 'E', code: '·' }, { char: 'F', code: '··−·' },
  { char: 'G', code: '−−·' }, { char: 'H', code: '····' }, { char: 'I', code: '··' },
  { char: 'J', code: '·−−−' }, { char: 'K', code: '−·−' }, { char: 'L', code: '·−··' },
  { char: 'M', code: '−−' }, { char: 'N', code: '−·' }, { char: 'O', code: '−−−' },
  { char: 'P', code: '·−−·' }, { char: 'Q', code: '−−·−' }, { char: 'R', code: '·−·' },
  { char: 'S', code: '···' }, { char: 'T', code: '−' }, { char: 'U', code: '··−' },
  { char: 'V', code: '···−' }, { char: 'W', code: '·−−' }, { char: 'X', code: '−··−' },
  { char: 'Y', code: '−·−−' }, { char: 'Z', code: '−−··' },
  { char: '1', code: '·−−−−' }, { char: '2', code: '··−−−' }, { char: '3', code: '···−−' },
  { char: '4', code: '····−' }, { char: '5', code: '·····' }, { char: '6', code: '−····' },
  { char: '7', code: '−−···' }, { char: '8', code: '−−−··' }, { char: '9', code: '−−−−·' },
  { char: '0', code: '−−−−−' },
];

export function SignalScreen() {
  const nav = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📡 Rescue Signaling</Text>
        <Text style={styles.sourceNote}>Source: FM 21-76 Ch.9 Signaling for Rescue</Text>

        <DangerBanner text="SOS — International Distress Signal: ···−−−··· (3 short, 3 long, 3 short). Pause, repeat. Works in any medium: sound, light, fire, smoke, or scratched on ground." icon="🆘" />

        <SectionHeader title="GROUND-TO-AIR SIGNALS" />
        <Text style={styles.sectionNote}>Stamp large symbols in snow, lay dark rocks on light ground, trample vegetation. Minimum 10 feet tall.</Text>
        {GROUND_SIGNALS.map((s, i) => (
          <View key={i} style={styles.signalRow}>
            <Text style={styles.signalSymbol}>{s.symbol}</Text>
            <Text style={styles.signalMeaning}>{s.meaning}</Text>
          </View>
        ))}

        <SectionHeader title="SIGNAL MIRROR TECHNIQUE" />
        <View style={styles.stepBlock}>
          {[
            'Hold mirror up, look through sighting hole or improvised sighting notch.',
            'Angle mirror until reflected sunlight spot falls on your other hand held out at arm\'s length.',
            'Align hand with aircraft/ship in distance. Sweep reflected light slowly across horizon.',
            'Flash: 3 long flashes, pause, 3 long flashes. Even a cheap CD or piece of metal works.',
            'Effective range: 10-100 miles depending on conditions. One of the most effective signals available.',
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="OTHER SIGNALS" />
        <View style={styles.otherSignals}>
          <View style={styles.signalCard}>
            <Text style={styles.signalCardTitle}>WHISTLE</Text>
            <Text style={styles.signalCardText}>3 blasts = international distress signal. Pause. Repeat.</Text>
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.signalCardTitle}>FIRE — NIGHT</Text>
            <Text style={styles.signalCardText}>3 fires in triangle or straight line. Dry hardwood = bright flame. Visible from air.</Text>
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.signalCardTitle}>SMOKE — DAY</Text>
            <Text style={styles.signalCardText}>Green vegetation on fire = white smoke visible against dark forest. Rubber or oil = black smoke visible against sky.</Text>
          </View>
        </View>

        <SectionHeader title="MORSE CODE" />
        <View style={styles.morseGrid}>
          {MORSE.map((m) => (
            <View key={m.char} style={styles.morseCell}>
              <Text style={styles.morseChar}>{m.char}</Text>
              <Text style={styles.morseCode}>{m.code}</Text>
            </View>
          ))}
        </View>

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
  sectionNote: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, paddingHorizontal: 16, marginBottom: 8 },
  signalRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  signalSymbol: { fontFamily: Fonts.mono, fontSize: 20, color: Colors.gold, width: 40 },
  signalMeaning: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1 },
  stepBlock: { paddingHorizontal: 16 },
  step: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  stepNum: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, minWidth: 22 },
  stepText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1, lineHeight: 22 },
  otherSignals: { paddingHorizontal: 12 },
  signalCard: { backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accentDim, marginVertical: 4, padding: 12 },
  signalCardTitle: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.gold, letterSpacing: 2, marginBottom: 6 },
  signalCardText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, lineHeight: 22 },
  morseGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 4 },
  morseCell: { backgroundColor: Colors.surface, padding: 8, alignItems: 'center', width: 56 },
  morseChar: { fontFamily: Fonts.mono, fontSize: 16, color: Colors.gold },
  morseCode: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
