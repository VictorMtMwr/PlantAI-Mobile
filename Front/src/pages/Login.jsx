import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Asumimos que @expo/vector-icons está instalado.
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

// Componente para el botón de Google
const SocialButton = ({ title, iconName, onPress }) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress}>
    <MaterialCommunityIcons name={iconName} size={24} color="#000" style={styles.socialIcon} />
    <Text style={styles.socialButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    // 9. Lógica de manejo
    if (!email || !password) {
      Alert.alert("Error", "Por favor, introduce tu correo y contraseña.");
      return;
    }
    console.log('Iniciando sesión con:', { email, password });
    // navigation.navigate('Home'); // Descomentar al tener la ruta Home
  };

  const navigateToRegister = () => {
    // 10. Navegación
    navigation.navigate('Register'); 
  };

  return (
    // 1. Estructura y Fondo
    <ImageBackground source={require('../../assets/bg-leaf.jpg')} style={styles.background}>
      {/* Overlay oscuro (2. Fondo y Contenedor) */}
      <View style={styles.overlay} />

      {/* KeyboardAvoidingView para manejar el teclado (1. Estructura) */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          // Ajustes para centrado vertical y manejo de scroll
          keyboardShouldPersistTaps="handled" 
        >
          <View style={styles.contentBox}>
            {/* 3. Título y Subtítulo (Ubicación: Centrado en la parte superior del contenido) */}
            <Text style={styles.appTitle}>LeafLens IA</Text>
            <Text style={styles.screenTitle}>Iniciar sesion</Text>

            {/* 4. Campos de Entrada */}
            <TextInput
              style={styles.input}
              placeholder="Correo Electronico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* 5. Botón Principal: Continuar */}
            <TouchableOpacity style={styles.mainButton} onPress={handleLogin}>
              <Text style={styles.mainButtonText}>Continuar</Text>
            </TouchableOpacity>

            <View style={{ height: 10 }} />

            {/* 6. Botón Secundario: Google */}
            <SocialButton
              title="Continue with Google"
              iconName="google"
              onPress={() => console.log('Login con Google')}
            />

            {/* 7. Enlace de Registro (Ubicación: Parte inferior) */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿No tienes una Cuenta?-{' '}
                <Text style={styles.registerLink} onPress={navigateToRegister}>
                  Regístrate
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // **2. Fondo y Contenedor:**
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta la imagen para cubrir todo el fondo
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Oscurece la imagen de fondo
  },
  container: {
    flex: 1,
    width: '100%',
  },
  // **Ubicación:** Centrado Vertical y Horizontal
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 25,
  },
  contentBox: {
    width: '100%',
    maxWidth: 350, 
    alignItems: 'center',
  },
  // **3. Título y Subtítulo - Tipo de letra y tamaño**
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#90EE90', // Un verde brillante similar al mockup
    marginBottom: 5,
    // La 'IA' en el mockup parece ser un poco más pequeña o de diferente color, pero lo haremos uniforme por ahora.
  },
  screenTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 40,
    fontWeight: '600',
  },
  // **4. Campos de Entrada - Estilo**
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20, // Espacio entre campos
    fontSize: 16,
    // Box Shadow simulado para dar profundidad (solo funciona en iOS/Android con elevation)
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  // **5. Botón Principal: Continuar - Estilo**
  mainButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#38B000', // Verde Principal
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // **6. Botón Secundario: Google - Estilo**
  socialButton: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  // **7. Enlace de Registro - Estilo y Ubicación**
  registerContainer: {
    // Se mantiene centrado en la parte inferior del ScrollView
    marginTop: 50, 
    alignItems: 'center',
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerLink: {
    color: '#38B000', // El 'Regístrate' es del color principal
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});