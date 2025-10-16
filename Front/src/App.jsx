import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { View, Image, ImageBackground, Text, ActivityIndicator, StyleSheet } from 'react-native';

import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';

const Stack = createNativeStackNavigator();

// Ocultar inmediatamente el splash nativo de Expo
SplashScreen.hideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simular carga de la app
    const prepareApp = async () => {
      try {
        // Aquí puedes agregar carga de fuentes, assets, configuración inicial, etc.
        await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 segundos de carga
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!isReady) {
    // Mostrar splash screen personalizado
    return (
      <ImageBackground
        source={require('../assets/bg-splash.jpg')}
        style={styles.splashContainer}
        resizeMode="cover"
      >
        <View style={styles.splashContent}>
          {/* Logo centrado arriba */}
          <Image
            source={require('../assets/splash.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 180,
    height: 180,
  },
});