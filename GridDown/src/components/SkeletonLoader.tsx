import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  count?: number;
  height?: number;
}

function SkeletonRow({ height = 84 }: { height?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View style={[styles.row, { height, opacity }]}>
      <View style={styles.image} />
      <View style={styles.content}>
        <View style={styles.line} />
        <View style={[styles.line, styles.lineShort]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonLoader({ count = 5, height = 84 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} height={height} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    marginVertical: 4,
    marginHorizontal: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  line: {
    height: 14,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 2,
    width: '80%',
  },
  lineShort: {
    width: '50%',
  },
});
