import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ToolsHomeScreen } from './ToolsHomeScreen';
import { WaterScreen } from './WaterScreen';
import { FireScreen } from './FireScreen';
import { ShelterScreen } from './ShelterScreen';
import { SignalScreen } from './SignalScreen';
import { KnotsScreen } from './KnotsScreen';
import { ChecklistScreen } from './ChecklistScreen';
import { CalorieScreen } from './CalorieScreen';
import { WeatherScreen } from './WeatherScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { GlobalSearchScreen } from '../search/GlobalSearchScreen';

export type ToolsStackParamList = {
  ToolsHome: undefined;
  Water: undefined;
  Fire: undefined;
  Shelter: undefined;
  Signal: undefined;
  Knots: undefined;
  Checklist: undefined;
  Calorie: undefined;
  Weather: undefined;
  Settings: undefined;
  Search: undefined;
};

const Stack = createStackNavigator<ToolsStackParamList>();

export function ToolsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ToolsHome" component={ToolsHomeScreen} />
      <Stack.Screen name="Water" component={WaterScreen} />
      <Stack.Screen name="Fire" component={FireScreen} />
      <Stack.Screen name="Shelter" component={ShelterScreen} />
      <Stack.Screen name="Signal" component={SignalScreen} />
      <Stack.Screen name="Knots" component={KnotsScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
      <Stack.Screen name="Calorie" component={CalorieScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Search" component={GlobalSearchScreen} />
    </Stack.Navigator>
  );
}
