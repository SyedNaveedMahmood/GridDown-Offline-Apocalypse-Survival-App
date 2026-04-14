import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { searchPlants, searchFungi, Plant, Fungi } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SearchBar } from '../../components/SearchBar';
import { EdibilityBadge } from '../../components/EdibilityBadge';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import type { ForagingStackParamList } from './ForagingNavigator';

type Nav = StackNavigationProp<ForagingStackParamList, 'ForagingHome'>;

type FilterKey = 'all' | 'safe' | 'caution' | 'toxic' | 'fungi' | 'spring' | 'summer' | 'fall' | 'winter';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'caution', label: 'Caution' },
  { key: 'toxic', label: 'Toxic' },
  { key: 'fungi', label: 'Fungi' },
  { key: 'spring', label: 'Spring' },
  { key: 'summer', label: 'Summer' },
  { key: 'fall', label: 'Fall' },
  { key: 'winter', label: 'Winter' },
];

type ListItem = (Plant | Fungi) & { _type: 'plant' | 'fungi' };

const ITEM_HEIGHT = 84;

const PlantCard = memo(function PlantCard({
  item,
  onPress,
}: {
  item: ListItem;
  onPress: () => void;
}) {
  const isDanger = item.edibility === 'toxic' || item.edibility === 'deadly';
  return (
    <TouchableOpacity
      style={[styles.card, isDanger && styles.cardDanger]}
      onPress={onPress}
      accessibilityLabel={`${item.common_name}, edibility: ${item.edibility}`}
      accessibilityRole="button"
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImagePlaceholder}>
          {item._type === 'fungi' ? '🍄' : '🌿'}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.common_name}</Text>
        <Text style={styles.cardLatin} numberOfLines={1}>{item.latin_name}</Text>
        <View style={styles.cardBottom}>
          <EdibilityBadge edibility={item.edibility} />
          <Text style={styles.cardHabitat} numberOfLines={1}>
            {item.habitat ? ` · ${item.habitat}` : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

export function ForagingScreen() {
  const nav = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (filter === 'fungi') {
        const fungi = await searchFungi(query);
        setItems(fungi.map((f) => ({ ...f, _type: 'fungi' as const })));
      } else {
        const season = ['spring', 'summer', 'fall', 'winter'].includes(filter) ? filter : undefined;
        const edib = ['safe', 'caution', 'toxic'].includes(filter) ? filter : undefined;
        const plants = await searchPlants(query, edib, season);
        setItems(plants.map((p) => ({ ...p, _type: 'plant' as const })));
      }
    } finally {
      setLoading(false);
    }
  }, [query, filter]);

  useEffect(() => { load(); }, [load]);

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => (
      <PlantCard
        item={item}
        onPress={() => nav.navigate('PlantDetail', { id: item.id, type: item._type })}
      />
    ),
    [nav]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    []
  );

  const keyExtractor = useCallback((item: ListItem) => `${item._type}-${item.id}`, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Field Guide</Text>
        <TouchableOpacity
          style={styles.fungiBtn}
          onPress={() => nav.navigate('FungiGuide')}
          accessibilityLabel="Open Fungi Guide"
          accessibilityRole="button"
        >
          <Text style={styles.fungiBtnText}>🍄 FUNGI GUIDE</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search plants, berries, roots..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, filter === f.key && styles.pillActive]}
            onPress={() => setFilter(f.key)}
            accessibilityLabel={`Filter: ${f.label}`}
            accessibilityRole="button"
          >
            <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <SkeletonLoader count={6} height={ITEM_HEIGHT} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>NOT IN DATABASE</Text>
          <Text style={styles.emptyHint}>Try a different search or filter</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={styles.list}
        />
      )}

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
  },
  fungiBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    minHeight: 34,
    justifyContent: 'center',
  },
  fungiBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  filterRow: { flexGrow: 0, marginVertical: 4 },
  filterContent: { paddingHorizontal: 12, gap: 6 },
  pill: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 30,
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: Colors.accent,
    backgroundColor: '#1A3A1A',
  },
  pillText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textDim,
  },
  pillTextActive: { color: Colors.accent },
  list: { paddingBottom: 8 },
  card: {
    height: ITEM_HEIGHT,
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginVertical: 2,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDanger: { borderLeftColor: Colors.danger },
  cardImage: {
    width: 60,
    height: 60,
    backgroundColor: Colors.bg,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholder: { fontSize: 28 },
  cardContent: { flex: 1 },
  cardName: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: 2,
  },
  cardLatin: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  cardBottom: { flexDirection: 'row', alignItems: 'center' },
  cardHabitat: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
    marginLeft: 4,
  },
  chevron: { fontSize: FontSize.xl, color: Colors.accentDim },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptyHint: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textDim },
});
