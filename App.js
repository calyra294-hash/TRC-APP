import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/login/LoginScreen';
import PendingApprovalScreen from './src/screens/PendingApprovalScreen'; 

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

// 1. Stack Anidado para Alquileres (Tu código original)
function AlquileresStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Alquileres" component={AlquileresScreen} />
      <Stack.Screen name="DetalleAlquiler" component={DetalleAlquilerScreen} />
    </Stack.Navigator>
  );
}

// 2. Tab Navigator Principal de la App (Tu código original)
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

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vehículos') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Alquileres') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Reservas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

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

// 3. Enrutador Condicional
function AppRouter() {
  const { user, session, loading } = useAuth();

  // A) Mientras valida la sesión en AsyncStorage
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  // B) Si no hay sesión iniciada -> Muestra LoginScreen por defecto
  if (!session || !user) {
    return <LoginScreen />;
  }

  // C) Si el usuario está autenticado pero su cuenta NO está aprobada
  if (user.estado_aprobacion === 'pendiente') {
    return <PendingApprovalScreen />;
  }

  // D) Si está autenticado y APROBADO -> Renderiza toda la App
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// 4. Raíz de la Aplicación
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppRouter />
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