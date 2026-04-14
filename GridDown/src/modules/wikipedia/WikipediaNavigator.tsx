import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WikipediaScreen } from './WikipediaScreen';
import { WikiArticleScreen } from './WikiArticleScreen';

export type WikiStackParamList = {
  WikiHome: undefined;
  WikiArticle: { url: string; title: string };
};

const Stack = createStackNavigator<WikiStackParamList>();

export function WikipediaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WikiHome" component={WikipediaScreen} />
      <Stack.Screen name="WikiArticle" component={WikiArticleScreen} />
    </Stack.Navigator>
  );
}
