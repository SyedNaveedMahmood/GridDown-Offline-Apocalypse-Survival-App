import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { ToolsStackParamList } from './ToolsNavigator';

type Nav = StackNavigationProp<ToolsStackParamList, 'ToolsHome'>;

const TOOLS = [
  { key: 'Water', icon: '💧', name: 'Water', desc: 'Purification methods' },
  { key: 'Fire', icon: '🔥', name: 'Fire', desc: 'Starting fire without matches' },
  { key: 'Shelter', icon: '⛺', name: 'Shelter', desc: 'Emergency construction' },
  { key: 'Signal', icon: '📡', name: 'Signal', desc: 'Rescue signaling' },
  { key: 'Knots', icon: '🪢', name: 'Knots', desc: '12 essential knots' },
  { key: 'Checklist', icon: '✅', name: 'Checklist', desc: '72hr / 2wk / long-term' },
  { key: 'Calorie', icon: '⚡', name: 'Calorie', desc: 'Field calorie calculator' },
  { key: 'Weather', icon: '🌩', name: 'Weather', desc: 'Pressure & cloud reading' },
] as const;

export function ToolsHomeScreen() {
  const nav = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Survival Tools</Text>
      </View>

      <FlatList
        data={TOOLS}
        numColumns={2}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate(item.key as any)}
            accessibilityLabel={`${item.name}: ${item.desc}`}
            accessibilityRole="button"
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListFooterComponent={() => (
          <View style={styles.utilRow}>
            <TouchableOpacity
              style={styles.utilBtn}
              onPress={() => nav.navigate('Search')}
              accessibilityRole="button"
              accessibilityLabel="Global search"
            >
              <Text style={styles.utilIcon}>🔍</Text>
              <Text style={styles.utilLabel}>SEARCH</Text>
              <Text style={styles.utilDesc}>All modules</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.utilBtn}
              onPress={() => nav.navigate('Settings')}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Text style={styles.utilIcon}>⚙</Text>
              <Text style={styles.utilLabel}>SETTINGS</Text>
              <Text style={styles.utilDesc}>Packs & display</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.gold },
  grid: { padding: 8 },
  row: { justifyContent: 'space-between' },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    margin: 6,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardName: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardDesc: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted },
  utilRow: { flexDirection: 'row', gap: 12, margin: 6 },
  utilBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accentDim,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  utilIcon: { fontSize: 28, marginBottom: 8 },
  utilLabel: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  utilDesc: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted },
});
