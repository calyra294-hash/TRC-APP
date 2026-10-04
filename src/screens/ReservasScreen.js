import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReservas } from '../hooks/useReservas';

export default function ReservasScreen() {
  const { reservas, loading, error, refrescar } = useReservas();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D62828" />
        <Text style={styles.loadingText}>Cargando tu reserva...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={50} color="#D62828" />

        <Text style={styles.errorTitle}>
          No se pudieron cargar las reservas
        </Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={refrescar}>
          <Text style={styles.retryText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reservas || reservas.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={60} color="#999" />

        <Text style={styles.emptyTitle}>No tienes reservas</Text>

        <Text style={styles.emptyText}>
          Cuando realices una reserva, aparecerá aquí.
        </Text>
      </View>
    );
  }

  const reserva = reservas[0];

  const estado = reserva.estado_aprobacion || 'pendiente';

  const obtenerEstado = () => {
    const estadoNormalizado = String(estado).toLowerCase();

    if (
      estadoNormalizado.includes('acept') ||
      estadoNormalizado.includes('confirm')
    ) {
      return {
        titulo: 'Reserva Confirmada',
        subtitulo: 'Activa · Vigente',
        color: '#2E7D32',
        fondo: '#E8F5E9',
        icono: 'checkmark',
      };
    }

    if (estadoNormalizado.includes('rechaz')) {
      return {
        titulo: 'Reserva Rechazada',
        subtitulo: 'No disponible',
        color: '#C62828',
        fondo: '#FFEBEE',
        icono: 'close',
      };
    }

    if (estadoNormalizado.includes('cancel')) {
      return {
        titulo: 'Reserva Cancelada',
        subtitulo: 'No disponible',
        color: '#757575',
        fondo: '#EEEEEE',
        icono: 'close',
      };
    }

    if (estadoNormalizado.includes('complet')) {
      return {
        titulo: 'Reserva Completada',
        subtitulo: 'Finalizada',
        color: '#1565C0',
        fondo: '#E3F2FD',
        icono: 'checkmark',
      };
    }

    return {
      titulo: 'Reserva Pendiente',
      subtitulo: 'En espera de aprobación',
      color: '#EF6C00',
      fondo: '#FFF3E0',
      icono: 'time',
    };
  };

  const estadoVisual = obtenerEstado();

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaReal = new Date(`${fecha}T00:00:00`);

    if (isNaN(fechaReal.getTime())) {
      return 'Sin fecha';
    }

    return fechaReal.toLocaleDateString('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const vehiculo = reserva.coche || {};

  const nombreVehiculo =
    `${vehiculo.marca || 'Vehículo'} ${vehiculo.modelo || ''}`.trim();

  const precio = Number(vehiculo.valor_dia || 0);

  const imagenVehiculo = vehiculo.url_imagen || null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mi Reserva</Text>

          <Text style={styles.subtitle}>
            Detalles de tu reserva activa
          </Text>
        </View>

        <View style={styles.card}>

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusCircle,
                  {
                    backgroundColor: estadoVisual.color,
                  },
                ]}
              >
                <Ionicons
                  name={estadoVisual.icono}
                  size={17}
                  color="#FFFFFF"
                />
              </View>

              <View>
                <Text style={styles.statusTitle}>
                  {estadoVisual.titulo}
                </Text>

                <Text
                  style={[
                    styles.statusSubtitle,
                    {
                      color: estadoVisual.color,
                    },
                  ]}
                >
                  {estadoVisual.subtitulo}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.idBadge,
                {
                  backgroundColor: estadoVisual.fondo,
                },
              ]}
            >
              <Text
                style={[
                  styles.idBadgeText,
                  {
                    color: estadoVisual.color,
                  },
                ]}
              >
                #{String(reserva.id_reserva)}
              </Text>
            </View>
          </View>

          <View style={styles.vehicleCard}>
            <View style={styles.vehicleImage}>
              {imagenVehiculo ? (
                <Image
                  source={{ uri: imagenVehiculo }}
                  style={styles.vehicleImageReal}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="car-sport-outline"
                  size={38}
                  color="#999"
                />
              )}
            </View>

            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {nombreVehiculo}
              </Text>

              <Text style={styles.vehicleDetails}>
                {vehiculo.placa
                  ? `Placa: ${vehiculo.placa}`
                  : 'Vehículo reservado'}
              </Text>

              <Text style={styles.vehiclePrice}>
                ${precio.toFixed(2)}/día
              </Text>
            </View>
          </View>

          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>RECOGIDA</Text>

              <Text style={styles.dateValue}>
                {formatearFecha(reserva.fecha_inicio)}
              </Text>

              <Text style={styles.timeValue}>
                Fecha de inicio
              </Text>
            </View>

            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>DEVOLUCIÓN</Text>

              <Text style={styles.dateValue}>
                {formatearFecha(reserva.fecha_fin)}
              </Text>

              <Text style={styles.timeValue}>
                Fecha de devolución
              </Text>
            </View>
          </View>

          <View style={styles.totalBlock}>
            <View>
              <Text style={styles.sectionLabel}>
                TOTAL DE LA RESERVA
              </Text>

              <Text style={styles.totalText}>
                ${Number(reserva.monto_total || 0).toFixed(2)}
              </Text>
            </View>

            <Ionicons
              name="receipt-outline"
              size={30}
              color="#D62828"
            />
          </View>

          <View style={styles.locationBlock}>
            <Text style={styles.sectionLabel}>
              LUGAR DE RECOGIDA
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={22}
                color="#D62828"
              />

              <View style={styles.locationTextContainer}>
                <Text style={styles.locationTitle}>
                  Juigalpa, Chontales, Nicaragua
                </Text>

                <Text style={styles.locationSubtitle}>
                  Oficina principal Tito's Rent a Car
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.qrBlock}>
            <Text style={styles.sectionLabel}>
              CÓDIGO DE IDENTIFICACIÓN
            </Text>

            <View style={styles.qrPlaceholder}>
              <Ionicons
                name="qr-code-outline"
                size={90}
                color="#333"
              />
            </View>

            <Text style={styles.qrText}>
              {String(reserva.id_reserva)}
            </Text>

            <Text style={styles.qrHint}>
              Código de reserva
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>
                Ver detalles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                Reg. entrega
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#F5F5F5',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  errorText: {
    marginTop: 8,
    color: '#777',
    textAlign: 'center',
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#D62828',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#777',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3D1D1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  statusCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  statusSubtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },

  idBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  idBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },

  vehicleImage: {
    width: 82,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },

  vehicleImageReal: {
    width: 82,
    height: 65,
    borderRadius: 10,
  },

  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  vehicleDetails: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },

  vehiclePrice: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
    color: '#D62828',
  },

  datesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  dateBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    marginBottom: 7,
  },

  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    textTransform: 'capitalize',
  },

  timeValue: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },

  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3D1D1',
  },

  totalText: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: '800',
    color: '#D62828',
  },

  locationBlock: {
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 9,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  locationSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#777',
  },

  qrBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },

  qrPlaceholder: {
    width: 130,
    height: 130,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  qrText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  qrHint: {
    marginTop: 3,
    fontSize: 11,
    color: '#999',
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D62828',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },

  outlineButtonText: {
    color: '#D62828',
    fontSize: 13,
    fontWeight: '700',
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#D62828',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});