import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../config/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function verificarToken(idToken) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || result.message || 'No se pudo verificar el perfil.'
    );
  }

  return result.data;
}

export const authService = {
  async login(email, password) {
    let credencial;

    try {
      credencial = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const idToken = await credencial.user.getIdToken();
      const perfil = await verificarToken(idToken);

      return {
        user: {
          ...perfil,
          uid: credencial.user.uid,
          email: credencial.user.email,
          rol: String(perfil.rol || '').toLowerCase().trim(),
        },
        session: {
          uid: credencial.user.uid,
        },
      };
    } catch (error) {
      if (credencial) {
        await signOut(auth).catch(() => { });
      }

      if (error.code === 'auth/invalid-credential') {
        throw new Error('Correo o contraseña incorrectos.');
      }

      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con ese correo.');
      }

      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Probá más tarde.');
      }

      throw error;
    }
  },

  async obtenerPerfilActual(firebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    const perfil = await verificarToken(idToken);

    return {
      ...perfil,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      rol: String(perfil.rol || '').toLowerCase().trim(),
    };
  },

  async logout() {
    await signOut(auth);
  },
};