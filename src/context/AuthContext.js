import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const perfil = await authService.obtenerPerfilActual(firebaseUser);

        setUser(perfil);
        setSession({ uid: firebaseUser.uid });
      } catch (error) {
        console.error('Error al recuperar el perfil:', error.message);
        await auth.signOut().catch(() => { });
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    setUser(data.user);
    setSession(data.session);

    return data.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};