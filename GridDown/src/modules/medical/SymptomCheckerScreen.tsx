import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { searchConditions, Condition } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import type { MedicalStackParamList } from './MedicalNavigator';

type Nav = StackNavigationProp<MedicalStackParamList, 'MedicalHome'>;

const SYMPTOMS = [
  'fever', 'chills', 'headache', 'nausea', 'vomiting', 'diarrhea',
  'abdominal pain', 'chest pain', 'shortness of breath', 'confusion',
  'bleeding', 'swelling', 'rash', 'muscle weakness', 'rapid heart rate',
  'low blood pressure', 'unconsciousness', 'burns', 'fracture suspected',
  'wound present',
];

const SEVERITY_COLOR: Record<string, string> = {
  minor: Colors.accent,
  moderate: Colors.warn,
  severe: Colors.danger,
  life_threatening: Colors.danger,
};

export function SymptomCheckerScreen() {
  const nav = useNavigation<Nav>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Condition[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback((symptom: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });
    setResults(null);
  }, []);

  const check = useCallback(async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const allConditions = await searchConditions('');
      // Score by how many selected symptoms match the condition's symptom text
      const scored = allConditions.map((c) => {
        const text = (c.symptoms + ' ' + c.name).toLowerCase();
        let score = 0;
        selected.forEach((s) => { if (text.includes(s)) score++; });
        return { ...c, score };
      });
      const filtered = scored.filter((c) => c.score > 0);
      filtered.sort((a, b) => b.score - a.score || a.severity.localeCompare(b.severity));
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Select all symptoms present:</Text>

        <View style={styles.grid}>
          {SYMPTOMS.map((s) => {
            const active = selected.has(s);
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggle(s)}
                accessibilityLabel={`Symptom: ${s}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.checkBtn, selected.size === 0 && styles.checkBtnDisabled]}
          onPress={check}
          disabled={selected.size === 0 || loading}
          accessibilityLabel="Check symptoms"
          accessibilityRole="button"
        >
          <Text style={styles.checkBtnText}>
            {loading ? 'CHECKING...' : 'CHECK SYMPTOMS'}
          </Text>
        </TouchableOpacity>

        {results !== null && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {results.length === 0
                ? 'NO MATCHES FOUND'
                : `${results.length} POSSIBLE CONDITION${results.length === 1 ? '' : 'S'}:`}
            </Text>
            {results.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.resultRow}
                onPress={() => nav.navigate('ConditionDetail', { id: c.id })}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{c.name}</Text>
                  <Text style={styles.resultMeta}>{c.category}</Text>
                </View>
                <View style={[styles.sevDot, { backgroundColor: SEVERITY_COLOR[c.severity] }]} />
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Permanent sticky disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          FOR REFERENCE ONLY. This tool is designed for situations with no medical access.
          It does not replace professional medical training or care.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 100 },
  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
  },
  chipActive: { borderColor: Colors.accent, backgroundColor: '#1A3A1A' },
  chipText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textDim },
  chipTextActive: { color: Colors.accent },
  checkBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 16,
    minHeight: 44,
  },
  checkBtnDisabled: { backgroundColor: Colors.accentDim, opacity: 0.5 },
  checkBtnText: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.bg, letterSpacing: 2 },
  results: { marginTop: 8 },
  resultsTitle: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultRow: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginVertical: 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text },
  resultMeta: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  sevDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  chevron: { fontSize: FontSize.xl, color: Colors.accentDim },
  disclaimer: {
    backgroundColor: '#1E0A0A',
    borderTopWidth: 1,
    borderTopColor: Colors.danger,
    padding: 10,
    paddingHorizontal: 14,
  },
  disclaimerText: {
    fontFamily: Fonts.bodyReg,
    fontSize: 11,
    color: Colors.text,
    lineHeight: 17,
  },
});
