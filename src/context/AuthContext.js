import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});
const STORAGE_KEY = '@titos_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial al abrir la aplicación
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const { session: savedSession, user: savedUser } = JSON.parse(storedData);
          setSession(savedSession);
          setUser(savedUser);
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
    
    // Guardamos la sesión devuelta por Express
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

export const useAuth = () => useContext(AuthContext);