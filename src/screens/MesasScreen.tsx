import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Modal,
    Pressable,
    ListRenderItemInfo // Importante para tipar el renderItem
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- 1. Definición de Tipos ---

// Definimos los posibles estados de una mesa
type MesaEstado = 'disponible' | 'ocupada' | 'pidiendo';

// Definimos la "forma" de un objeto Mesa
interface Mesa {
    id: string;
    numero: number;
    hall: string;
    estado: MesaEstado;
}



// --- Datos de Ejemplo (Tipados) ---
const DUMMY_MESAS: Mesa[] = [
    { id: '1', numero: 1, hall: '6 A', estado: 'disponible' },
    { id: '2', numero: 2, hall: '6 A', estado: 'disponible' },
    { id: '3', numero: 3, hall: '6 A', estado: 'disponible' },
    { id: '4', numero: 4, hall: '6 A', estado: 'disponible' },
    { id: '5', numero: 5, hall: '6 A', estado: 'disponible' },
    { id: '6', numero: 6, hall: '6 A', estado: 'disponible' },
    { id: '7', numero: 7, hall: '6 A', estado: 'disponible' },
    { id: '8', numero: 8, hall: '6 A', estado: 'disponible' },
    { id: '9', numero: 9, hall: '6 A', estado: 'disponible' },
];

// Color para el estado de la mesa (tipado con Record)
const statusColors: Record<MesaEstado, string> = {
    disponible: '#4CAF50', // Verde
    ocupada: '#F44336',    // Rojo
    pidiendo: '#FF9800', // Naranja
};

// --- Componente (Tipado como React.FC) ---
const MesasScreen: React.FC<MesasScreenProps> = ({ navigation }) => {
    
    // --- Estados (Tipados) ---
    const [mesas, setMesas] = useState<Mesa[]>(DUMMY_MESAS);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTable, setSelectedTable] = useState<Mesa | null>(null);
    const [comensales, setComensales] = useState<number>(1);

    // --- Funciones Handler (Tipadas) ---

    const handleMesaPress = (mesa: Mesa): void => {
        if (mesa.estado === 'disponible') {
            setSelectedTable(mesa);
            setComensales(1);
            setModalVisible(true);
        } else {
            console.log(`Mesa ${mesa.numero} ya está ${mesa.estado}`);
            // navigation.navigate('Comanda', { mesaId: mesa.id, ... }); // Ir a comanda existente
        }
    };

    const handleCerrarModal = (): void => {
        setModalVisible(false);
        setSelectedTable(null);
    };

    const handleAceptarComensales = (): void => {
        if (!selectedTable) return; // TS sabe que selectedTable no puede ser null aquí

        console.log(`Abriendo mesa ${selectedTable.numero} con ${comensales} comensales.`);

        setModalVisible(false);

        // Actualiza el estado local (esto se moverá al Context API)
        setMesas(prevMesas => prevMesas.map(mesa => 
            mesa.id === selectedTable.id ? { ...mesa, estado: 'ocupada' } : mesa
        ));
        
        // Navega a la pantalla de Comanda (con props tipadas)
        navigation.navigate('Comanda', { 
            mesaId: selectedTable.id, 
            numeroMesa: selectedTable.numero,
            numComensales: comensales 
        });
    };

    // --- Renderizado del Botón de Mesa (Tipado) ---
    const renderMesaItem = ({ item }: ListRenderItemInfo<Mesa>): React.ReactElement => {
        const color = statusColors[item.estado] || '#9E9E9E';

        return (
            <TouchableOpacity 
                style={[styles.mesaButton, { borderColor: color }]}
                onPress={() => handleMesaPress(item)}
            >
                <Text style={styles.mesaNumero}>{item.numero}</Text>
                <Text style={styles.mesaHall}>Hall {item.hall}</Text>
                <Text style={[styles.mesaEstado, { color: color }]}>
                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                </Text>
            </TouchableOpacity>
        );
    };

    // --- JSX de la Pantalla ---
    return (
        <View style={styles.container}>
            {/* Grid de Mesas (Tipado) */}
            <FlatList<Mesa> // Le decimos a FlatList que usa objetos 'Mesa'
                data={mesas}
                renderItem={renderMesaItem}
                keyExtractor={(item: Mesa) => item.id} // Tipamos el 'item' aquí
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                ListHeaderComponent={() => <Text style={styles.screenTitle}>Salón Principal</Text>}
            />

            {/* Área de Mensajes (Placeholder) */}
            <View style={styles.mensajesContainer}>
                <View style={styles.mensajesHeader}>
                    <View style={styles.statusDot} />
                    <Text style={styles.mensajesTitle}>Mensajes</Text>
                </View>
                <View style={styles.chatBubble}>
                    <Text style={styles.chatPlaceholder}>...</Text>
                </View>
            </View>

            {/* --- Modal de Comensales --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCerrarModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Pressable style={styles.closeButton} onPress={handleCerrarModal}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>

                        <Text style={styles.modalTitle}>Comensales</Text>
                        
                        <View style={styles.counterContainer}>
                            <TouchableOpacity 
                                style={[styles.counterButton, { backgroundColor: '#FFCDD2' }]}
                                onPress={() => setComensales(prev => Math.max(1, prev - 1))}
                            >
                                <Text style={[styles.counterButtonText, { color: '#D32F2F' }]}>-</Text>
                            </TouchableOpacity>
                            
                            <Text style={styles.counterNumber}>{comensales}</Text>
                            
                            <TouchableOpacity 
                                style={[styles.counterButton, { backgroundColor: '#C8E6C9' }]}
                                onPress={() => setComensales(prev => prev + 1)}
                            >
                                <Text style={[styles.counterButtonText, { color: '#388E3C' }]}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCerrarModal}
                            >
                                <Text style={styles.actionButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={handleAceptarComensales}
                            >
                                <Text style={styles.actionButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// --- Estilos (No cambian con TypeScript) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    gridContainer: {
        padding: 8,
    },
    // Estilos del Botón de Mesa
    mesaButton: {
        flex: 1,
        margin: 8,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    mesaNumero: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
    },
    mesaHall: {
        fontSize: 12,
        color: '#757575',
    },
    mesaEstado: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    // Estilos del Área de Mensajes
    mensajesContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    mensajesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    mensajesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
    },
    chatBubble: {
        backgroundColor: '#F5F5F5',
        height: 100,
        borderRadius: 50,
        width: 100,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
    },
    chatPlaceholder: {
        fontSize: 50,
        color: '#BDBDBD',
        lineHeight: 60,
    },
    // --- Estilos del Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#9E9E9E',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    counterButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    counterButtonText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    counterNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#212121',
        minWidth: 60,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 100,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#FFEBEE',
        borderColor: '#E57373',
        borderWidth: 1,
    },
    acceptButton: {
        backgroundColor: '#FF9800',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    }
});

export default MesasScreen;