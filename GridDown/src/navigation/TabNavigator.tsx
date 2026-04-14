import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

import { HomeScreen } from '../modules/home/HomeScreen';
import { ForagingNavigator } from '../modules/foraging/ForagingNavigator';
import { MedicalNavigator } from '../modules/medical/MedicalNavigator';
import { WikipediaNavigator } from '../modules/wikipedia/WikipediaNavigator';
import { NavigationNavigator } from '../modules/navigation/NavigationNavigator';
import { ToolsNavigator } from '../modules/tools/ToolsNavigator';

export type TabParamList = {
  Home: undefined;
  Forage: undefined;
  Medical: undefined;
  Wiki: undefined;
  Navigate: undefined;
  Tools: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? Colors.accent : Colors.textDim }}>
      {icon}
    </Text>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontFamily: Fonts.mono,
          fontSize: 9,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Forage"
        component={ForagingNavigator}
        options={{
          tabBarLabel: 'FORAGE',
          tabBarIcon: ({ focused }) => <TabIcon icon="🌿" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Medical"
        component={MedicalNavigator}
        options={{
          tabBarLabel: 'MEDICAL',
          tabBarIcon: ({ focused }) => <TabIcon icon="✚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wiki"
        component={WikipediaNavigator}
        options={{
          tabBarLabel: 'WIKI',
          tabBarIcon: ({ focused }) => <TabIcon icon="📖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Navigate"
        component={NavigationNavigator}
        options={{
          tabBarLabel: 'NAVIGATE',
          tabBarIcon: ({ focused }) => <TabIcon icon="🧭" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsNavigator}
        options={{
          tabBarLabel: 'TOOLS',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔧" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
