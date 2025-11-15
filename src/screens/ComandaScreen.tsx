import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// Importamos los tipos que definiremos en App.tsx
import { RootStackParamList } from '../App'; // Asumiendo que App.tsx está un nivel arriba

// Tipamos las props de esta pantalla
type ComandaScreenProps = NativeStackScreenProps<RootStackParamList, 'Comanda'>;

const ComandaScreen: React.FC<ComandaScreenProps> = ({ route }) => {
    // Obtenemos los parámetros pasados desde MesasScreen
    const { mesaId, numeroMesa, numComensales } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comanda</Text>
            <Text style={styles.info}>Mesa ID: {mesaId}</Text>
            <Text style={styles.info}>Número de Mesa: {numeroMesa}</Text>
            <Text style={styles.info}>Comensales: {numComensales}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    info: {
        fontSize: 18,
    }
});

export default ComandaScreen;