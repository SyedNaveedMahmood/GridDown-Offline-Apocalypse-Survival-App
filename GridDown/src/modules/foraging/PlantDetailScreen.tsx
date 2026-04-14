import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { getPlant, getFungi, toggleFavorite, addRecentlyViewed, Plant, Fungi } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { EdibilityBadge } from '../../components/EdibilityBadge';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { ForagingStackParamList } from './ForagingNavigator';

type RouteT = RouteProp<ForagingStackParamList, 'PlantDetail'>;

type PlantOrFungi = (Plant | Fungi) & { _type: 'plant' | 'fungi' };

export function PlantDetailScreen() {
  const { params } = useRoute<RouteT>();
  const nav = useNavigation();
  const [item, setItem] = useState<PlantOrFungi | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      let loaded: PlantOrFungi | null = null;
      if (params.type === 'plant') {
        const p = await getPlant(params.id);
        if (p) loaded = { ...p, _type: 'plant' };
      } else {
        const f = await getFungi(params.id);
        if (f) loaded = { ...f, _type: 'fungi' };
      }
      if (loaded) {
        setItem(loaded);
        setIsFavorite(loaded.is_favorite === 1);
        addRecentlyViewed(
          params.type,
          String(params.id),
          loaded.common_name
        );
      }
    })();
  }, [params]);

  const handleFavorite = useCallback(async () => {
    if (!item) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const table = item._type === 'plant' ? 'plants' : 'fungi';
    await toggleFavorite(table, item.id);
    setIsFavorite((prev) => !prev);
  }, [item]);

  if (!item) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  const plant = item as Plant & { _type: string };
  const fungi = item as Fungi & { _type: string };
  const hasLookAlikes = item.look_alikes && item.look_alikes.length > 0;
  const deadlyLookAlikes =
    item._type === 'fungi' ? (fungi.deadly_look_alikes || null) : null;
  const medicinal = item._type === 'plant' ? plant.medicinal : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.imageHeader}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>
            {item._type === 'fungi' ? '🍄' : '🌿'}
          </Text>
        </View>
        {/* Gradient overlay */}
        <View style={styles.gradient} />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.nameOverlay}>
          <Text style={styles.plantName}>{item.common_name}</Text>
          <EdibilityBadge edibility={item.edibility} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <SectionHeader title="IDENTIFICATION" />
        <View style={styles.body}>
          <Text style={styles.latin}>{item.latin_name}</Text>
          {item.habitat ? <Text style={styles.field}><Text style={styles.label}>Habitat: </Text>{item.habitat}</Text> : null}
          {item.season ? <Text style={styles.field}><Text style={styles.label}>Season: </Text>{item.season}</Text> : null}
          {'regions' in item && plant.regions ? (
            <Text style={styles.fieldMuted}>{plant.regions}</Text>
          ) : null}
        </View>

        {('preparation' in item && item.preparation) ? (
          <>
            <SectionHeader title="HOW TO EAT" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{item.preparation}</Text>
            </View>
          </>
        ) : null}

        {(item.description || item.identification) ? (
          <>
            <SectionHeader title="IDENTIFICATION NOTES" />
            <View style={styles.body}>
              {item.description ? <Text style={styles.bodyText}>{item.description}</Text> : null}
              {item.identification ? <Text style={[styles.bodyText, { marginTop: 8 }]}>{item.identification}</Text> : null}
            </View>
          </>
        ) : null}

        {hasLookAlikes ? (
          <>
            <SectionHeader title="⚠ LOOK-ALIKES" />
            <View style={styles.body}>
              <DangerBanner
                text={item.look_alikes!}
                icon="⚠"
              />
            </View>
          </>
        ) : null}

        {deadlyLookAlikes ? (
          <>
            <SectionHeader title="☠ DEADLY LOOK-ALIKES" />
            <View style={styles.body}>
              <DangerBanner text={deadlyLookAlikes} icon="☠" />
            </View>
          </>
        ) : null}

        {medicinal ? (
          <>
            <SectionHeader title="MEDICINAL USES" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{medicinal}</Text>
            </View>
          </>
        ) : null}

        <SectionHeader title="DATA SOURCE" />
        <View style={styles.body}>
          <Text style={styles.source}>{item.source}</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky favorite button */}
      <TouchableOpacity
        style={[styles.favBtn, isFavorite && styles.favBtnActive]}
        onPress={handleFavorite}
        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        accessibilityRole="button"
      >
        <Text style={styles.favBtnText}>
          {isFavorite ? '★ Saved' : '☆ Save Reference'}
        </Text>
      </TouchableOpacity>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  imageHeader: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: { fontSize: 72, opacity: 0.4 },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simple dark overlay at bottom
    bottom: 0,
    top: '40%',
    backgroundColor: Colors.bg,
    opacity: 0.85,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.accent,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    gap: 6,
  },
  plantName: {
    fontFamily: Fonts.display,
    fontSize: FontSize.h1,
    color: Colors.gold,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  body: { paddingHorizontal: 16, marginBottom: 4 },
  latin: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  field: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  label: { fontFamily: Fonts.bodyBold, color: Colors.textMuted },
  fieldMuted: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted },
  bodyText: {
    fontFamily: Fonts.bodyReg,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  source: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  favBtn: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
    minHeight: 44,
  },
  favBtnActive: { backgroundColor: Colors.accentDim },
  favBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.bg,
    letterSpacing: 1,
  },
});
