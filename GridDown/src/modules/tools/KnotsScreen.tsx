import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

const KNOTS = [
  {
    name: 'Bowline',
    use: 'Rescue loop. Creates non-tightening loop. Safe for around waist.',
    strength: 'Retains ~75% rope strength',
    steps: ['Make small loop with "rabbit hole." Tail goes through hole from below.', 'Tail goes around the standing part.', 'Tail returns down through the rabbit hole.', 'Hold rabbit hole, pull tail and standing end tight simultaneously.'],
    memory: '"The rabbit comes up through the hole, around the tree, and back down the hole."',
  },
  {
    name: 'Clove Hitch',
    use: 'Quick attachment to post or tree. Starting knot for lashings.',
    strength: 'Strong when load is constant. Can slip under alternating load.',
    steps: ['Make two loops in same direction.', 'Slide second loop over first loop.', 'Slip both loops over post.', 'Tighten by pulling both ends.'],
    memory: 'Two identical loops overlapped.',
  },
  {
    name: 'Sheet Bend',
    use: 'Joining two ropes of different diameters.',
    strength: 'Strong. Better than square knot for joining dissimilar ropes.',
    steps: ['Make bight (U-shape) in thicker rope.', 'Thread thinner rope through bight from underneath.', 'Thin rope goes around entire bight and back under itself.', 'Both short ends must be on same side when finished.'],
    memory: 'Looks like a bowline — thick rope makes the bight, thin rope makes the knot.',
  },
  {
    name: 'Square Knot (Reef Knot)',
    use: 'Joining same-size ropes. Bandaging. NOT load-bearing.',
    strength: 'Low. Can slip. Use only for non-critical joining.',
    steps: ['Cross right over left and under.', 'Then cross left over right and under.', 'Pull both ends firmly.', 'If both loops visible = square. If one loop visible = granny (wrong, re-tie).'],
    memory: 'Right over left, left over right. "If in doubt, right is right."',
  },
  {
    name: 'Taut-Line Hitch',
    use: 'Adjustable tension on tarp or tent guylines. Slides when loose, locks under load.',
    strength: 'Moderate. Excellent for adjustable applications.',
    steps: ['Wrap around anchor. Bring free end around standing part twice inside loop.', 'Bring free end around outside standing part once, then through.', 'The coils inside the loop are what creates locking action.', 'Slide to adjust tension.'],
    memory: 'The extra coil inside is what makes it adjustable.',
  },
  {
    name: 'Figure-Eight',
    use: 'Stopper knot. End loop. Climbing anchor.',
    strength: 'Strong. Retains 80% of rope strength. Easy to inspect.',
    steps: ['Make bight, twist once to form figure-8 shape.', 'Pass tail through original loop to form figure-8.', 'Tighten firmly.', 'For loop version: form figure-8, thread bight back through instead of tail.'],
    memory: 'Draw the number 8 with the rope.',
  },
  {
    name: 'Prusik',
    use: 'Friction hitch for ascending rope. Hands-free stop on belay.',
    strength: 'Grips tightly under load, slides when unweighted.',
    steps: ['Loop thin cord (Prusik) around main rope 3 times.', 'Thread tail through initial loop.', 'Dress carefully — loops must be parallel, not twisted.', 'Slide when unweighted; grips under body weight.'],
    memory: 'Cord must be thinner than main rope. Three wraps minimum.',
  },
  {
    name: 'Trucker\'s Hitch',
    use: '3:1 mechanical advantage for cinching loads. Lashing loads to vehicles or shelters.',
    strength: 'Creates 3x mechanical advantage.',
    steps: ['Create fixed loop in rope partway along (use inline figure-8 or overhand knot).', 'Thread free end through anchor point.', 'Bring free end back and through loop.', 'Pull down — this creates 3:1 advantage. Finish with two half hitches.'],
    memory: 'Loop in middle creates a pulley.',
  },
  {
    name: 'Alpine Butterfly',
    use: 'Mid-rope loop that handles load from any direction.',
    strength: 'One of the strongest mid-rope loops. Used in mountaineering.',
    steps: ['Wrap rope twice around hand, working away from body.', 'Take strand nearest wrist, pass it around all coils and through center between coils.', 'Slide off hand. Dress and tighten.'],
    memory: 'Forms a butterfly shape with equal loops.',
  },
  {
    name: 'Double Fisherman\'s',
    use: 'Joining two ropes permanently. Making Prusik loops.',
    strength: 'Very strong. Extremely difficult to untie after loading.',
    steps: ['Overlap two rope ends 12 inches. Tie simple double overhand knot on one end around other rope.', 'Repeat with other end in opposite direction.', 'Pull both knots together until they meet and lock.'],
    memory: 'Two barrel knots facing each other.',
  },
  {
    name: 'Round Turn & Two Half Hitches',
    use: 'Attaching rope to ring, post, or anchor. Very secure.',
    strength: 'Strong and stable. Easy to tie and untie even after loading.',
    steps: ['Make one full turn around post/ring plus one extra partial turn (round turn).', 'Make half hitch around standing end.', 'Make second half hitch below first.', 'Tighten both hitches to standing end.'],
    memory: 'Round turn distributes load. Half hitches lock it.',
  },
  {
    name: 'Bowline on a Bight',
    use: 'Two-loop rescue knot. Seat harness improvisation.',
    strength: 'Strong. Two load-bearing loops.',
    steps: ['Double the rope. Tie bowline with doubled rope as if single.', 'Bring large loop of doubled bowline back through smaller loops.', 'The rabbit\'s hole technique but with doubled rope.'],
    memory: 'Bowline technique but with doubled rope throughout.',
  },
];

export function KnotsScreen() {
  const nav = useNavigation();
  const [selected, setSelected] = useState<string | null>(null);

  const knot = KNOTS.find((k) => k.name === selected);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🪢 Essential Knots</Text>
        <Text style={styles.sourceNote}>Source: The Ashley Book of Knots (public domain). FM 21-76.</Text>

        <SectionHeader title="SELECT KNOT" />
        <View style={styles.knotList}>
          {KNOTS.map((k) => (
            <TouchableOpacity
              key={k.name}
              style={[styles.knotRow, selected === k.name && styles.knotRowActive]}
              onPress={() => setSelected(selected === k.name ? null : k.name)}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.knotName}>{k.name}</Text>
                <Text style={styles.knotUse} numberOfLines={1}>{k.use}</Text>
              </View>
              <Text style={styles.chevron}>{selected === k.name ? '▾' : '›'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {knot && (
          <View style={styles.detail}>
            <View style={styles.strengthRow}>
              <Text style={styles.strengthLabel}>STRENGTH: </Text>
              <Text style={styles.strengthValue}>{knot.strength}</Text>
            </View>
            <Text style={styles.useText}>{knot.use}</Text>

            <SectionHeader title="STEPS" />
            {knot.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <View style={styles.memoryCard}>
              <Text style={styles.memoryLabel}>MEMORY AID</Text>
              <Text style={styles.memoryText}>{knot.memory}</Text>
            </View>
          </View>
        )}

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
  knotList: { paddingHorizontal: 12 },
  knotRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderLeftWidth: 2, borderLeftColor: Colors.border,
    marginVertical: 2, padding: 12,
  },
  knotRowActive: { borderLeftColor: Colors.accent, backgroundColor: Colors.surfaceAlt },
  knotName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text },
  knotUse: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 18, color: Colors.accentDim, marginLeft: 8 },
  detail: { backgroundColor: Colors.surfaceAlt, marginHorizontal: 12, marginTop: 4, padding: 14, borderLeftWidth: 2, borderLeftColor: Colors.gold },
  strengthRow: { flexDirection: 'row', marginBottom: 8 },
  strengthLabel: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  strengthValue: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.accent },
  useText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 4 },
  step: { flexDirection: 'row', gap: 8, marginBottom: 10, paddingHorizontal: 4 },
  stepNum: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, minWidth: 22 },
  stepText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, flex: 1, lineHeight: 22 },
  memoryCard: { backgroundColor: Colors.surface, padding: 12, marginTop: 8, borderLeftWidth: 2, borderLeftColor: Colors.warn },
  memoryLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.warn, letterSpacing: 2, marginBottom: 6 },
  memoryText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, lineHeight: 22, fontStyle: 'italic' },
});
