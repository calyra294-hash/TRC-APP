import React, { useState } from 'react';

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

import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

import { styles } from './PerfilScreen.styles';

export default function PerfilScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={55}
          color={theme.primary}
        />

        <Text style={[styles.loadingText, { color: theme.text }]}>
          No se encontró información del usuario.
        </Text>
      </View>
    );
  }

  // DATOS DEL USUARIO

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

  const estadoTexto =
    estado.charAt(0).toUpperCase() + estado.slice(1);

  // CERRAR SESIÓN

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
          onPress: ejecutarCierreSesion,
        },
      ]
    );
  };

  const ejecutarCierreSesion = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'No fue posible cerrar la sesión correctamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // NAVEGACIÓN

  const irAReservas = () => {
    navigation.navigate('Reservas');
  };

  const irAAlquileres = () => {
    navigation.navigate('Alquileres');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ENCABEZADO */}

        <View
          style={[
            styles.header,
            { backgroundColor: '#D71920' },
          ]}
        >
          <Text style={styles.headerTitle}>
            Mi Perfil
          </Text>

          <View style={styles.avatarContainer}>
            {user.url_avatar ? (
              <Image
                source={{ uri: user.url_avatar }}
                style={styles.avatar}
              />
            ) : (
              <Text style={styles.avatarText}>
                {iniciales || 'U'}
              </Text>
            )}
          </View>

          <Text style={styles.nombre}>
            {nombreCompleto || 'Usuario'}
          </Text>

          <Text style={styles.rol}>
            {rol}
          </Text>

          <View style={styles.estado}>
            <View
              style={[
                styles.estadoDot,
                estado === 'aprobado'
                  ? styles.estadoAprobado
                  : styles.estadoPendiente,
              ]}
            />

            <Text style={styles.estadoText}>
              {estadoTexto}
            </Text>
          </View>
        </View>

        {/* INFORMACIÓN PERSONAL */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Información personal
          </Text>

          <InfoRow
            icon="mail-outline"
            label="Correo electrónico"
            value={user.email}
            theme={theme}
          />

          <InfoRow
            icon="call-outline"
            label="Teléfono"
            value={user.telefono}
            theme={theme}
          />

          <InfoRow
            icon="location-outline"
            label="Dirección"
            value={user.direccion}
            theme={theme}
          />

          <InfoRow
            icon="calendar-outline"
            label="Fecha de nacimiento"
            value={user.fecha_nacimiento}
            last
            theme={theme}
          />
        </View>

        {/* DOCUMENTACIÓN */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Documentación
          </Text>

          <InfoRow
            icon="card-outline"
            label="Cédula"
            value={user.cedula}
            theme={theme}
          />

          <InfoRow
            icon="car-outline"
            label="Licencia"
            value={user.licencia}
            theme={theme}
          />

          <InfoRow
            icon="document-text-outline"
            label="Tipo de licencia"
            value={user.tipo_licencia}
            last
            theme={theme}
          />
        </View>

        {/* MI CUENTA */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Mi cuenta
          </Text>

          <OptionRow
            icon="calendar-outline"
            text="Mis reservas"
            onPress={irAReservas}
            theme={theme}
          />

          <OptionRow
            icon="time-outline"
            text="Historial de alquileres"
            onPress={irAAlquileres}
            theme={theme}
          />

          <OptionRow
            icon="call-outline"
            text="Métodos de contacto"
            theme={theme}
          />

          <OptionRow
            icon="notifications-outline"
            text="Notificaciones"
            theme={theme}
          />

          {/* CAMBIAR TEMA */}

          <Pressable
            style={[
              styles.optionRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.optionIcon}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny-outline'}
                size={19}
                color={theme.primary}
              />
            </View>

            <Text
              style={[
                styles.optionText,
                { color: theme.text },
              ]}
            >
              Modo oscuro
            </Text>

            <View
              style={{
                backgroundColor: isDark ? '#333333' : '#F3F4F6',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 15,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {isDark ? 'Activado' : 'Desactivado'}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={theme.secondaryText}
            />
          </Pressable>

          <OptionRow
            icon="settings-outline"
            text="Configuración"
            last
            theme={theme}
          />
        </View>

        {/* CERRAR SESIÓN */}

        <Pressable
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            loading && styles.disabledButton,
          ]}
          onPress={confirmarCerrarSesion}
          disabled={loading}
        >
          <View style={styles.logoutIcon}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={theme.primary}
              />
            ) : (
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.primary}
              />
            )}
          </View>

          <Text
            style={[
              styles.logoutText,
              { color: theme.primary },
            ]}
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Text>
        </Pressable>

        <Text
          style={[
            styles.footerText,
            { color: theme.secondaryText },
          ]}
        >
          Tito's Rent a Car
        </Text>
      </ScrollView>
    </View>
  );
}

// COMPONENTE INFORMACIÓN

function InfoRow({ icon, label, value, last = false, theme }) {
  const tieneDato =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== '';

  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
        { borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={17}
          color={theme.primary}
        />
      </View>

      <View style={styles.infoContent}>
        <Text
          style={[
            styles.infoLabel,
            { color: theme.secondaryText },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.infoValue,
            { color: theme.text },
            !tieneDato && styles.emptyValue,
          ]}
          numberOfLines={2}
        >
          {tieneDato ? value : 'No registrado'}
        </Text>
      </View>
    </View>
  );
}

// COMPONENTE OPCIONES

function OptionRow({
  icon,
  text,
  onPress,
  last = false,
  theme,
}) {
  return (
    <Pressable
      style={[
        styles.optionRow,
        last && styles.optionRowLast,
        { borderBottomColor: theme.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={theme.primary}
        />
      </View>

      <Text
        style={[
          styles.optionText,
          { color: theme.text },
        ]}
      >
        {text}
      </Text>

      <Ionicons
        name="chevron-forward-outline"
        size={16}
        color={theme.secondaryText}
      />
    </Pressable>
  );
}