import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovalScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('estado'); // 'estado' | 'perfil'

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera Corporativa */}
      <View style={styles.headerContainer}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>TITO'S</Text>
          <Text style={styles.brandSubtitle}>RENT A CAR</Text>
        </View>

        {/* Indicador de Estado en Header */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>En Revisión</Text>
        </View>
      </View>

      {/* Navegación Interna Simplificada (Solo Estado y Perfil) */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'estado' && styles.tabButtonActive]}
          onPress={() => setActiveTab('estado')}
        >
          <Ionicons 
            name={activeTab === 'estado' ? "time" : "time-outline"} 
            size={20} 
            color={activeTab === 'estado' ? "#E53935" : "#9CA3AF"} 
          />
          <Text style={[styles.tabText, activeTab === 'estado' && styles.tabTextActive]}>
            Solicitud
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'perfil' && styles.tabButtonActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <Ionicons 
            name={activeTab === 'perfil' ? "person" : "person-outline"} 
            size={20} 
            color={activeTab === 'perfil' ? "#E53935" : "#9CA3AF"} 
          />
          <Text style={[styles.tabText, activeTab === 'perfil' && styles.tabTextActive]}>
            Mi Perfil
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'estado' ? (
          /* TAB 1: ESTADO DE APROBACIÓN */
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={54} color="#F59E0B" />
            </View>

            <Text style={styles.cardTitle}>Cuenta en Revisión</Text>
            <Text style={styles.cardSubtitle}>
              Hola <Text style={styles.highlightText}>{user?.nombre || user?.email}</Text>, tu registro ha sido recibido correctamente.
            </Text>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                Un administrador está verificando tus datos e identificación. Una vez aprobada, tendrás acceso completo a nuestro catálogo de vehículos y reservas.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.stepText}>Registro enviado</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.stepItem}>
                <Ionicons name="ellipse" size={20} color="#F59E0B" />
                <Text style={styles.stepText}>Verificación de documentos</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.stepItem}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <Text style={[styles.stepText, { color: '#6B7280' }]}>Acceso al catálogo</Text>
              </View>
            </View>
          </View>
        ) : (
          /* TAB 2: VISTA DE PERFIL LIMITADA */
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle-outline" size={80} color="#E53935" />
            </View>

            <Text style={styles.cardTitle}>{user?.nombre || 'Usuario'}</Text>
            <Text style={styles.cardSubtitle}>{user?.email}</Text>

            <View style={styles.profileDetailsGroup}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estado de cuenta</Text>
                <Text style={styles.detailValueWarning}>Pendiente de Aprobación</Text>
              </View>

              {user?.telefono ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Teléfono</Text>
                  <Text style={styles.detailValue}>{user.telefono}</Text>
                </View>
              ) : null}

              {user?.cedula ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Identificación</Text>
                  <Text style={styles.detailValue}>{user.cedula}</Text>
                </View>
              ) : null}
            </View>

            {/* Cierre de Sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8B1E1E',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#8B1E1E',
  },
  brandContainer: {
    alignItems: 'flex-start',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 3,
    fontSize: 16,
  },
  brandSubtitle: {
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  statusBadgeText: {
    color: '#FBFBFB',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#121824',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#1C2533',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#121824',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  highlightText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoText: {
    color: '#93C5FD',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  stepContainer: {
    width: '100%',
    backgroundColor: '#1C2533',
    borderRadius: 16,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  stepDivider: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 9,
    marginVertical: 4,
  },
  profileDetailsGroup: {
    width: '100%',
    backgroundColor: '#1C2533',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailValueWarning: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});