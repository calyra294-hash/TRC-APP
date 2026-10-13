import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);
const STORAGE_KEY = '@titos_user_session';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

// 3. Declaramos el Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const { session: savedSession, user: savedUser } = JSON.parse(storedData);
          setSession(savedSession);

          const userId = savedUser.id_usuario || savedUser.id;

          if (userId) {
            try {
              const perfilFresco = await authService.obtenerPerfil(userId);
              const usuarioSincronizado = {
                ...savedUser,
                estado_aprobacion: perfilFresco.estado_aprobacion,
              };
              setUser(usuarioSincronizado);
            } catch (err) {
              console.warn('No se pudo sincronizar el perfil fresco, usando caché local:', err.message);
              setUser(savedUser);
            }
          } else {
            setUser(savedUser);
          }
        }
      } catch (error) {
        console.error('Error al restaurar sesión desde AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setSession(data.session);
    setUser(data.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = async () => {
    await authService.logout();
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};