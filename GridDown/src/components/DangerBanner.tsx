import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

interface Props {
  text: string;
  icon?: string;
}

export function DangerBanner({ text, icon = '⚠' }: Props) {
  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E0A0A',
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    flexDirection: 'row',
    padding: 12,
    marginVertical: 4,
    borderRadius: 2,
    alignItems: 'flex-start',
  },
  icon: {
    color: Colors.danger,
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
});
