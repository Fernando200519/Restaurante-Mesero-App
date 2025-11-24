import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
} from 'react-native';


import { FontAwesome as Icon } from '@expo/vector-icons'; 


import { AppScreenProps } from '../navigation/types';


type Props = AppScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = (): void => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    
    console.log('Intentando login con:', username, password);

    if (username.toLowerCase() === 'mesero' && password === '123456') {
      Alert.alert('¡Éxito!', 'Has iniciado sesión correctamente.');
      navigation.replace('HomeMesero'); 
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Naranja */}
      <View style={styles.header}>
        <Image 
          
          source={require('../../assets/logo_restaurapp.png')} 
          style={styles.logo} 
        />
        <Text style={styles.headerText}>RestaurApp</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>
          
          <Text style={styles.label}>Usuario</Text>
          <View style={styles.inputContainer}>
            {/* El componente Icon funciona exactamente igual */}
            <Icon name="user" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre de usuario"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese tu contraseña"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  header: {
    backgroundColor: '#FF9800', 
    paddingVertical: 30, 
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 80, 
    height: 80, 
    resizeMode: 'contain', 
    marginBottom: 10,
    tintColor: '#fff', 
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    paddingHorizontal: 20,
    paddingTop: 30, 
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30, 
    alignSelf: 'flex-start', 
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    alignSelf: 'flex-start', 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0', 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20, 
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1, 
    fontSize: 16,
    color: '#333',
    height: '100%', 
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF9800', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;