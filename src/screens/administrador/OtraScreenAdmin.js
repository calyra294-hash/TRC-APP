import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function OtraScreenAdmin({ navigation }) {
  const { user, logout } = useAuth();

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas salir de tu cuenta de administrador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Reseteamos la navegación al Login limpiando el Stack principal
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              Alert.alert("Error", "No se pudo cerrar la sesión.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Panel de Administración</Text>
        <Text style={styles.subtitulo}>
          Administrador: {user?.email || "Admin"}
        </Text>

        <TouchableOpacity
          style={styles.botonLogout}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBoton}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
  },
  botonLogout: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});