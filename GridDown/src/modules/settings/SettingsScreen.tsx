import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import {
  clearSearchHistory, clearAllFavorites, exportWaypoints,
} from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import {
  WIKI_PACKS, getDownloadedPacks, deletePack, getStorageUsed, downloadPack,
  WikiPack, DownloadProgress,
} from '../wikipedia/WikiDownloadManager';

const FONT_SCALES = [
  { label: '0.9×', value: 0.9 },
  { label: '1×', value: 1 },
  { label: '1.15×', value: 1.15 },
  { label: '1.3×', value: 1.3 },
];

const DATA_SOURCES = [
  { title: 'USDA Plants Database', detail: 'United States Department of Agriculture. plants.usda.gov. Public domain.' },
  { title: 'Samuel Thayer — Forager\'s Harvest', detail: 'Thayer, S. (2006). Forager\'s Harvest. Forager\'s Harvest Press.' },
  { title: 'Tom Brown Jr. — Guide to Wild Edible Plants', detail: 'Brown, T. (1985). Tom Brown\'s Guide to Wild Edible and Medicinal Plants. Berkley Books.' },
  { title: 'Wilderness Medicine — Auerbach', detail: 'Auerbach, P.S. (2017). Wilderness Medicine, 7th ed. Elsevier. ISBN 978-0323359429.' },
  { title: 'Where There Is No Doctor', detail: 'Werner, D. (2013). Where There Is No Doctor: A Village Health Care Handbook. Hesperian Health Guides.' },
  { title: 'US Army Survival Manual FM 21-76', detail: 'U.S. Department of the Army (1992). FM 21-76 Survival. Headquarters, Department of the Army. Public domain.' },
  { title: 'WHO ORS Formula', detail: 'World Health Organization (2006). Oral Rehydration Salts: production of the new ORS. WHO/FCH/CAH/06.1.' },
  { title: 'National Audubon Society Field Guides', detail: 'National Audubon Society. Field Guides to North American Plants. Alfred A. Knopf.' },
  { title: 'Peterson Field Guides', detail: 'Peterson, L. A. (1977). A Field Guide to Edible Wild Plants. Houghton Mifflin.' },
  { title: 'Wikipedia under CC BY-SA 4.0', detail: 'Wikimedia Foundation. Wikipedia articles used under Creative Commons Attribution-ShareAlike 4.0.' },
];

const LEGAL_TEXT = `DISCLAIMER — READ BEFORE USE

GridDown is a reference tool designed for educational purposes and emergency preparedness situations where no professional assistance is available.

MEDICAL INFORMATION: The medical content in this application is not a substitute for professional medical training, diagnosis, or treatment. Always seek qualified medical care when available. Life-threatening emergency procedures described herein are last-resort references only.

FORAGING SAFETY: Misidentification of wild plants and fungi can result in serious injury or death. Never consume any wild food unless you are 100% certain of its identification. When in doubt, do not eat. Always cross-reference multiple identification features.

ACCURACY: While every effort has been made to ensure accuracy, information may be incomplete, outdated, or inapplicable to your specific situation or region. The developers assume no liability for outcomes resulting from use of this information.

NO WARRANTY: This application is provided "as is" without warranty of any kind. Use of this application is at your own risk.

TRAINING: This app is not a replacement for hands-on survival training. Seek qualified instruction for all skills described herein before you need them.`;

export function SettingsScreen() {
  const { fontScale, setFontScale, dbReady } = useAppStore();
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>([]);
  const [storageUsedMB, setStorageUsedMB] = useState(0);
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const refreshPackState = useCallback(async () => {
    const packs = await getDownloadedPacks();
    const used = await getStorageUsed();
    setDownloadedPacks(packs);
    setStorageUsedMB(Math.round(used / (1024 * 1024)));
  }, []);

  useEffect(() => {
    refreshPackState();
  }, [refreshPackState]);

  const handleDownloadPack = useCallback(async (pack: WikiPack) => {
    setDownloading((prev) => ({ ...prev, [pack.id]: 0 }));
    try {
      await downloadPack(
        pack.id,
        (progress: DownloadProgress) => {
          setDownloading((prev) => ({ ...prev, [pack.id]: Math.round(progress.fraction * 100) }));
        }
      );
      await refreshPackState();
    } catch (e) {
      Alert.alert('Download Failed', String(e));
    } finally {
      setDownloading((prev) => {
        const next = { ...prev };
        delete next[pack.id];
        return next;
      });
    }
  }, [refreshPackState]);

  const handleDeletePack = useCallback((pack: WikiPack) => {
    Alert.alert(
      'Delete Pack',
      `Delete "${pack.name}" (${pack.sizeMB}MB)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deletePack(pack.id);
            await refreshPackState();
          },
        },
      ]
    );
  }, [refreshPackState]);

  const handleExportWaypoints = useCallback(async () => {
    if (!dbReady) return;
    try {
      const json = await exportWaypoints();
      const path = (FileSystem.documentDirectory ?? '') + 'griddown_waypoints.json';
      await FileSystem.writeAsStringAsync(path, json);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'application/json',
          dialogTitle: 'Export Waypoints',
        });
      } else {
        Alert.alert('Export Saved', `Waypoints saved to:\n${path}`);
      }
    } catch (e) {
      Alert.alert('Export Failed', String(e));
    }
  }, [dbReady]);

  const handleClearFavorites = useCallback(() => {
    Alert.alert(
      'Clear All Favorites',
      'Remove all saved favorites? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            if (dbReady) await clearAllFavorites();
          },
        },
      ]
    );
  }, [dbReady]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear Search History',
      'Delete all search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (dbReady) await clearSearchHistory();
          },
        },
      ]
    );
  }, [dbReady]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => prev === section ? null : section);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>SETTINGS</Text>
          <Text style={styles.headerTitle}>Configuration</Text>
        </View>

        {/* Content Packs */}
        <SectionHeader title="CONTENT PACKS" />
        <View style={styles.card}>
          <Text style={styles.cardMeta}>
            {storageUsedMB > 0 ? `${storageUsedMB} MB used` : 'No packs downloaded'}
          </Text>
          {WIKI_PACKS.map((pack) => {
            const isDownloaded = downloadedPacks.includes(pack.id);
            const dlProgress = downloading[pack.id];
            const isDownloading = dlProgress !== undefined;

            return (
              <View key={pack.id} style={styles.packRow}>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDesc}>{pack.description}</Text>
                  <Text style={styles.packSize}>{pack.sizeMB} MB</Text>
                  {isDownloading && (
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${dlProgress}%` }]} />
                    </View>
                  )}
                </View>
                {isDownloading ? (
                  <View style={styles.packAction}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text style={styles.progressText}>{dlProgress}%</Text>
                  </View>
                ) : isDownloaded ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePack(pack)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${pack.name}`}
                  >
                    <Text style={styles.deleteBtnText}>DELETE</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadPack(pack)}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${pack.name}, ${pack.sizeMB} megabytes`}
                  >
                    <Text style={styles.downloadBtnText}>DOWNLOAD</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Display */}
        <SectionHeader title="DISPLAY" />
        <View style={styles.card}>
          <Text style={styles.settingLabel}>FONT SCALE</Text>
          <View style={styles.fontScaleRow}>
            {FONT_SCALES.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.scaleBtn, fontScale === f.value && styles.scaleBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFontScale(f.value);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Font scale ${f.label}`}
                accessibilityState={{ selected: fontScale === f.value }}
              >
                <Text style={[styles.scaleBtnText, fontScale === f.value && styles.scaleBtnTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.previewText, { fontSize: 14 * fontScale }]}>
            Sample: Dandelion (Taraxacum officinale)
          </Text>
        </View>

        {/* Data Sources */}
        <SectionHeader title="DATA SOURCES" />
        <View style={styles.card}>
          {DATA_SOURCES.map((source, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sourceRow}
              onPress={() => toggleSection(`source-${i}`)}
              accessibilityRole="button"
              accessibilityLabel={source.title}
            >
              <View style={styles.sourceMain}>
                <Text style={styles.sourceTitle}>{source.title}</Text>
                {expandedSection === `source-${i}` && (
                  <Text style={styles.sourceDetail}>{source.detail}</Text>
                )}
              </View>
              <Text style={styles.sourceChevron}>
                {expandedSection === `source-${i}` ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal */}
        <SectionHeader title="LEGAL" />
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleSection('legal')}
          accessibilityRole="button"
          accessibilityLabel="View legal disclaimer"
        >
          <View style={styles.legalHeader}>
            <Text style={styles.settingLabel}>DISCLAIMER & TERMS OF USE</Text>
            <Text style={styles.sourceChevron}>
              {expandedSection === 'legal' ? '▲' : '▼'}
            </Text>
          </View>
          {expandedSection === 'legal' && (
            <Text style={styles.legalText}>{LEGAL_TEXT}</Text>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <SectionHeader title="DANGER ZONE" />
        <View style={[styles.card, styles.dangerCard]}>
          <DangerAction
            label="Export Waypoints (JSON)"
            description="Save all saved waypoints to a file"
            onPress={handleExportWaypoints}
            color={Colors.accent}
          />
          <View style={styles.divider} />
          <DangerAction
            label="Clear Search History"
            description="Delete all recent searches"
            onPress={handleClearHistory}
            color={Colors.warn}
          />
          <View style={styles.divider} />
          <DangerAction
            label="Clear All Favorites"
            description="Remove all starred plants and conditions"
            onPress={handleClearFavorites}
            color={Colors.danger}
          />
        </View>

        {/* Version */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>GridDown v1.0.0 — All systems offline</Text>
          <Text style={styles.versionSub}>100% offline after initial data download</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DangerAction({
  label, description, onPress, color,
}: {
  label: string;
  description: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={styles.dangerRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.dangerInfo}>
        <Text style={[styles.dangerLabel, { color }]}>{label}</Text>
        <Text style={styles.dangerDesc}>{description}</Text>
      </View>
      <Text style={[styles.dangerArrow, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accentDim,
    padding: 14,
  },
  dangerCard: {
    borderLeftColor: Colors.danger,
    padding: 0,
  },
  cardMeta: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  packRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 12,
  },
  packInfo: { flex: 1 },
  packName: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  packDesc: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  packSize: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.accentDim,
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  packAction: { alignItems: 'center', gap: 4 },
  progressText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.accent,
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  downloadBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.danger,
    letterSpacing: 1,
  },
  settingLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  fontScaleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  scaleBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  scaleBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim + '33',
  },
  scaleBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.textMuted,
  },
  scaleBtnTextActive: { color: Colors.accent },
  previewText: {
    fontFamily: Fonts.bodyReg,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 8,
  },
  sourceMain: { flex: 1 },
  sourceTitle: {
    fontFamily: Fonts.bodyReg,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 2,
  },
  sourceDetail: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  sourceChevron: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 4,
  },
  legalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalText: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 20,
    marginTop: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
    minHeight: 44,
  },
  dangerInfo: { flex: 1 },
  dangerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dangerDesc: {
    fontFamily: Fonts.bodyReg,
    fontSize: 12,
    color: Colors.textMuted,
  },
  dangerArrow: {
    fontFamily: Fonts.mono,
    fontSize: 20,
  },
  versionRow: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  versionSub: {
    fontFamily: Fonts.bodyReg,
    fontSize: 11,
    color: Colors.textDim,
  },
});
