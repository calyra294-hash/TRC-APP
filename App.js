import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/login/LoginScreen';

import {
  InicioScreen,
  VehiculosScreen,
  ReservasScreen,
  PerfilScreen,
  AlquileresScreen,
  DetalleAlquilerScreen,
} from './src/screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. Stack Anidado para Alquileres
function AlquileresStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Alquileres" component={AlquileresScreen} />
      <Stack.Screen name="DetalleAlquiler" component={DetalleAlquilerScreen} />
    </Stack.Navigator>
  );
}

// 2. Tab Navigator Principal (Usuarios APROBADOS)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Vehículos') iconName = focused ? 'car' : 'car-outline';
          else if (route.name === 'Alquileres') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Reservas') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Vehículos" component={VehiculosScreen} />
      <Tab.Screen name="Alquileres" component={AlquileresStack} />
      <Tab.Screen name="Reservas" component={ReservasScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// 3. Enrutador Interno (Sin duplicar NavigationContainer)
function AppNavigatorContent() {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  console.log('Estado actual de Auth -> Session:', !!session, '| User:', user?.email, '| Estado:', user?.estado_aprobacion);

  // A) Sin sesión -> Muestra Login
  if (!session || !user) {
    return <LoginScreen />;
  }

  // B) Pendiente de aprobación -> Muestra pantalla de revisión sin Tabs
  if (user.estado_aprobacion === 'pendiente') {
    return <PerfilScreen modoRevision={true} />;
  }

  // C) Aprobado -> Muestra la App principal con sus Tabs
  return <MainTabs />;
}

// 4. Raíz de la Aplicación (ÚNICO NavigationContainer global)
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigatorContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#121824',
    justifyContent: 'center',
    alignItems: 'center',
  },
});