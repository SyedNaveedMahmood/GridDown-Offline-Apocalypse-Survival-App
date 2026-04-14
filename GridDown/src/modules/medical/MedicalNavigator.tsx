import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MedicalScreen } from './MedicalScreen';
import { ConditionDetailScreen } from './ConditionDetailScreen';
import { ProcedureDetailScreen } from './ProcedureDetailScreen';
import { MedicationDetailScreen } from './MedicationDetailScreen';

export type MedicalStackParamList = {
  MedicalHome: undefined;
  ConditionDetail: { id: number };
  ProcedureDetail: { id: number };
  MedicationDetail: { id: number };
};

const Stack = createStackNavigator<MedicalStackParamList>();

export function MedicalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicalHome" component={MedicalScreen} />
      <Stack.Screen name="ConditionDetail" component={ConditionDetailScreen} />
      <Stack.Screen name="ProcedureDetail" component={ProcedureDetailScreen} />
      <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
    </Stack.Navigator>
  );
}
