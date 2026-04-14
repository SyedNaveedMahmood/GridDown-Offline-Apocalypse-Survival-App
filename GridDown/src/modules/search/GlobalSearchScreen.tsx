import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, SectionList, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  searchAll, getSearchHistory, saveSearchHistory, clearSearchHistory,
  Plant, Fungi, Condition, Procedure, Medication,
} from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { SearchBar } from '../../components/SearchBar';
import { SectionHeader } from '../../components/SectionHeader';
import { EdibilityBadge } from '../../components/EdibilityBadge';

type SearchResultItem =
  | { type: 'plant'; data: Plant }
  | { type: 'fungi'; data: Fungi }
  | { type: 'condition'; data: Condition }
  | { type: 'procedure'; data: Procedure }
  | { type: 'medication'; data: Medication };

type SectionData = {
  title: string;
  data: SearchResultItem[];
};

const ResultRow = memo(({ item, onPress }: { item: SearchResultItem; onPress: () => void }) => {
  const isDanger =
    (item.type === 'plant' || item.type === 'fungi') &&
    (item.data.edibility === 'toxic' || item.data.edibility === 'deadly');

  const getSubtitle = () => {
    switch (item.type) {
      case 'plant':
        return item.data.latin_name;
      case 'fungi':
        return item.data.latin_name;
      case 'condition':
        return item.data.category;
      case 'procedure':
        return item.data.category;
      case 'medication':
        return item.data.generic_name;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.resultRow, isDanger && styles.resultRowDanger]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.data.name ?? (item.data as any).common_name}, ${getSubtitle()}`}
    >
      <View style={styles.resultMain}>
        <Text style={styles.resultName} numberOfLines={1}>
          {(item.data as any).common_name ?? (item.data as any).name}
        </Text>
        <Text style={styles.resultSub} numberOfLines={1}>{getSubtitle()}</Text>
      </View>
      <View style={styles.resultRight}>
        {(item.type === 'plant' || item.type === 'fungi') && (
          <EdibilityBadge edibility={item.data.edibility} />
        )}
        {item.type === 'condition' && (
          <Text style={[
            styles.severityBadge,
            item.data.severity === 'life_threatening' || item.data.severity === 'severe'
              ? styles.severityDanger
              : item.data.severity === 'moderate'
              ? styles.severityWarn
              : styles.severityOk,
          ]}>
            {item.data.severity.toUpperCase().replace('_', ' ')}
          </Text>
        )}
        {item.type === 'procedure' && (
          <Text style={styles.diffBadge}>{item.data.difficulty.toUpperCase()}</Text>
        )}
        <Text style={styles.typeTag}>{item.type.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
});

export function GlobalSearchScreen() {
  const nav = useNavigation<any>();
  const { dbReady } = useAppStore();
  const [query, setQuery] = useState('');
  const [sections, setSections] = useState<SectionData[]>([]);
  const [history, setHistory] = useState<{ query: string; module: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (dbReady) {
      getSearchHistory().then(setHistory);
    }
  }, [dbReady]);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim() || !dbReady) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchAll(q.trim());
      await saveSearchHistory(q.trim(), 'global');

      const newSections: SectionData[] = [];
      if (results.plants.length > 0) {
        newSections.push({
          title: `PLANTS (${results.plants.length})`,
          data: results.plants.map((d) => ({ type: 'plant' as const, data: d })),
        });
      }
      if (results.fungi.length > 0) {
        newSections.push({
          title: `FUNGI (${results.fungi.length})`,
          data: results.fungi.map((d) => ({ type: 'fungi' as const, data: d })),
        });
      }
      if (results.conditions.length > 0) {
        newSections.push({
          title: `MEDICAL CONDITIONS (${results.conditions.length})`,
          data: results.conditions.map((d) => ({ type: 'condition' as const, data: d })),
        });
      }
      if (results.procedures.length > 0) {
        newSections.push({
          title: `PROCEDURES (${results.procedures.length})`,
          data: results.procedures.map((d) => ({ type: 'procedure' as const, data: d })),
        });
      }
      if (results.medications.length > 0) {
        newSections.push({
          title: `MEDICATIONS (${results.medications.length})`,
          data: results.medications.map((d) => ({ type: 'medication' as const, data: d })),
        });
      }

      setSections(newSections);
      getSearchHistory().then(setHistory);
    } finally {
      setLoading(false);
    }
  }, [dbReady]);

  const handleItemPress = useCallback((item: SearchResultItem) => {
    switch (item.type) {
      case 'plant':
        nav.navigate('Forage', { screen: 'PlantDetail', params: { id: item.data.id, type: 'plant' } });
        break;
      case 'fungi':
        nav.navigate('Forage', { screen: 'PlantDetail', params: { id: item.data.id, type: 'fungi' } });
        break;
      case 'condition':
        nav.navigate('Medical', { screen: 'ConditionDetail', params: { id: item.data.id } });
        break;
      case 'procedure':
        nav.navigate('Medical', { screen: 'ProcedureDetail', params: { id: item.data.id } });
        break;
      case 'medication':
        nav.navigate('Medical', { screen: 'MedicationDetail', params: { id: item.data.id } });
        break;
    }
  }, [nav]);

  const handleClearHistory = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const totalResults = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SEARCH</Text>
        <Text style={styles.subtitle}>All modules</Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => performSearch(query)}
        placeholder="Search plants, conditions, procedures..."
        returnKeyType="search"
        autoFocus
      />

      {loading && (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 24 }} />
      )}

      {!loading && searched && totalResults === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyCode}>NOT IN DATABASE</Text>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      )}

      {!loading && !searched && history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>RECENT SEARCHES</Text>
            <TouchableOpacity onPress={handleClearHistory} accessibilityRole="button" accessibilityLabel="Clear search history">
              <Text style={styles.clearBtn}>CLEAR</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyRow}
                onPress={() => { setQuery(item.query); performSearch(item.query); }}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${item.query}`}
              >
                <Text style={styles.historyIcon}>↻</Text>
                <Text style={styles.historyText}>{item.query}</Text>
                <Text style={styles.historyModule}>{item.module.toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {!loading && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.type}-${(item.data as any).id ?? index}`}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          renderItem={({ item }) => (
            <ResultRow
              item={item}
              onPress={() => handleItemPress(item)}
            />
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {!loading && !searched && history.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyCode}>GLOBAL SEARCH</Text>
          <Text style={styles.emptyText}>
            Search across plants, fungi, medical conditions, procedures, and medications
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyCode: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  historySection: { paddingTop: 8 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  historyTitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  clearBtn: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.danger,
    letterSpacing: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  historyIcon: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.textMuted,
  },
  historyText: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  historyModule: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accentDim,
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  resultRowDanger: { borderLeftColor: Colors.danger },
  resultMain: { flex: 1 },
  resultName: {
    fontFamily: Fonts.bodyBold ?? Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  resultSub: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  typeTag: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  severityBadge: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  severityDanger: { color: Colors.danger },
  severityWarn: { color: Colors.warn },
  severityOk: { color: Colors.accent },
  diffBadge: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.accentDim,
    letterSpacing: 0.5,
  },
});
