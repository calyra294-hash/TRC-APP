import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './LoginScreen.styles';

import { useAuth } from '../../context/AuthContext';

import logoTitos from '../../../assets/logo_titos.png';
import RegistrarUsuarioScreen from '../../components/usuarios/RegistrarUsuario'; 

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas de cliente
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      // Invocamos la acción del AuthContext (que llama a authService y guarda en AsyncStorage)
      await login(email.trim(), password);
      // ¡Listo! Al actualizarse el contexto global, la app cambiará automáticamente de pantalla/estado.
    } catch (error) {
      console.error('Error en handleLogin:', error);
      Alert.alert(
        'Error de Autenticación',
        error.message || 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }  };

  const handleNavigateToRegister = () => {
    setMostrarRegistro(true);
  };

  if (mostrarRegistro) {
    return (
      <RegistrarUsuarioScreen
        onBack={() => setMostrarRegistro(false)}
        onSuccess={() => setMostrarRegistro(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.card}>
          {/* Logo Tito's centrado */}
          <View style={styles.logoContainer}>
            <Image
              source={logoTitos}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Encabezado */}
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Bienvenido a Tito's Rent a Car</Text>

          {/* Campo Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo"
              placeholderTextColor="#9EA5B1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9EA5B1"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6C757D"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Principal */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Enlace para Registrarse */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={handleNavigateToRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}