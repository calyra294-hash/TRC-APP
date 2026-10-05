import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { styles } from './PerfilScreen.styles';

export default function PerfilScreen({ navigation }) {
  const { user, loading, logout } = useAuth();

  // Cargando usuario
  if (loading) {
    return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#D71920" />
      <Text style={styles.loadingText}>Cargando perfil...</Text>
    </View>
    );
  }

  // No hay usuario
  if (!user) {
    return (
    <View style={styles.loadingContainer}>
      <Ionicons name="person-circle-outline" size={55} color="#D71920" />

      <Text style={styles.loadingText}>
        No se encontró información del usuario.
      </Text>
    </View>
    );
  }

  // ─────────────────────────────────────
  // DATOS DEL USUARIO
  // ─────────────────────────────────────

  const nombreCompleto = [
    user.nombre1,
    user.nombre2,
    user.apellido1,
    user.apellido2,
  ]
    .filter(Boolean)
    .join(' ');

  const iniciales = [
    user.nombre1?.charAt(0),
    user.apellido1?.charAt(0),
  ]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  const rol = user.rol || 'Usuario';

  const estado = user.estado_aprobacion || 'sin estado';

  const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);

  // ─────────────────────────────────────
  // CERRAR SESIÓN
  // ─────────────────────────────────────

  const confirmarCerrarSesion = () => {
    Alert.alert(
    'Cerrar sesión',
    '¿Estás seguro de que deseas cerrar tu sesión?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: cerrarSesion,
      },
    ]
    );
  };

  const cerrarSesion = async () => {
    try {
    await logout();
    } catch (error) {
    Alert.alert('Error', 'No fue posible cerrar la sesión correctamente.');
    }
  };

  // ─────────────────────────────────────
  // NAVEGACIÓN
  // ─────────────────────────────────────

  const irAReservas = () => {
    navigation.navigate('Reservas');
  };

  const irAAlquileres = () => {
    navigation.navigate('Alquileres');
  };

  return (
    <View style={styles.container}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>

        <View style={styles.avatarContainer}>
          {user.url_avatar ? (
            <Image source={{ uri: user.url_avatar }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>{iniciales || 'U'}</Text>
          )}
        </View>

        <Text style={styles.nombre}>{nombreCompleto || 'Usuario'}</Text>

        <Text style={styles.rol}>{rol}</Text>

        <View style={styles.estado}>
          <View
            style={[
              styles.estadoDot,
              estado === 'aprobado' ? styles.estadoAprobado : styles.estadoPendiente,
            ]}
          />

          <Text style={styles.estadoText}>{estadoTexto}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información personal</Text>

        <InfoRow icon="mail-outline" label="Correo electrónico" value={user.email} />
        <InfoRow icon="call-outline" label="Teléfono" value={user.telefono} />
        <InfoRow icon="location-outline" label="Dirección" value={user.direccion} />
        <InfoRow
          icon="calendar-outline"
          label="Fecha de nacimiento"
          value={user.fecha_nacimiento}
          last
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Documentación</Text>

        <InfoRow icon="card-outline" label="Cédula" value={user.cedula} />
        <InfoRow icon="car-outline" label="Licencia" value={user.licencia} />
        <InfoRow
          icon="document-text-outline"
          label="Tipo de licencia"
          value={user.tipo_licencia}
          last
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mi cuenta</Text>

        <OptionRow icon="calendar-outline" text="Mis reservas" onPress={irAReservas} />
        <OptionRow
          icon="time-outline"
          text="Historial de alquileres"
          onPress={irAAlquileres}
        />
        <OptionRow icon="call-outline" text="Métodos de contacto" />
        <OptionRow icon="notifications-outline" text="Notificaciones" />
        <OptionRow icon="settings-outline" text="Configuración" last />
      </View>

      <Pressable style={styles.logoutButton} onPress={confirmarCerrarSesion}>
        <View style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={20} color="#D71920" />
        </View>

        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={styles.footerText}>Tito's Rent a Car</Text>
    </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════
   COMPONENTE INFORMACIÓN
═══════════════════════════════════════ */

function InfoRow({ icon, label, value, last = false }) {
  const tieneDato =
    value !== null && value !== undefined && String(value).trim() !== '';

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={17} color="#D71920" />
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text
        style={[styles.infoValue, !tieneDato && styles.emptyValue]}
        numberOfLines={2}
      >
        {tieneDato ? value : 'No registrado'}
      </Text>
    </View>
    </View>
  );
}

/* ═══════════════════════════════════════
   COMPONENTE OPCIONES
═══════════════════════════════════════ */

function OptionRow({ icon, text, onPress, last = false }) {
  return (
    <Pressable style={[styles.optionRow, last && styles.optionRowLast]} onPress={onPress}>
    <View style={styles.optionIcon}>
      <Ionicons name={icon} size={17} color="#D71920" />
    </View>

    <Text style={styles.optionText}>{text}</Text>

    <Ionicons name="chevron-forward-outline" size={16} color="#A5A5A5" />
    </Pressable>
  );
}