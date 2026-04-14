import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationScreen } from './NavigationScreen';
import { CompassScreen } from './CompassScreen';
import { WaypointScreen } from './WaypointScreen';

export type NavStackParamList = {
  NavHome: undefined;
  Compass: undefined;
  Waypoints: undefined;
};

const Stack = createStackNavigator<NavStackParamList>();

export function NavigationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NavHome" component={NavigationScreen} />
      <Stack.Screen name="Compass" component={CompassScreen} />
      <Stack.Screen name="Waypoints" component={WaypointScreen} />
    </Stack.Navigator>
  );
}
