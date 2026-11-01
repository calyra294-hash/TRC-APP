
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function OtraScreenAdmin() {
  const { user, logout } = useAuth();

  const handleCerrarSesion = async () => {
    const confirmar = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);

        if (Platform.OS === 'web') {
          window.alert('No se pudo cerrar la sesión.');
        } else {
          Alert.alert('Error', 'No se pudo cerrar la sesión.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas cerrar la sesión de administrador?')) {
        await confirmar();
      }
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Deseas salir de tu cuenta de administrador?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar sesión',
            style: 'destructive',
            onPress: confirmar,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>Mi perfil</Text>
          <Text style={styles.headerSubtitulo}>
            Administración TRC App
          </Text>
        </View>

        <View style={styles.perfilCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={45} color="#FFFFFF" />
          </View>

          <Text style={styles.nombre}>
            {user?.nombre || user?.nombre1 || 'Administrador'}
          </Text>

          <Text style={styles.correo}>
            {user?.email || 'Admin'}
          </Text>

          <View style={styles.rolBadge}>
            <Ionicons name="shield-checkmark" size={15} color="#D31A24" />
            <Text style={styles.rolTexto}>ADMINISTRADOR</Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Información de la cuenta</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoFila}>
            <View style={styles.iconoInfo}>
              <Ionicons name="mail-outline" size={21} color="#D31A24" />
            </View>

            <View style={styles.infoContenido}>
              <Text style={styles.infoEtiqueta}>Correo electrónico</Text>
              <Text style={styles.infoValor}>
                {user?.email || 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.divisor} />

          <View style={styles.infoFila}>
            <View style={styles.iconoInfo}>
              <Ionicons name="person-circle-outline" size={21} color="#D31A24" />
            </View>

            <View style={styles.infoContenido}>
              <Text style={styles.infoEtiqueta}>Tipo de cuenta</Text>
              <Text style={styles.infoValor}>Administrador</Text>
            </View>
          </View>

          <View style={styles.divisor} />

          <View style={styles.infoFila}>
            <View style={styles.iconoInfo}>
              <Ionicons name="checkmark-circle-outline" size={21} color="#D31A24" />
            </View>

            <View style={styles.infoContenido}>
              <Text style={styles.infoEtiqueta}>Estado</Text>
              <Text style={styles.estadoActivo}>Cuenta activa</Text>
            </View>
          </View>
        </View>

        <View style={styles.versionCard}>
          <Ionicons name="car-sport-outline" size={25} color="#D31A24" />
          <View>
            <Text style={styles.versionTitulo}>TRC App</Text>
            <Text style={styles.versionTexto}>
              Panel de administración
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonLogout}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.textoBoton}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.pie}>
          Tito's Rent a Car · TRC App
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#72060c',
    paddingTop: 40,
    paddingBottom: 75,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitulo: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitulo: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 5,
  },
  perfilCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -55,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: '#D31A24',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nombre: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#121212',
  },
  correo: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEBEC',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
    gap: 6,
  },
  rolTexto: {
    color: '#D31A24',
    fontWeight: 'bold',
    fontSize: 11,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
    marginHorizontal: 22,
    marginTop: 28,
    marginBottom: 13,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 16,
  },
  infoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },
  iconoInfo: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FCEBEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  infoContenido: {
    flex: 1,
  },
  infoEtiqueta: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValor: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '600',
  },
  estadoActivo: {
    color: '#D31A24',
    fontWeight: 'bold',
    fontSize: 14,
  },
  divisor: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 17,
    borderRadius: 14,
    gap: 13,
  },
  versionTitulo: {
    color: '#121212',
    fontSize: 15,
    fontWeight: 'bold',
  },
  versionTexto: {
    color: '#888888',
    fontSize: 12,
    marginTop: 3,
  },
  botonLogout: {
    backgroundColor: '#D31A24',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  pie: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 25,
  },
});
