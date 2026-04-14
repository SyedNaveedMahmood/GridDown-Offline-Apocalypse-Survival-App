import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getMedications, Medication } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { DangerBanner } from '../../components/DangerBanner';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { MedicalStackParamList } from './MedicalNavigator';

type RouteT = RouteProp<MedicalStackParamList, 'MedicationDetail'>;

export function MedicationDetailScreen() {
  const { params } = useRoute<RouteT>();
  const nav = useNavigation();
  const [med, setMed] = useState<Medication | null>(null);

  useEffect(() => {
    getMedications('').then((all) => {
      const found = all.find((m) => m.id === params.id);
      if (found) setMed(found);
    });
  }, [params.id]);

  if (!med) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{med.name}</Text>
          <Text style={styles.generic}>{med.generic_name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{med.category}</Text>
          </View>
        </View>

        <SectionHeader title="USES" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{med.uses}</Text>
        </View>

        <SectionHeader title="ADULT DOSAGE" />
        <View style={styles.body}>
          <Text style={[styles.bodyText, styles.bold]}>{med.dosage_adult}</Text>
        </View>

        {med.dosage_child ? (
          <>
            <SectionHeader title="PEDIATRIC DOSAGE" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{med.dosage_child}</Text>
            </View>
          </>
        ) : null}

        <SectionHeader title="CONTRAINDICATIONS" />
        <View style={styles.body}>
          <DangerBanner text={med.contraindications} icon="⚠" />
        </View>

        <SectionHeader title="SIDE EFFECTS" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{med.side_effects}</Text>
        </View>

        {med.alternatives ? (
          <>
            <SectionHeader title="FIELD ALTERNATIVES" />
            <View style={styles.body}>
              <Text style={styles.bodyText}>{med.alternatives}</Text>
            </View>
          </>
        ) : null}

        <SectionHeader title="STORAGE" />
        <View style={styles.body}>
          <Text style={styles.bodyText}>{med.storage}</Text>
        </View>

        <SectionHeader title="DATA SOURCE" />
        <View style={styles.body}>
          <Text style={styles.source}>{med.source}</Text>
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
  titleBlock: { paddingHorizontal: 16, marginBottom: 8 },
  title: { fontFamily: Fonts.display, fontSize: FontSize.h2, color: Colors.gold },
  generic: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.textMuted, fontStyle: 'italic', marginTop: 4 },
  categoryBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.accentDim,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.accent, letterSpacing: 1 },
  body: { paddingHorizontal: 16, marginBottom: 4 },
  bodyText: { fontFamily: Fonts.bodyReg, fontSize: FontSize.md, color: Colors.text, lineHeight: 24 },
  bold: { fontFamily: Fonts.bodyBold },
  source: { fontFamily: Fonts.bodyReg, fontSize: 12, fontStyle: 'italic', color: Colors.textMuted, lineHeight: 20 },
});
