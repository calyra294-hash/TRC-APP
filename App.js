import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/login/LoginScreen';
import OtraScreenAdmin from './src/screens/administrador/OtraScreenAdmin';
import ReservasAdminScreen from './src/screens/administrador/ReservasAdminScreen';
import InicioAdminScreen from './src/screens/administrador/InicioAdminScreen';
import AlquileresAdminScreen from './src/screens/administrador/AlquileresAdminScreen';
import EscanearQRScreen from './src/screens/administrador/EscanearQRScreen';

import { saludService } from './src/services/salud.service';

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

function AlquileresNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AlquileresMain"
        component={AlquileresScreen}
      />
      <Stack.Screen
        name="DetalleAlquiler"
        component={DetalleAlquilerScreen}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#D31A24',
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
          let iconName = 'home-outline';

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vehículos') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Alquileres') {
            iconName = focused
              ? 'document-text'
              : 'document-text-outline';
          } else if (route.name === 'Reservas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Vehículos" component={VehiculosScreen} />
      <Tab.Screen
        name="Alquileres"
        component={AlquileresNavigator}
      />
      <Tab.Screen name="Reservas" component={ReservasScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#D31A24',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 7,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'person-outline';

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vehículos') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Reservas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Alquileres') {
            iconName = focused
              ? 'document-text'
              : 'document-text-outline';
          } else if (route.name === 'Escanear QR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Mi perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioAdminScreen} />
      <Tab.Screen name="Vehículos" component={VehiculosScreen} />
      <Tab.Screen name="Reservas" component={ReservasAdminScreen} />
      <Tab.Screen name="Alquileres" component={AlquileresAdminScreen} />
      <Tab.Screen
        name="Escanear QR"
        component={EscanearQRScreen}
      />
      <Tab.Screen name="Mi perfil" component={OtraScreenAdmin} />
    </Tab.Navigator>
  );
}

function AppNavigatorContent() {
  const { user, session, loading } = useAuth();

  const rolActual = String(user?.rol || '').toLowerCase().trim();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D31A24" />
      </View>
    );
  }

  if (!session || !user) {
    return <LoginScreen />;
  }

  const esAdministrador = [
    'admin',
    'administrador',
  ].includes(rolActual);

  if (
    !esAdministrador &&
    user.estado_aprobacion === 'pendiente'
  ) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Revision">
          {(props) => (
            <PerfilScreen
              {...props}
              modoRevision={true}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {esAdministrador ? (
        <Stack.Screen
          name="AdminTabs"
          component={AdminTabs}
        />
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      saludService.verificarConexionLocal();
    }
  }, []);

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
