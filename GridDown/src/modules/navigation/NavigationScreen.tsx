import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../store/useAppStore';
import { saveWaypoint, getWaypoints, Waypoint } from '../../db/database';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import { formatCoordinates, CoordFormat } from '../../utils/coordinates';
import type { NavStackParamList } from './NavigationNavigator';

type Nav = StackNavigationProp<NavStackParamList, 'NavHome'>;

export function NavigationScreen() {
  const nav = useNavigation<Nav>();
  const { gpsCoords, isTracking, trackedPath, setIsTracking, addPathPoint } = useAppStore();
  const [coordFormat, setCoordFormat] = useState<CoordFormat>('decimal');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [wpName, setWpName] = useState('');
  const [wpNotes, setWpNotes] = useState('');

  useEffect(() => {
    getWaypoints().then(setWaypoints);
  }, []);

  useEffect(() => {
    if (isTracking && gpsCoords) {
      addPathPoint({ lat: gpsCoords.lat, lng: gpsCoords.lng });
    }
  }, [gpsCoords, isTracking, addPathPoint]);

  const cycleFormat = useCallback(() => {
    setCoordFormat((prev) => {
      if (prev === 'decimal') return 'dms';
      if (prev === 'dms') return 'mgrs';
      return 'decimal';
    });
  }, []);

  const handleSaveWaypoint = useCallback(async () => {
    if (!gpsCoords || !wpName.trim()) return;
    await saveWaypoint(wpName.trim(), gpsCoords.lat, gpsCoords.lng, wpNotes);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSaveModal(false);
    setWpName('');
    setWpNotes('');
    const updated = await getWaypoints();
    setWaypoints(updated);
  }, [gpsCoords, wpName, wpNotes]);

  const region = gpsCoords
    ? {
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.0902,
        longitude: -95.7129,
        latitudeDelta: 30,
        longitudeDelta: 30,
      };

  const coordText = gpsCoords
    ? formatCoordinates(gpsCoords.lat, gpsCoords.lng, coordFormat)
    : '-- acquiring GPS --';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top panel — 35% */}
      <View style={styles.topPanel}>
        <TouchableOpacity onPress={cycleFormat} accessibilityRole="button" accessibilityLabel="Cycle coordinate format">
          <Text style={styles.formatLabel}>{coordFormat.toUpperCase()} ▾</Text>
          <Text style={styles.coords}>{coordText}</Text>
        </TouchableOpacity>

        {gpsCoords && (
          <View style={styles.gpsDetails}>
            {gpsCoords.altitude !== null && (
              <Text style={styles.gpsMeta}>ALT {Math.round(gpsCoords.altitude ?? 0)}m</Text>
            )}
            {gpsCoords.accuracy !== null && (
              <Text style={styles.gpsMeta}>ACC ±{Math.round(gpsCoords.accuracy ?? 0)}m</Text>
            )}
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => { if (!gpsCoords) { Alert.alert('GPS not acquired'); return; } setShowSaveModal(true); }}
            accessibilityLabel="Save waypoint"
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>📍 SAVE WP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => nav.navigate('Compass')}
            accessibilityLabel="Compass"
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>🧭 COMPASS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, isTracking && styles.btnActive]}
            onPress={() => setIsTracking(!isTracking)}
            accessibilityLabel={isTracking ? 'Stop tracking path' : 'Start tracking path'}
            accessibilityRole="button"
          >
            <Text style={[styles.btnText, isTracking && styles.btnTextActive]}>
              {isTracking ? '⏹ STOP' : '▶ TRACK'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map — 65% */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={!!gpsCoords}
        showsMyLocationButton={false}
        mapType="terrain"
        rotateEnabled={false}
      >
        {waypoints.map((wp) => (
          <Marker
            key={wp.id}
            coordinate={{ latitude: wp.lat, longitude: wp.lng }}
            title={wp.name}
            description={wp.notes}
            pinColor={Colors.accent}
          />
        ))}
        {trackedPath.length > 1 && (
          <Polyline
            coordinates={trackedPath.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={Colors.accent}
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Save Waypoint Modal */}
      <Modal visible={showSaveModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>SAVE WAYPOINT</Text>
            <Text style={styles.modalCoords}>{coordText}</Text>
            <TextInput
              style={styles.input}
              placeholder="Waypoint name (required)"
              placeholderTextColor={Colors.textDim}
              value={wpName}
              onChangeText={setWpName}
              autoFocus
              selectionColor={Colors.accent}
              accessibilityLabel="Waypoint name"
            />
            <TextInput
              style={[styles.input, styles.inputNotes]}
              placeholder="Notes (optional)"
              placeholderTextColor={Colors.textDim}
              value={wpNotes}
              onChangeText={setWpNotes}
              multiline
              selectionColor={Colors.accent}
              accessibilityLabel="Waypoint notes"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSaveModal(false)}
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !wpName.trim() && styles.saveBtnDisabled]}
                onPress={handleSaveWaypoint}
                disabled={!wpName.trim()}
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topPanel: {
    height: '35%',
    padding: 14,
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  formatLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.accentDim, letterSpacing: 2, marginBottom: 4 },
  coords: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.text, lineHeight: 22 },
  gpsDetails: { flexDirection: 'row', gap: 16 },
  gpsMeta: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  btnText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.text, letterSpacing: 0.5 },
  btnTextActive: { color: Colors.bg },
  map: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surfaceAlt,
    padding: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.accent,
  },
  modalTitle: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.gold, letterSpacing: 2, marginBottom: 8 },
  modalCoords: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted, marginBottom: 16 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: 12,
    fontFamily: Fonts.bodyReg,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
    borderRadius: 2,
  },
  inputNotes: { height: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
  },
  cancelBtnText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMuted },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
  },
  saveBtnDisabled: { backgroundColor: Colors.accentDim, opacity: 0.5 },
  saveBtnText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.bg, letterSpacing: 2 },
});
