import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from '../app/auth/login';
import SignupScreen from '../app/auth/signup';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
