import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from 'react-native';

// 1. Importa tus pantallas
import MesasScreen from "./screens/MesasScreen";
import ComandaScreen from "./screens/ComandaScreen";

// ✅ AÑADE ESTO en MesasScreen.tsx ✅
import type { AppScreenProps } from '../App'; // Asumiendo que App.tsx está un nivel arriba
type MesasScreenProps = AppScreenProps<'Mesas'>;



// 2. Define los tipos de navegación (¡Fuente de Verdad Central!)
// Aquí defines todas las pantallas de tu app y los parámetros que reciben
export type RootStackParamList = {
    Mesas: undefined; // 'Mesas' no recibe parámetros al abrirse
    Comanda: { // 'Comanda' SÍ recibe estos parámetros
        mesaId: string;
        numeroMesa: number;
        numComensales: number;
    };
    // ... aquí agregarás 'Pago', 'Cocina', 'Admin', etc.
};

// 3. Crea el Stack usando los tipos
const Stack = createNativeStackNavigator<RootStackParamList>();

// 4. Configura el App
export default function App() {
    return (
        <NavigationContainer>
            {/* Hacemos que la barra de estado (hora, batería) sea blanca */}
            <StatusBar barStyle="light-content" /> 
            
            <Stack.Navigator 
                initialRouteName="Mesas" // 5. Define la pantalla inicial
                
                // 6. Define estilos globales para TODAS las pantallas
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#FF9800', // Naranja del prototipo
                    },
                    headerTintColor: '#FFFFFF', // Color del texto (blanco)
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerTitleAlign: 'center', // Centra el título
                }}
            >
                {/* 7. Define cada pantalla en el Stack */}
                <Stack.Screen 
                    name="Mesas" 
                    component={MesasScreen} 
                    options={{
                        title: 'RestaurApp' // Título específico para esta pantalla
                        // Aquí podrías agregar el ícono de Menú y 'M'
                    }}
                />
                <Stack.Screen 
                    name="Comanda" 
                    component={ComandaScreen}
                    options={({ route }) => ({
                        // Título dinámico basado en los parámetros
                        title: `Mesa ${route.params.numeroMesa}`
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// 8. (Opcional pero recomendado) Exporta los tipos de props
export type AppScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;


