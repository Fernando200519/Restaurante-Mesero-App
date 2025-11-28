import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import { AuthProvider } from "./context/AuthContext";

import LoginScreen from "./screens/LoginScreen";
import MesasScreen from "./screens/MesasScreen";
import ComandaScreen from "./screens/ComandaScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";

export type RootStackParamList = {
  Login: undefined;
  Mesas: undefined;
  ChangePassword: undefined;
  Comanda: {
    mesaId: string;
    numeroMesa: number;
    numComensales: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: "#FA9623" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
            headerShown: true,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Mesas"
            component={MesasScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Comanda"
            component={ComandaScreen}
            options={({ route }) => ({
              title: `Mesa ${route.params.numeroMesa}`,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
