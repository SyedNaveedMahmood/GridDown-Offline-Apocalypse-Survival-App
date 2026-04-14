import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Animated,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { getCondition, toggleFavorite, Condition } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { MedicalStackParamList } from './MedicalNavigator';

type RouteT = RouteProp<MedicalStackParamList, 'ConditionDetail'>;

const SEVERITY_BG: Record<string, string> = {
  minor: '#1A3A1A',
  moderate: '#3A2A0A',
  severe: '#3A0A0A',
  life_threatening: '#3A0A0A',
};
const SEVERITY_TEXT: Record<string, string> = {
  minor: Colors.accent,
  moderate: Colors.warn,
  severe: Colors.danger,
  life_threatening: Colors.danger,
};
const SEVERITY_LABEL: Record<string, string> = {
  minor: 'MINOR',
  moderate: 'MODERATE',
  severe: 'SEVERE',
  life_threatening: '⚠ LIFE THREATENING',
};

export function ConditionDetailScreen() {
  const { params } = useRoute<RouteT>();
  const nav = useNavigation();
  const [condition, setCondition] = useState<Condition | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCondition(params.id).then((c) => {
      if (c) {
        setCondition(c);
        setIsFavorite(c.is_favorite === 1);
        if (c.severity === 'life_threatening') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    });
  }, [params.id]);

  useEffect(() => {
    if (!condition || condition.severity !== 'life_threatening') return;
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [condition, blinkAnim]);

  const handleFavorite = useCallback(async () => {
    if (!condition) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite('medical_conditions', condition.id);
    setIsFavorite((p) => !p);
  }, [condition]);

  if (!condition) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  const isLifeThreat = condition.severity === 'life_threatening';

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.severityBar,
          { backgroundColor: SEVERITY_BG[condition.severity] },
          isLifeThreat && { borderWidth: 1, borderColor: Colors.danger, opacity: blinkAnim },
        ]}
      >
        <Text style={[styles.severityText, { color: SEVERITY_TEXT[condition.severity] }]}>
          {SEVERITY_LABEL[condition.severity]}
        </Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => nav.goBack()}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{condition.name}</Text>
          <TouchableOpacity
            onPress={handleFavorite}
            accessibilityLabel={isFavorite ? 'Remove favorite' : 'Add favorite'}
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favStar}>{isFavorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="SYMPTOMS" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{condition.symptoms}</Text>
        </View>

        <SectionHeader title="IMMEDIATE ACTION" />
        <View style={styles.body}>
          <Text style={[styles.bodyText, styles.bold]}>{condition.immediate_action}</Text>
        </View>

        {condition.treatment_no_supplies ? (
          <>
            <SectionHeader title="WITHOUT SUPPLIES" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{condition.treatment_no_supplies}</Text>
            </View>
          </>
        ) : null}

        {condition.treatment_with_supplies ? (
          <>
            <SectionHeader title="WITH SUPPLIES" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{condition.treatment_with_supplies}</Text>
            </View>
          </>
        ) : null}

        {condition.when_to_evac ? (
          <>
            <SectionHeader title="EVACUATION CRITERIA" />
            <View style={styles.body}>
              <DangerBanner text={condition.when_to_evac} icon="🚁" />
            </View>
          </>
        ) : null}

        <SectionHeader title="DATA SOURCE" />
        <View style={styles.body}>
          <Text style={styles.source}>{condition.source}</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  severityBar: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  severityText: { fontFamily: Fonts.mono, fontSize: 13, letterSpacing: 2 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  scroll: { paddingBottom: 60 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.h2,
    color: Colors.gold,
    flex: 1,
  },
  favStar: { fontSize: 28, color: Colors.gold, paddingLeft: 12 },
  body: { paddingHorizontal: 16, marginBottom: 4 },
  bodyText: {
    fontFamily: Fonts.bodyReg,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  bold: { fontFamily: Fonts.bodyBold, fontSize: FontSize.lg },
  source: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
