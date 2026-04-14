import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

const METHODS = [
  {
    key: 'bow',
    name: 'Bow Drill',
    reliability: 'HIGH with practice',
    steps: [
      'MATERIALS: Spindle (straight, dry, 12-18" — willow, cedar, basswood). Fireboard (same or softer wood — flat, dry). Bow (curved branch, 24"). Bowstring (any cordage). Handhold (smooth hard wood or stone with slight depression).',
      'Cut notch in fireboard: small socket hole, then cut V-notch to edge with 45° sides. Place bark piece below notch to catch coal.',
      'Loop bowstring once around spindle. Place spindle tip in socket. Apply downward pressure with handhold, covering socket.',
      'Use long smooth strokes with bow — full length of bow. Maintain even downward pressure. Speed: moderate and consistent.',
      'Continue until smoke rises from notch. Continue 10-15 more strokes after you see smoke.',
      'Stop drilling. Tap spindle. Gently lift fireboard — coal should be on bark beneath.',
      'Blow gently on coal — orange glow confirms live coal.',
      'Transfer coal to tinder bundle. Fold bundle around coal. Blow firmly and steadily until flame appears. Place in fire lay.',
    ],
    note: 'Source: Brown Tom Brown\'s Field Guide to Wilderness Survival. Best spindle/fireboard pairings: willow-willow, cedar-cedar, cottonwood-cottonwood. Wood must be bone dry.',
  },
  {
    key: 'hand',
    name: 'Hand Drill',
    reliability: 'MODERATE — requires dry conditions',
    steps: [
      'Harder than bow drill — requires dry, warm conditions. Cannot work in humidity.',
      'Spindle must be perfectly straight, 24-30" long, pencil-thick. Mullein stalk, cattail stem, or dry yucca.',
      'Fireboard: dried yucca, sotol, or cedar.',
      'Cut same socket and V-notch as bow drill.',
      'Roll spindle between palms while pressing down firmly. Work hands DOWN spindle as you roll — apply constant downward pressure.',
      'When you reach bottom, quickly slide hands to top without losing momentum and repeat.',
      'Requires more speed and pressure than bow drill. Smoke appears faster if wood is correct.',
      'Same coal handling as bow drill once smoke appears.',
    ],
    note: 'Source: FM 21-76 Ch.7. Best in dry desert or dry summer conditions.',
  },
  {
    key: 'flint',
    name: 'Flint & Steel',
    reliability: 'HIGH with proper materials',
    steps: [
      'MATERIALS: Flint, chert, or obsidian (sharp edge). High-carbon steel (back of knife, striker). Char cloth or natural tinder fungus (amadou from bracket fungus).',
      'Hold char cloth/tinder between thumb and flint. Grip flint with flat edge toward you.',
      'Strike steel downward across flint edge at 30° angle. Strike should glance off flint.',
      'Spark must land on char cloth. Watch for glowing ember.',
      'Transfer glowing char cloth to tinder bundle. Fold bundle around it.',
      'Blow steadily — red glow will spread, then ignite.',
    ],
    note: 'Source: FM 21-76. Historical method used for thousands of years. Reliable if materials are correct.',
  },
  {
    key: 'lens',
    name: 'Lens / Solar',
    reliability: 'REQUIRES direct sunlight',
    steps: [
      'Works ONLY with direct bright sunlight. Useless on overcast days.',
      'Focus sunlight to single bright point on dark tinder (charred cloth is ideal).',
      'Maintain focus — hold absolutely still. Point will heat and glow within 5-60 seconds.',
      'Once glowing: transfer to tinder bundle and blow.',
      'Improvised lenses: eyeglasses (one lens), clear water in transparent bag (crude lens), ice lens (clear ice carved to biconvex shape), signal mirror angled to focus.',
      'Best tinder for lens method: charred cloth, amadou, dark organic powder.',
    ],
    note: 'Source: FM 21-76 Ch.7. Tom Brown\'s Field Guide.',
  },
];

const FIRE_LAYS = [
  { name: 'Teepee', use: 'Starting fires, producing quick heat, signaling', desc: 'Lean small kindling sticks against central upright support in cone shape. Add larger sticks around outside. Light at base. Burns fast and hot.' },
  { name: 'Log Cabin', use: 'Long-burning cooking fire, producing coals', desc: 'Build square frame of logs like a log cabin. Fill with kindling in center. Burns down slowly to long-lasting coals for cooking.' },
  { name: 'Long Fire', use: 'Overnight warmth, cooking along length', desc: 'Two parallel logs with fire between them. Direct heat along their length. Add fuel at one end. Excellent for sleeping alongside.' },
  { name: 'Star Fire', use: 'Fuel conservation, long burn with minimal wood', desc: 'Place 5-6 long logs like spokes of a wheel, tips meeting in center. Push logs in as they burn. One person can manage all night.' },
];

export function FireScreen() {
  const nav = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const method = METHODS.find((m) => m.key === selectedMethod);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🔥 Fire Starting</Text>
        <Text style={styles.sourceNote}>Source: FM 21-76 Ch.7. Brown Tom Brown's Field Guide to Wilderness Survival.</Text>

        <SectionHeader title="SELECT METHOD" />
        <View style={styles.methodBtns}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodBtn, selectedMethod === m.key && styles.methodBtnActive]}
              onPress={() => setSelectedMethod(selectedMethod === m.key ? null : m.key)}
              accessibilityRole="button"
            >
              <Text style={[styles.methodBtnText, selectedMethod === m.key && styles.methodBtnTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {method && (
          <View style={styles.methodDetail}>
            <View style={styles.reliabilityRow}>
              <Text style={styles.reliabilityLabel}>RELIABILITY: </Text>
              <Text style={styles.reliabilityValue}>{method.reliability}</Text>
            </View>
            {method.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <Text style={styles.methodNote}>{method.note}</Text>
          </View>
        )}

        <SectionHeader title="FIRE LAY TYPES" />
        {FIRE_LAYS.map((lay, i) => (
          <View key={i} style={styles.layCard}>
            <Text style={styles.layName}>{lay.name}</Text>
            <Text style={styles.layUse}>USE WHEN: {lay.use}</Text>
            <Text style={styles.layDesc}>{lay.desc}</Text>
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
  methodBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  methodBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 2, paddingHorizontal: 14, paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  methodBtnActive: { borderColor: Colors.accent, backgroundColor: '#1A3A1A' },
  methodBtnText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textDim },
  methodBtnTextActive: { color: Colors.accent },
  methodDetail: { backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.gold, marginHorizontal: 12, marginTop: 12, padding: 14 },
  reliabilityRow: { flexDirection: 'row', marginBottom: 12 },
  reliabilityLabel: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  reliabilityValue: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.accent },
  step: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  stepNum: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, minWidth: 22 },
  stepText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1, lineHeight: 22 },
  methodNote: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginTop: 10, lineHeight: 20 },
  layCard: { backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.accentDim, marginHorizontal: 12, marginVertical: 4, padding: 12 },
  layName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text, marginBottom: 4 },
  layUse: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.gold, letterSpacing: 1, marginBottom: 6 },
  layDesc: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
});
