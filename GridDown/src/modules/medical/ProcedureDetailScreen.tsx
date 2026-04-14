import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getProcedures, Procedure } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { MedicalStackParamList } from './MedicalNavigator';

type RouteT = RouteProp<MedicalStackParamList, 'ProcedureDetail'>;

interface Step {
  step: number;
  text: string;
  warning?: string;
}

const DIFF_COLOR: Record<string, string> = {
  basic: Colors.accent,
  intermediate: Colors.warn,
  advanced: Colors.danger,
};

export function ProcedureDetailScreen() {
  const { params } = useRoute<RouteT>();
  const nav = useNavigation();
  const [procedure, setProcedure] = useState<Procedure | null>(null);

  useEffect(() => {
    getProcedures().then((all) => {
      const found = all.find((p) => p.id === params.id);
      if (found) setProcedure(found);
    });
  }, [params.id]);

  if (!procedure) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  let steps: Step[] = [];
  try {
    steps = JSON.parse(procedure.steps_json);
  } catch {}

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{procedure.name}</Text>
          <View style={[styles.diffBadge, { borderColor: DIFF_COLOR[procedure.difficulty] }]}>
            <Text style={[styles.diffText, { color: DIFF_COLOR[procedure.difficulty] }]}>
              {procedure.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <SectionHeader title="REQUIRED EQUIPMENT" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{procedure.required_tools}</Text>
        </View>

        <SectionHeader title="IMPROVISED ALTERNATIVES" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{procedure.improvised_tools}</Text>
        </View>

        <SectionHeader title="STEP-BY-STEP" />
        <View style={styles.steps}>
          {steps.map((s) => (
            <View key={s.step}>
              <View style={styles.stepCard}>
                <Text style={styles.stepNum}>{String(s.step).padStart(2, '0')}</Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
              {s.warning ? (
                <View style={styles.stepWarning}>
                  <DangerBanner text={s.warning} icon="⚠" />
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {procedure.warnings ? (
          <>
            <SectionHeader title="WARNINGS" />
            <View style={styles.body}>
              <DangerBanner text={procedure.warnings} icon="⚠" />
            </View>
          </>
        ) : null}

        <SectionHeader title="DATA SOURCE" />
        <View style={styles.body}>
          <Text style={styles.source}>{procedure.source}</Text>
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
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  scroll: { paddingBottom: 60 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.h2,
    color: Colors.gold,
    flex: 1,
  },
  diffBadge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  diffText: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1 },
  body: { paddingHorizontal: 16, marginBottom: 4 },
  bodyText: {
    fontFamily: Fonts.bodyReg,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  steps: { paddingHorizontal: 12 },
  stepCard: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    marginVertical: 3,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xl,
    color: Colors.gold,
    minWidth: 30,
  },
  stepText: {
    fontFamily: Fonts.bodyReg,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
    flex: 1,
  },
  stepWarning: { marginHorizontal: 4, marginBottom: 4 },
  source: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
