import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

const SOURCES = ['River/Stream', 'Rainwater', 'Standing Water', 'Tap/Well', 'Unknown'];

const PURIFICATION: Record<string, { method: string; steps: string[] }[]> = {
  'River/Stream': [
    { method: 'Boiling (Best)', steps: ['Collect water in clean container', 'Bring to ROLLING boil (not just simmer)', 'Boil 1 minute at sea level, 3 minutes above 2000m', 'Cool before drinking', 'Kills bacteria, viruses, and protozoa — the most reliable method'] },
    { method: 'Chemical — Sodium Hypochlorite (Bleach 5-6%)', steps: ['Use only unscented bleach 5-6% concentration', 'Clear water: 2 drops per liter', 'Cloudy water: 4 drops per liter', 'Shake and let stand 30 minutes', 'Should smell slightly of chlorine when ready'] },
  ],
  'Rainwater': [
    { method: 'Boiling (Precautionary)', steps: ['Rain is generally safe if collected in clean container', 'If collected from roof or vegetation: treat as contaminated', 'Boil 1 minute to be safe'] },
  ],
  'Standing Water': [
    { method: 'Pre-filter + Boiling', steps: ['FILTER FIRST: Pour through layers of cloth to remove sediment', 'Then through improvised filter: grass/charcoal/sand/gravel in sock or cloth', 'Boil after filtering: rolling boil 3 minutes minimum for standing water', 'Chemical backup: 4 drops bleach per liter after filtering'] },
    { method: 'SODIS (If no fire)', steps: ['Fill CLEAR plastic (PET) bottle — not green-tinted', 'Leave in direct sunlight minimum 6 hours on clear day', '2 days if cloudy', 'Kills bacteria and viruses but not all protozoa', 'Only works with clear water in clear bottle'] },
  ],
  'Tap/Well': [
    { method: 'Boiling (If infrastructure failed)', steps: ['If tap water source compromised, boil 1 minute', 'If clear: boiling or 2 drops bleach per liter', 'If uncertain of source: boil AND chemically treat'] },
  ],
  'Unknown': [
    { method: 'Full Treatment Protocol', steps: ['Step 1: Filter through multiple layers of cloth', 'Step 2: Improvised filter — grass, sand, charcoal, gravel', 'Step 3: Rolling boil 3 minutes minimum', 'Step 4: 4 drops bleach per liter after cooling', 'Step 5: Wait 30 minutes before drinking'] },
  ],
};

const COMPARISON = [
  { method: 'Boiling', bacteria: '✓', viruses: '✓', protozoa: '✓', chemicals: '✗' },
  { method: 'Chlorine/Bleach', bacteria: '✓', viruses: '✓', protozoa: '~', chemicals: '✗' },
  { method: 'Iodine', bacteria: '✓', viruses: '✓', protozoa: '~', chemicals: '✗' },
  { method: 'SODIS', bacteria: '✓', viruses: '✓', protozoa: '✗', chemicals: '✗' },
  { method: 'Filter (Improvised)', bacteria: '~', viruses: '✗', protozoa: '~', chemicals: '✗' },
];

export function WaterScreen() {
  const nav = useNavigation();
  const [source, setSource] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>💧 Water Purification</Text>
        <Text style={styles.source}>Source: FM 21-76 Ch.6 Water Procurement and Purification</Text>

        <DangerBanner text="Contaminated water can kill. When in doubt, treat it. Dehydration from not drinking is also life-threatening — choose the lesser risk." />

        <SectionHeader title="SELECT WATER SOURCE" />
        <View style={styles.sourceGrid}>
          {SOURCES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sourcePill, source === s && styles.sourcePillActive]}
              onPress={() => setSource(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: source === s }}
            >
              <Text style={[styles.sourcePillText, source === s && styles.sourcePillTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {source && PURIFICATION[source] && (
          <>
            <SectionHeader title={`TREATMENT: ${source.toUpperCase()}`} />
            {PURIFICATION[source].map((m, i) => (
              <View key={i} style={styles.methodCard}>
                <Text style={styles.methodName}>{m.method}</Text>
                {m.steps.map((step, j) => (
                  <View key={j} style={styles.step}>
                    <Text style={styles.stepNum}>{j + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <SectionHeader title="PURIFICATION COMPARISON" />
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellFirst, styles.tableHeaderText]}>Method</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Bact</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Virus</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Prot</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Chem</Text>
          </View>
          {COMPARISON.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.tableCellFirst, styles.tableCellText]}>{row.method}</Text>
              <Text style={[styles.tableCell, styles.tableCellData, row.bacteria === '✓' ? styles.good : styles.bad]}>{row.bacteria}</Text>
              <Text style={[styles.tableCell, styles.tableCellData, row.viruses === '✓' ? styles.good : styles.bad]}>{row.viruses}</Text>
              <Text style={[styles.tableCell, styles.tableCellData, row.protozoa === '✓' ? styles.good : styles.bad]}>{row.protozoa}</Text>
              <Text style={[styles.tableCell, styles.tableCellData, styles.bad]}>{row.chemicals}</Text>
            </View>
          ))}
          <Text style={styles.tableNote}>✓=Effective  ~=Partial  ✗=Not effective</Text>
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
  source: { fontFamily: Fonts.bodyReg, fontSize: 11, color: Colors.textMuted, paddingHorizontal: 16, fontStyle: 'italic', marginBottom: 12 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  sourcePill: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 2,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  sourcePillActive: { borderColor: Colors.accent, backgroundColor: '#1A3A1A' },
  sourcePillText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textDim },
  sourcePillTextActive: { color: Colors.accent },
  methodCard: {
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accent,
    marginHorizontal: 12, marginVertical: 4, padding: 14,
  },
  methodName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text, marginBottom: 10 },
  step: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  stepNum: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, minWidth: 20 },
  stepText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1, lineHeight: 22 },
  table: { marginHorizontal: 12, marginTop: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8 },
  tableRowAlt: { backgroundColor: Colors.surface },
  tableHeader: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, marginBottom: 2 },
  tableHeaderText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.gold, letterSpacing: 1 },
  tableCell: { flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  tableCellFirst: { flex: 2, textAlign: 'left' },
  tableCellText: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.text },
  tableCellData: { fontFamily: Fonts.mono, fontSize: 14 },
  good: { color: Colors.accent },
  bad: { color: Colors.danger },
  tableNote: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted, marginTop: 8, paddingLeft: 4 },
});
