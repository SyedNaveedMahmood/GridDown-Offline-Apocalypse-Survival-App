import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  danger?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, danger = false, elevated = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        danger && styles.danger,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginVertical: 4,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 2,
  },
  elevated: {
    backgroundColor: Colors.surfaceAlt,
  },
  danger: {
    borderLeftColor: Colors.danger,
  },
});
