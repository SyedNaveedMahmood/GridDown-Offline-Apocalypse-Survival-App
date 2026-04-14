import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  WIKI_PACKS, WikiPack, getDownloadedPacks, downloadPack,
  deletePack, getStorageUsed, DownloadProgress,
} from './WikiDownloadManager';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WikipediaScreen() {
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<Record<string, DownloadProgress>>({});
  const [storageUsed, setStorageUsed] = useState(0);

  const refresh = useCallback(async () => {
    const [d, s] = await Promise.all([getDownloadedPacks(), getStorageUsed()]);
    setDownloaded(d);
    setStorageUsed(s);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDownload = useCallback(
    async (pack: WikiPack) => {
      setDownloading((prev) => ({
        ...prev,
        [pack.id]: { packId: pack.id, bytesWritten: 0, totalBytes: pack.sizeMB * 1024 * 1024, fraction: 0 },
      }));
      try {
        await downloadPack(pack.id, (p) => {
          setDownloading((prev) => ({ ...prev, [pack.id]: p }));
        });
        await refresh();
      } catch (e) {
        console.warn('Download failed', e);
      }
      setDownloading((prev) => {
        const next = { ...prev };
        delete next[pack.id];
        return next;
      });
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (packId: string) => {
      await deletePack(packId);
      await refresh();
    },
    [refresh]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offline Encyclopedia</Text>
      </View>

      {downloaded.length === 0 && Object.keys(downloading).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO OFFLINE ENCYCLOPEDIA LOADED</Text>
          <Text style={styles.emptySubtitle}>
            Download a subject pack while connected to internet.{'\n'}
            Once stored on device, it functions indefinitely without connection.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={WIKI_PACKS}
        keyExtractor={(p) => p.id}
        renderItem={({ item: pack }) => {
          const isDownloaded = downloaded.includes(pack.id);
          const progress = downloading[pack.id];
          const isDownloading = !!progress;
          return (
            <View style={styles.packCard}>
              <View style={styles.packHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDesc}>{pack.description}</Text>
                  <Text style={styles.packSize}>
                    {isDownloaded ? '✓ DOWNLOADED' : `~${pack.sizeMB} MB`}
                  </Text>
                </View>
                {isDownloaded ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(pack.id)}
                    accessibilityLabel={`Delete ${pack.name}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.deleteBtnText}>DELETE</Text>
                  </TouchableOpacity>
                ) : !isDownloading ? (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownload(pack)}
                    accessibilityLabel={`Download ${pack.name}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.downloadBtnText}>DOWNLOAD</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {isDownloading && progress && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${Math.round(progress.fraction * 100)}%` }]} />
                  <Text style={styles.progressText}>
                    {Math.round(progress.fraction * 100)}% · {formatBytes(progress.bytesWritten)} / {formatBytes(progress.totalBytes)}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          storageUsed > 0 ? (
            <View style={styles.storageBar}>
              <Text style={styles.storageText}>Storage used: {formatBytes(storageUsed)}</Text>
            </View>
          ) : null
        }
      />

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.gold },
  emptyState: {
    padding: 24,
    backgroundColor: Colors.surface,
    margin: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accentDim,
  },
  emptyTitle: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  packCard: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
  },
  packHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  packName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.lg, color: Colors.text, marginBottom: 4 },
  packDesc: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, marginBottom: 6, lineHeight: 20 },
  packSize: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  downloadBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 2,
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
  downloadBtnText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.bg, letterSpacing: 1 },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 2,
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
  deleteBtnText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.danger, letterSpacing: 1 },
  progressContainer: { marginTop: 10 },
  progressBar: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginBottom: 6,
  },
  progressText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  storageBar: { padding: 12, alignItems: 'center' },
  storageText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
});
