import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ForagingScreen } from './ForagingScreen';
import { PlantDetailScreen } from './PlantDetailScreen';
import { FungiScreen } from './FungiScreen';

export type ForagingStackParamList = {
  ForagingHome: undefined;
  PlantDetail: { id: number; type: 'plant' | 'fungi' };
  FungiGuide: undefined;
};

const Stack = createStackNavigator<ForagingStackParamList>();

export function ForagingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ForagingHome" component={ForagingScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="FungiGuide" component={FungiScreen} />
    </Stack.Navigator>
  );
}
