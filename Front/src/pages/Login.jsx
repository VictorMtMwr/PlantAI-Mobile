import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    console.log('Email:', email);
    console.log('Password:', password);
    // Aquí iría la lógica de autenticación
    Alert.alert('Login', `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Fondo simulado */}
      <View style={styles.background}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>LeafLens IA</Text>

          {/* Subtítulo */}
          <Text style={styles.subtitle}>Iniciar sesion</Text>

          {/* Campos de entrada */}
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Botón Continuar */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </TouchableOpacity>

          {/* Botón Google */}
          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>G Continue with Google</Text>
          </TouchableOpacity>

          {/* Enlace de Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una Cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#2d3748', // Gris oscuro para simular fondo de hojas
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semitransparente oscuro
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
    textAlign: 'left',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2d5a27', // Verde oscuro
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontSize: 16,
  },
  registerLink: {
    color: '#4ade80', // Verde
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;