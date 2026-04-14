import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...', onClear }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDim}
        selectionColor={Colors.accent}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search input"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => { onChangeText(''); onClear?.(); }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161A10',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2E3526',
    borderRadius: 4,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  icon: {
    color: Colors.textMuted,
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 0,
  },
  clear: {
    color: Colors.textMuted,
    fontSize: 14,
    paddingLeft: 8,
  },
});
