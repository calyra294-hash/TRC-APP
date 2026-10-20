import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useAuth } from "../context/AuthContext"; 

export default function OtraScreenCliente() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <Text style={styles.subtitulo}>
          Bienvenido, {user?.email || "Cliente"}
        </Text>
        <Text style={styles.infoText}>
          Área de usuario para gestionar reservas y alquileres.
        </Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});