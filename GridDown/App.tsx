import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    UnifrakturMaguntia: require('./src/assets/fonts/UnifrakturMaguntia.ttf'),
    Spectral_400Regular: require('./src/assets/fonts/Spectral-Regular.ttf'),
    Spectral_700Bold: require('./src/assets/fonts/Spectral-Bold.ttf'),
    SourceCodePro_400Regular: require('./src/assets/fonts/SourceCodePro-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }} onLayout={onLayoutRootView}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <RootNavigator />
    </View>
  );
}
