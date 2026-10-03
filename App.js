import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

function AlquileresStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Alquileres"
        component={AlquileresScreen}
      />

      <Stack.Screen
        name="DetalleAlquiler"
        component={DetalleAlquilerScreen}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
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
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
        />

        <Tab.Screen
          name="Vehículos"
          component={VehiculosScreen}
        />

        <Tab.Screen
          name="Alquileres"
          component={AlquileresStack}
        />

        <Tab.Screen
          name="Reservas"
          component={ReservasScreen}
        />

        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}