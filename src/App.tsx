import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, Platform } from "react-native";

import { AuthProvider } from "./context/AuthContext";
import { COLORS } from "./constants/theme";

import LoginScreen from "./screens/LoginScreen";
import MesasScreen from "./screens/MesasScreen";
import ComandaScreen from "./screens/ComandaScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import MenuProductosScreen from "./screens/MenuProductsScreen";
import ResumenPedidoScreen from "./screens/ResumenPedidoScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Mesas: undefined;
  ChangePassword: undefined;
  Comanda: {
    mesaId: string;
    mesaNombre: string;
    numComensales: number;
    orderId: number;
  };
  MenuProductos: {
    orderId: number;
    comensal: string;
    mesaId?: string | number;
  };
  ResumenPedido: {
    cart: any[];
    comensalNombre: string;
    orderId: number;
    mesaId: number | string;
    updateCart: (cart: any[]) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* StatusBar consistente con el fondo blanco de la app */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.background,
            },
            headerTintColor: COLORS.primary, // Iconos y botones en #FF8108
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "800",
              color: COLORS.text.primary,
              fontSize: 18,
            },
            headerShadowVisible: false,
            headerShown: true,
            animation:
              Platform.OS === "android" ? "fade_from_bottom" : "default",
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
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
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="MenuProductos"
            component={MenuProductosScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResumenPedido"
            component={ResumenPedidoScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
