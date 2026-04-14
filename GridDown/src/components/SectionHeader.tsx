import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

interface Props {
  title: string;
}

export function SectionHeader({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gold,
    opacity: 0.5,
  },
});
