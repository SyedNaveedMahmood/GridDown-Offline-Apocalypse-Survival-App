import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { searchFungi, Fungi } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SearchBar } from '../../components/SearchBar';
import { EdibilityBadge } from '../../components/EdibilityBadge';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import type { ForagingStackParamList } from './ForagingNavigator';

type Nav = StackNavigationProp<ForagingStackParamList, 'ForagingHome'>;

const ITEM_HEIGHT = 84;

const FungiCard = memo(function FungiCard({
  item,
  onPress,
}: {
  item: Fungi;
  onPress: () => void;
}) {
  const isDeadly = item.edibility === 'deadly';
  const borderColor = isDeadly ? Colors.danger : Colors.accent;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={onPress}
      accessibilityLabel={`${item.common_name}, ${item.latin_name}, edibility: ${item.edibility}`}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <View style={styles.textBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.commonName} numberOfLines={1}>
              {item.common_name}
            </Text>
          </View>
          <Text style={styles.latinName} numberOfLines={1}>
            {item.latin_name}
          </Text>
          <View style={styles.badgeRow}>
            <EdibilityBadge edibility={item.edibility} />
            {item.habitat ? (
              <Text style={styles.habitat} numberOfLines={1}>
                {' '}{item.habitat}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
});

export function FungiScreen() {
  const nav = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [fungi, setFungi] = useState<Fungi[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const results = await searchFungi(q);
      setFungi(results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => load(query), 250);
    return () => clearTimeout(timeout);
  }, [query, load]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    []
  );

  const renderItem: ListRenderItem<Fungi> = useCallback(
    ({ item }) => (
      <FungiCard
        item={item}
        onPress={() => nav.navigate('PlantDetail', { id: item.id, type: 'fungi' })}
      />
    ),
    [nav]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fungi Guide</Text>
        <Text style={styles.headerSub}>
          Always cut puffballs in half before eating. Never eat a mushroom unless 100% identified.
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search fungi, mushrooms..."
      />

      {loading ? (
        <SkeletonLoader count={6} />
      ) : fungi.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>NOT IN DATABASE</Text>
          <Text style={styles.emptyHint}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={fungi}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠ Fungi identification errors can be fatal. When in doubt, do not eat.
        </Text>
      </View>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
    marginBottom: 6,
  },
  headerSub: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.warn,
    lineHeight: 18,
  },
  list: { paddingBottom: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    marginVertical: 4,
    marginHorizontal: 12,
    height: ITEM_HEIGHT,
    padding: 12,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  commonName: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  latinName: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitat: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  chevron: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    color: Colors.accentDim,
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  emptyHint: {
    fontFamily: Fonts.bodyReg,
    fontSize: 13,
    color: Colors.textDim,
    marginTop: 8,
  },
  disclaimer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  disclaimerText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.warn,
    letterSpacing: 0.5,
  },
});
