import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Fonts, FontSize } from '../../theme/typography';
import { SectionHeader } from '../../components/SectionHeader';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';

type Tier = '72hr' | '2week' | 'longterm';

interface CheckItem {
  id: string;
  category: string;
  item: string;
  qty: string;
  note: string;
}

const CHECKLIST: Record<Tier, CheckItem[]> = {
  '72hr': [
    { id: '72-w1', category: 'Water', item: 'Bottled water', qty: '1 gallon/person/day', note: '3 gallons minimum per person' },
    { id: '72-w2', category: 'Water', item: 'Water purification tablets', qty: '1 pack', note: 'Backup to boiling' },
    { id: '72-f1', category: 'Food', item: 'Non-perishable food', qty: '3 days supply', note: 'No cooking required' },
    { id: '72-f2', category: 'Food', item: 'Manual can opener', qty: '1', note: '' },
    { id: '72-m1', category: 'Medical', item: 'First aid kit', qty: '1', note: 'Minimum: bandages, antiseptic, gauze' },
    { id: '72-m2', category: 'Medical', item: 'Prescription medications (7-day supply)', qty: '7 days', note: 'Critical' },
    { id: '72-t1', category: 'Tools', item: 'Flashlight + batteries', qty: '2', note: 'Or hand-crank' },
    { id: '72-t2', category: 'Tools', item: 'Battery or hand-crank radio', qty: '1', note: 'NOAA weather radio preferred' },
    { id: '72-t3', category: 'Tools', item: 'Multi-tool or knife', qty: '1', note: '' },
    { id: '72-t4', category: 'Tools', item: 'Matches or lighter', qty: '2', note: 'Waterproof matches' },
    { id: '72-c1', category: 'Communication', item: 'Phone charger + power bank', qty: '1', note: 'Fully charged' },
    { id: '72-c2', category: 'Communication', item: 'Local map printed', qty: '1', note: 'Paper — no power needed' },
    { id: '72-d1', category: 'Documents', item: 'ID copies (digital + paper)', qty: '1 set', note: 'Waterproof bag' },
    { id: '72-s1', category: 'Shelter', item: 'Emergency mylar blankets', qty: '1/person', note: 'Space blankets' },
    { id: '72-s2', category: 'Shelter', item: 'Change of clothes in bag', qty: '1 set', note: 'Weather-appropriate' },
  ],
  '2week': [
    { id: '2w-w1', category: 'Water', item: 'Water storage (14+ gallons/person)', qty: '14 gallons/person', note: 'Multiple containers' },
    { id: '2w-w2', category: 'Water', item: 'Water filter (Sawyer, LifeStraw)', qty: '1', note: 'Gravity or squeeze filter' },
    { id: '2w-w3', category: 'Water', item: 'Sodium hypochlorite (unscented bleach)', qty: '1 gallon', note: '5-6% concentration' },
    { id: '2w-f1', category: 'Food', item: 'Canned goods (variety)', qty: '14 days supply', note: 'Rotate stock' },
    { id: '2w-f2', category: 'Food', item: 'Dry goods: rice, beans, pasta', qty: '10-20 lbs', note: 'Long shelf life' },
    { id: '2w-f3', category: 'Food', item: 'Cooking fuel (propane or wood)', qty: '2 week supply', note: 'Stove + fuel' },
    { id: '2w-f4', category: 'Food', item: 'Camp stove', qty: '1', note: '' },
    { id: '2w-m1', category: 'Medical', item: 'Expanded first aid kit', qty: '1', note: 'Including tourniquet, sutures, hemostatic gauze' },
    { id: '2w-m2', category: 'Medical', item: 'Antibiotics (if obtainable)', qty: '1 course', note: 'Amoxicillin, ciprofloxacin' },
    { id: '2w-m3', category: 'Medical', item: 'OTC medications', qty: '2 week supply', note: 'Ibuprofen, acetaminophen, antidiarrheal' },
    { id: '2w-t1', category: 'Tools', item: 'Generator or solar panel', qty: '1', note: 'Power for essential devices' },
    { id: '2w-t2', category: 'Tools', item: 'Hand tools (saw, axe, shovel)', qty: '1 set', note: '' },
    { id: '2w-c1', category: 'Communication', item: 'HAM radio or walkie-talkies', qty: '2+', note: 'For neighborhood communication' },
    { id: '2w-s1', category: 'Shelter', item: 'Tarp (heavy duty, 10x12 minimum)', qty: '2', note: '' },
    { id: '2w-s2', category: 'Shelter', item: 'Sleeping bags for coldest expected temp', qty: '1/person', note: '' },
    { id: '2w-s3', category: 'Shelter', item: 'Cordage / paracord', qty: '100 feet', note: '' },
  ],
  'longterm': [
    { id: 'lt-w1', category: 'Water', item: 'Rainwater collection system', qty: '1', note: 'Barrel + gutters' },
    { id: 'lt-w2', category: 'Water', item: 'Well or spring access plan', qty: 'Identified', note: 'Know your local sources' },
    { id: 'lt-f1', category: 'Food', item: 'Garden seeds (heirloom, non-GMO)', qty: '1 year variety', note: 'Calorie crops: potatoes, beans, corn, squash' },
    { id: 'lt-f2', category: 'Food', item: 'Preserved food (freeze-dried, canned)', qty: '1 year supply', note: '2000+ cal/day/person' },
    { id: 'lt-f3', category: 'Food', item: 'Foraging knowledge (this app)', qty: 'Downloaded', note: '' },
    { id: 'lt-f4', category: 'Food', item: 'Hunting/fishing equipment', qty: '1 set', note: 'Licenses if required' },
    { id: 'lt-m1', category: 'Medical', item: 'Advanced trauma kit', qty: '1', note: 'Including surgical instruments' },
    { id: 'lt-m2', category: 'Medical', item: 'Dental kit', qty: '1', note: 'Temp fillings, clove oil' },
    { id: 'lt-m3', category: 'Medical', item: 'Medical reference books', qty: '2+', note: 'Where There Is No Doctor, etc.' },
    { id: 'lt-t1', category: 'Tools', item: 'Hand tools for all basic construction', qty: '1 set', note: 'No power required versions' },
    { id: 'lt-t2', category: 'Tools', item: 'Wood stove or rocket stove', qty: '1', note: 'Heating + cooking' },
    { id: 'lt-t3', category: 'Tools', item: 'Solar power system', qty: 'Installed', note: 'Panels + battery bank + inverter' },
    { id: 'lt-c1', category: 'Communication', item: 'HAM radio license + radio', qty: '1', note: 'Long-range communication' },
    { id: 'lt-s1', category: 'Shelter', item: 'Structural shelter improvements', qty: 'Done', note: 'Insulation, security, storage' },
    { id: 'lt-s2', category: 'Shelter', item: 'Community/neighborhood network', qty: 'Established', note: 'Essential for long-term survival' },
  ],
};

const TIER_LABELS: Record<Tier, string> = {
  '72hr': '72 HR',
  '2week': '2 WEEK',
  'longterm': 'LONG TERM',
};

const STORAGE_KEY = 'griddown_checklist_v1';

export function ChecklistScreen() {
  const nav = useNavigation();
  const [tier, setTier] = useState<Tier>('72hr');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setChecked(new Set(JSON.parse(val)));
    });
  }, []);

  const toggleItem = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const items = CHECKLIST[tier];
  const done = items.filter((i) => checked.has(i.id)).length;

  const handleExport = useCallback(async () => {
    const lines = ['GridDown Preparedness Checklist', `Tier: ${TIER_LABELS[tier]}`, ''];
    const cats = [...new Set(items.map((i) => i.category))];
    for (const cat of cats) {
      lines.push(`\n${cat.toUpperCase()}`);
      items
        .filter((i) => i.category === cat)
        .forEach((i) => {
          const status = checked.has(i.id) ? '[x]' : '[ ]';
          lines.push(`  ${status} ${i.item} (${i.qty})${i.note ? ' — ' + i.note : ''}`);
        });
    }
    const path = (FileSystem.cacheDirectory ?? '') + 'checklist.txt';
    await FileSystem.writeAsStringAsync(path, lines.join('\n'));
    await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Export Checklist' });
  }, [tier, items, checked]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()} accessibilityRole="button">
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.tabs}>
        {(['72hr', '2week', 'longterm'] as Tier[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tier === t && styles.tabActive]}
            onPress={() => setTier(t)}
            accessibilityRole="tab"
          >
            <Text style={[styles.tabText, tier === t && styles.tabTextActive]}>
              {TIER_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(done / items.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{done}/{items.length}</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportBtn} accessibilityRole="button">
          <Text style={styles.exportText}>EXPORT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {[...new Set(items.map((i) => i.category))].map((cat) => (
          <View key={cat}>
            <SectionHeader title={cat.toUpperCase()} />
            {items
              .filter((i) => i.category === cat)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.checkRow}
                  onPress={() => toggleItem(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: checked.has(item.id) }}
                >
                  <View style={[styles.checkbox, checked.has(item.id) && styles.checkboxDone]}>
                    {checked.has(item.id) && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, checked.has(item.id) && styles.itemDone]}>
                      {item.item}
                    </Text>
                    <Text style={styles.itemQty}>{item.qty}</Text>
                    {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.surfaceAlt },
  tabText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted, letterSpacing: 1 },
  tabTextActive: { color: Colors.accent },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: Colors.surface, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  progressText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMuted },
  exportBtn: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 2 },
  exportText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted, letterSpacing: 1 },
  scroll: { paddingBottom: 60 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  checkbox: {
    width: 24, height: 24, borderWidth: 1, borderColor: Colors.border, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkMark: { color: Colors.bg, fontSize: 14, fontWeight: 'bold' },
  itemText: { fontFamily: Fonts.bodyReg, fontSize: 14, color: Colors.text, lineHeight: 22 },
  itemDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  itemQty: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.accentDim, marginTop: 2 },
  itemNote: { fontFamily: Fonts.bodyReg, fontSize: 12, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
});
