import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/typography';
import type { Edibility } from '../db/database';

interface Props {
  edibility: Edibility;
}

const CONFIGS: Record<Edibility, { bg: string; text: string; border: string; label: string }> = {
  safe:    { bg: '#1A3A1A', text: '#7AB648', border: '#2E5A20', label: 'SAFE' },
  caution: { bg: '#3A2A0A', text: '#D4881E', border: '#5A4010', label: 'CAUTION' },
  toxic:   { bg: '#3A0A0A', text: '#C0392B', border: '#5A1010', label: 'TOXIC' },
  deadly:  { bg: '#3A0A0A', text: '#C0392B', border: '#5A1010', label: '☠ DEADLY' },
};

export function EdibilityBadge({ edibility }: Props) {
  const cfg = CONFIGS[edibility] ?? CONFIGS.caution;
  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
      accessibilityLabel={`Edibility rating: ${cfg.label}`}
    >
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
