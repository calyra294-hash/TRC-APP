import React, {useEffect} from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/login/LoginScreen';
import OtraScreenAdmin from './src/screens/administrador/OtraScreenAdmin'; // Pantalla de perfil/logout de Admin[cite: 3]
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

// 1. Stack Anidado para Alquileres (Cliente)
function AlquileresNavigator () {
  return (
    <Stack.Navigator screenOptions={ { headerShown: false } }>
      <Stack.Screen name="AlquileresMain" component={ AlquileresScreen } />
      <Stack.Screen name="DetalleAlquiler" component={ DetalleAlquilerScreen } />
    </Stack.Navigator>
  );
}

// 2. Tab Navigator Principal (Usuarios Clientes Aprobados)
function MainTabs () {
  return (
    <Tab.Navigator
      screenOptions={ ( { route } ) => ( {
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
        tabBarIcon: ( { focused, color } ) => {
          let iconName;
          if ( route.name === 'Inicio' ) iconName = focused ? 'home' : 'home-outline';
          else if ( route.name === 'Vehículos' ) iconName = focused ? 'car' : 'car-outline';
          else if ( route.name === 'Alquileres' ) iconName = focused ? 'document-text' : 'document-text-outline';
          else if ( route.name === 'Reservas' ) iconName = focused ? 'calendar' : 'calendar-outline';
          else if ( route.name === 'Perfil' ) iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={ iconName } size={ 24 } color={ color } />;
        },
      } ) }
    >
      <Tab.Screen name="Inicio" component={ InicioScreen } />
      <Tab.Screen name="Vehículos" component={ VehiculosScreen } />
      <Tab.Screen name="Alquileres" component={ AlquileresNavigator } />
      <Tab.Screen name="Reservas" component={ ReservasScreen } />
      <Tab.Screen name="Perfil" component={ PerfilScreen } />
    </Tab.Navigator>
  );
}

// 3. Tab Navigator para Administradores (Basado en la guía de la U)
function AdminTabs () {
  return (
    <Tab.Navigator
      screenOptions={ ( { route } ) => ( {
        headerShown: false,
        tabBarActiveTintColor: '#7C7CFF', // Coherente con la paleta de la guía académica[cite: 8]
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 8 },
        tabBarIcon: ( { color, size } ) => {
          let iconName = route.name === 'ProductosTab' ? 'cube-outline' : 'person-outline';
          return <Ionicons name={ iconName } color={ color } size={ size } />;
        },
      } ) }
    >
      <Tab.Screen
        name="ProductosTab"
        component={ VehiculosScreen } // O tu pantalla de administración de productos actual[cite: 9]
        options={ { title: 'Productos' } }
      />
      <Tab.Screen
        name="OtraScreenAdmin"
        component={ OtraScreenAdmin } // Pantalla de perfil y botón de cerrar sesión[cite: 3, 9]
        options={ { title: 'Mi perfil' } }
      />
    </Tab.Navigator>
  );
}

// 4. Enrutador Interno (Dinámico por Sesión y Rol)
function AppNavigatorContent () {
  const { user, session, loading } = useAuth();

  if ( loading )
  {
    return (
      <View style={ styles.centerContainer }>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  // A) Sin sesión -> Muestra Login
  if ( !session || !user )
  {
    return <LoginScreen />;
  }

  // B) Pendiente de aprobación -> Muestra pantalla de revisión sin Tabs
  if ( user.estado_aprobacion === 'pendiente' )
  {
    return (
      <Stack.Navigator screenOptions={ { headerShown: false } }>
        <Stack.Screen name="Revision">
          { ( props ) => <PerfilScreen { ...props } modoRevision={ true } /> }
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // C) Bifurcación por Rol (Cliente vs Administrador)
  return (
    <Stack.Navigator screenOptions={ { headerShown: false } }>
      { user.rol === 'administrador' ? (
        <Stack.Screen name="AdminTabs" component={ AdminTabs } />
      ) : (
        <Stack.Screen name="MainTabs" component={ MainTabs } />
      ) }
    </Stack.Navigator>
  );
}

// 5. Raíz de la Aplicación
export default function App () {

  useEffect( () => {
    if ( __DEV__ )
    {
      // Se ejecuta en segundo plano *después* de que la app ya pintó la interfaz,
      // evitando congelar el arranque.
      saludService.verificarConexionLocal();
    }
  }, [] );

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

const styles = StyleSheet.create( {
  centerContainer: {
    flex: 1,
    backgroundColor: '#121824',
    justifyContent: 'center',
    alignItems: 'center',
  },
} );