const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const saludService = {
  async verificarConexionLocal() {
    // Si estamos en producción, no hace nada
    if (!__DEV__) return;

    try {
      console.log("🛠️ [DEV MODE] Verificando conexión con el backend...");
      const response = await fetch(`${API_URL}/salud`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ [DEV MODE] Backend conectado:", data.message);
        return true;
      } else {
        console.warn("⚠️ [DEV MODE] El backend respondió con un status no exitoso:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ [DEV MODE] Error de red: No se pudo contactar al backend local en:", API_URL);
      console.error("Detalle del error:", error.message);
      return false;
    }
  }
};