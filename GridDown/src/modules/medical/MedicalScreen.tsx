import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  searchConditions, getProcedures, getMedications,
  Condition, Procedure, Medication,
} from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SearchBar } from '../../components/SearchBar';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import type { MedicalStackParamList } from './MedicalNavigator';
import { SymptomCheckerScreen } from './SymptomCheckerScreen';

type Nav = StackNavigationProp<MedicalStackParamList, 'MedicalHome'>;
type TabKey = 'conditions' | 'medications' | 'procedures' | 'symptoms';

const SEVERITY_COLOR: Record<string, string> = {
  minor: Colors.accent,
  moderate: Colors.warn,
  severe: Colors.danger,
  life_threatening: Colors.danger,
};

const ConditionRow = memo(function ConditionRow({
  item,
  onPress,
}: {
  item: Condition;
  onPress: () => void;
}) {
  const isLifeThreat = item.severity === 'life_threatening';
  return (
    <TouchableOpacity
      style={[styles.row, isLifeThreat && styles.rowDanger]}
      onPress={onPress}
      accessibilityLabel={`${item.name}, severity: ${item.severity}`}
      accessibilityRole="button"
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowMeta}>{item.category}</Text>
      </View>
      <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[item.severity] ?? Colors.textMuted }]} />
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

const ProcedureRow = memo(function ProcedureRow({
  item,
  onPress,
}: {
  item: Procedure;
  onPress: () => void;
}) {
  const diffColor = { basic: Colors.accent, intermediate: Colors.warn, advanced: Colors.danger }[item.difficulty] ?? Colors.textMuted;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityLabel={item.name}
      accessibilityRole="button"
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowMeta}>{item.category}</Text>
      </View>
      <Text style={[styles.diffLabel, { color: diffColor }]}>{item.difficulty.toUpperCase()}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

const MedicationRow = memo(function MedicationRow({
  item,
  onPress,
}: {
  item: Medication;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityLabel={item.name}
      accessibilityRole="button"
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowMeta}>{item.category}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

export function MedicalScreen() {
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>('conditions');
  const [query, setQuery] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'conditions') {
        setConditions(await searchConditions(query));
      } else if (tab === 'procedures') {
        setProcedures(await getProcedures());
      } else if (tab === 'medications') {
        setMedications(await getMedications(query));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  useEffect(() => { load(); }, [load]);

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'conditions', label: 'Conditions' },
    { key: 'medications', label: 'Medications' },
    { key: 'procedures', label: 'Procedures' },
    { key: 'symptoms', label: 'Symptoms' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Field Medicine</Text>
      </View>

      {/* Segment control */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
          >
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'symptoms' ? (
        <SymptomCheckerScreen />
      ) : (
        <>
          {tab !== 'procedures' && (
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${tab}...`}
            />
          )}

          {loading ? (
            <SkeletonLoader count={5} height={68} />
          ) : (
            <>
              {tab === 'conditions' && (
                <FlatList
                  data={conditions}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <ConditionRow
                      item={item}
                      onPress={() => nav.navigate('ConditionDetail', { id: item.id })}
                    />
                  )}
                  maxToRenderPerBatch={15}
                  windowSize={5}
                  ListEmptyComponent={<EmptyState label="No conditions found" />}
                />
              )}
              {tab === 'procedures' && (
                <FlatList
                  data={procedures}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <ProcedureRow
                      item={item}
                      onPress={() => nav.navigate('ProcedureDetail', { id: item.id })}
                    />
                  )}
                  maxToRenderPerBatch={15}
                  windowSize={5}
                  ListEmptyComponent={<EmptyState label="No procedures found" />}
                />
              )}
              {tab === 'medications' && (
                <FlatList
                  data={medications}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <MedicationRow
                      item={item}
                      onPress={() => nav.navigate('MedicationDetail', { id: item.id })}
                    />
                  )}
                  maxToRenderPerBatch={15}
                  windowSize={5}
                  ListEmptyComponent={<EmptyState label="No medications found" />}
                />
              )}
            </>
          )}
        </>
      )}

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text style={{ fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMuted, letterSpacing: 2 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.gold },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.surfaceAlt },
  tabLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  tabLabelActive: { color: Colors.accent },
  row: {
    height: 68,
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginVertical: 2,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDanger: { borderLeftColor: Colors.danger },
  rowContent: { flex: 1 },
  rowName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text },
  rowMeta: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  diffLabel: { fontFamily: Fonts.mono, fontSize: 10, marginRight: 8, letterSpacing: 1 },
  chevron: { fontSize: FontSize.xl, color: Colors.accentDim },
});
