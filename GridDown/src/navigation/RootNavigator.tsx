import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { initDatabase } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

export function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDbReady = useAppStore((s) => s.setDbReady);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbReady(true);
        setReady(true);
      })
      .catch((e) => {
        setError(String(e));
        setReady(true); // Still show app even if DB failed
      });
  }, [setDbReady]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.appName}>GridDown</Text>
        <Text style={styles.subtitle}>Offline Survival Reference</Text>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Animated.Text style={[styles.status, { opacity: blinkAnim }]}>
            All systems offline. Ready.
          </Animated.Text>
        )}
        <ActivityIndicator
          color={Colors.accent}
          style={{ marginTop: 24 }}
          size="small"
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontFamily: Fonts.display,
    fontSize: 48,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.bodyReg,
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  status: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 1,
  },
  errorText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.danger,
    textAlign: 'center',
  },
});
