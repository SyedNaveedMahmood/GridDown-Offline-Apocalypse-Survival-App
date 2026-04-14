import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

type ActivityLevel = 'rest' | 'light' | 'moderate' | 'heavy';
type TempLevel = 'hot' | 'temperate' | 'cold';

const ACTIVITY: Record<ActivityLevel, { label: string; multiplier: number }> = {
  rest:     { label: 'Rest / Injured', multiplier: 1.2 },
  light:    { label: 'Light — walking, camp tasks', multiplier: 1.5 },
  moderate: { label: 'Moderate — hiking, building', multiplier: 1.8 },
  heavy:    { label: 'Heavy — hard physical labor', multiplier: 2.2 },
};

const TEMP_BONUS: Record<TempLevel, { label: string; bonus: number }> = {
  hot:       { label: 'Hot (>30°C)', bonus: 100 },
  temperate: { label: 'Temperate (10-30°C)', bonus: 0 },
  cold:      { label: 'Cold (<10°C)', bonus: 300 },
};

const FORAGE_FOODS = [
  { name: 'Acorns (processed flour)', calPer100g: 400, note: 'After leaching tannins and drying' },
  { name: 'Hickory Nuts', calPer100g: 657, note: 'High fat content' },
  { name: 'Black Walnuts', calPer100g: 618, note: 'After cracking shell' },
  { name: 'Cattail Pollen Flour', calPer100g: 326, note: 'Summer collection only' },
  { name: 'Dandelion Greens', calPer100g: 45, note: 'High vitamins, low calories' },
  { name: 'Wild Berries (mixed)', calPer100g: 57, note: 'Average for Rubus, Vaccinium' },
  { name: 'Wild Strawberry', calPer100g: 32, note: 'Low calorie but morale food' },
  { name: 'Jerusalem Artichoke', calPer100g: 73, note: 'Note: causes flatulence' },
  { name: 'Cattail Rhizome Starch', calPer100g: 266, note: 'Labor intensive to process' },
  { name: 'Stinging Nettle (cooked)', calPer100g: 42, note: 'Excellent vitamins and protein' },
  { name: 'Wild Onion/Ramps', calPer100g: 30, note: 'Flavor/vitamin supplement' },
  { name: 'Pine Nuts (Pinyon)', calPer100g: 673, note: 'Very high fat — excellent survival food' },
];

export function CalorieScreen() {
  const nav = useNavigation();
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [temp, setTemp] = useState<TempLevel>('temperate');

  const bmr = useMemo(() => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return 0;
    return Math.round(10 * w + 500); // Simplified Mifflin-St Jeor based on weight
  }, [weight]);

  const dailyCalories = useMemo(() => {
    if (bmr === 0) return 0;
    return Math.round(bmr * ACTIVITY[activity].multiplier + TEMP_BONUS[temp].bonus);
  }, [bmr, activity, temp]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>⚡ Calorie Calculator</Text>
        <Text style={styles.sourceNote}>Source: FM 21-76 energy expenditure tables</Text>

        <SectionHeader title="BODY WEIGHT" />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor={Colors.textDim}
            selectionColor={Colors.accent}
            accessibilityLabel="Body weight in kilograms"
          />
          <Text style={styles.inputUnit}>kg</Text>
        </View>

        <SectionHeader title="ACTIVITY LEVEL" />
        {(Object.entries(ACTIVITY) as [ActivityLevel, typeof ACTIVITY[ActivityLevel]][]).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[styles.optRow, activity === key && styles.optRowActive]}
            onPress={() => setActivity(key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: activity === key }}
          >
            <View style={[styles.radio, activity === key && styles.radioActive]} />
            <Text style={[styles.optText, activity === key && styles.optTextActive]}>{val.label}</Text>
          </TouchableOpacity>
        ))}

        <SectionHeader title="TEMPERATURE" />
        {(Object.entries(TEMP_BONUS) as [TempLevel, typeof TEMP_BONUS[TempLevel]][]).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[styles.optRow, temp === key && styles.optRowActive]}
            onPress={() => setTemp(key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: temp === key }}
          >
            <View style={[styles.radio, temp === key && styles.radioActive]} />
            <Text style={[styles.optText, temp === key && styles.optTextActive]}>
              {val.label} {val.bonus > 0 ? `(+${val.bonus} cal)` : ''}
            </Text>
          </TouchableOpacity>
        ))}

        {dailyCalories > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>ESTIMATED DAILY NEED</Text>
            <Text style={styles.resultValue}>{dailyCalories.toLocaleString()}</Text>
            <Text style={styles.resultUnit}>calories / day</Text>
          </View>
        )}

        <SectionHeader title="FORAGE FOOD CALORIES" />
        <View style={styles.foodTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellFirst, styles.headerText]}>Food</Text>
            <Text style={[styles.tableCell, styles.headerText]}>Cal/100g</Text>
            {dailyCalories > 0 && <Text style={[styles.tableCell, styles.headerText]}>g/day</Text>}
          </View>
          {FORAGE_FOODS.map((f, i) => {
            const gramsNeeded = dailyCalories > 0 ? Math.round((dailyCalories / f.calPer100g) * 100) : null;
            return (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <View style={[styles.tableCell, styles.tableCellFirst]}>
                  <Text style={styles.foodName}>{f.name}</Text>
                  <Text style={styles.foodNote}>{f.note}</Text>
                </View>
                <Text style={[styles.tableCell, styles.calText]}>{f.calPer100g}</Text>
                {gramsNeeded !== null && (
                  <Text style={[styles.tableCell, styles.gramsText]}>{gramsNeeded}g</Text>
                )}
              </View>
            );
          })}
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
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  input: {
    backgroundColor: Colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
    padding: 12, fontFamily: Fonts.mono, fontSize: 24, color: Colors.text, width: 120, borderRadius: 2,
  },
  inputUnit: { fontFamily: Fonts.mono, fontSize: 16, color: Colors.textMuted },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  optRowActive: { backgroundColor: Colors.surfaceAlt },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.border },
  radioActive: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  optText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.textMuted },
  optTextActive: { color: Colors.text },
  resultCard: {
    backgroundColor: Colors.surfaceAlt, borderLeftWidth: 3, borderLeftColor: Colors.gold,
    marginHorizontal: 12, marginTop: 16, padding: 20, alignItems: 'center',
  },
  resultLabel: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.gold, letterSpacing: 2, marginBottom: 8 },
  resultValue: { fontFamily: Fonts.mono, fontSize: 48, color: Colors.text },
  resultUnit: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  foodTable: { marginHorizontal: 12 },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  tableRow: { flexDirection: 'row', paddingVertical: 8 },
  tableRowAlt: { backgroundColor: Colors.surface },
  tableCell: { flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  tableCellFirst: { flex: 2, textAlign: 'left' },
  headerText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.gold, letterSpacing: 1 },
  foodName: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.text },
  foodNote: { fontFamily: Fonts.bodyReg, fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  calText: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.accent, textAlign: 'center', paddingTop: 4 },
  gramsText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.text, textAlign: 'center', paddingTop: 4 },
});
