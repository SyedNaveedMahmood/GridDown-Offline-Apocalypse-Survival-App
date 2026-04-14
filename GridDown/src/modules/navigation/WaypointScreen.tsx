import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getWaypoints, Waypoint } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

export function WaypointScreen() {
  const nav = useNavigation();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  useEffect(() => {
    getWaypoints().then(setWaypoints);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Saved Waypoints</Text>

      {waypoints.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>NO WAYPOINTS SAVED</Text>
          <Text style={styles.emptyHint}>Save waypoints from the map screen</Text>
        </View>
      ) : (
        <FlatList
          data={waypoints}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowCoords}>
                {item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°
              </Text>
              {item.notes ? <Text style={styles.rowNotes}>{item.notes}</Text> : null}
              <Text style={styles.rowDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  title: { fontFamily: Fonts.display, fontSize: 24, color: Colors.gold, paddingHorizontal: 16, marginBottom: 12 },
  row: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
  },
  rowName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.text },
  rowCoords: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  rowNotes: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  rowDate: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textDim, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.textMuted, letterSpacing: 2 },
  emptyHint: { fontFamily: Fonts.bodyReg, fontSize: 13, color: Colors.textDim, marginTop: 8 },
});
