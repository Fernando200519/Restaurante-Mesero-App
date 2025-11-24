import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

import { RootStackParamList } from './navigation/types';
import LoginScreen from './screens/LoginScreen';

const HomeMeseroScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>¡Bienvenido, Mesero!</Text>
    <Text>Aquí irá la lista de Mesas.</Text>
  </View>
);

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="HomeMesero"
          component={HomeMeseroScreen}
          options={{ headerShown: true, title: 'Mesas Disponibles' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;