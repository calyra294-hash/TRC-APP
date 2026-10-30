
import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useReservas } from '../../../hooks/useReservas';
import { getQRAlquiler } from '../../../services/reservas.service';

export default function ReservasScreen() {
  const { reservas, loading, error, refrescar } = useReservas();

  const [qrToken, setQrToken] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrVersion, setQrVersion] = useState(0);

  const reserva = reservas?.[0];

  const estado = String(
    reserva?.estado_aprobacion || 'pendiente'
  ).toLowerCase().trim();

  const esAprobada = [
    'aprobada',
    'aprobado',
    'aceptada',
    'aceptado',
    'confirmada',
    'confirmado',
  ].includes(estado);

  const idAlquiler = reserva?.id_alquiler;

  // Actualizar reservas cada vez que se abre esta pantalla.
  useFocusEffect(
    useCallback(() => {
      refrescar();
      setQrVersion(version => version + 1);
    }, [refrescar])
  );

  // Solicitar un QR seguro al backend cuando exista un alquiler aprobado.
  useEffect(() => {
    let activo = true;

    setQrToken(null);
    setQrError('');

    if (!esAprobada || !idAlquiler) {
      setQrLoading(false);
      return () => {
        activo = false;
      };
    }

    const cargarQR = async () => {
      try {
        setQrLoading(true);

        const resultado = await getQRAlquiler(idAlquiler);

        if (activo) {
          setQrToken(resultado?.token || null);

          if (!resultado?.token) {
            setQrError('El servidor no devolvió un código QR.');
          }
        }
      } catch (err) {
        if (activo) {
          setQrError(err.message || 'No se pudo generar el código QR.');
        }
      } finally {
        if (activo) {
          setQrLoading(false);
        }
      }
    };

    cargarQR();

    return () => {
      activo = false;
    };
  }, [idAlquiler, esAprobada, qrVersion]);

  const actualizarQR = () => {
    setQrToken(null);
    setQrError('');
    setQrVersion(version => version + 1);
  };

  const actualizarReserva = async () => {
    await refrescar();
    actualizarQR();
  };

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

  const idReserva = reserva.id ?? reserva.id_reserva ?? 'Sin código';

  const obtenerEstado = () => {
    if (
      [
        'aprobada',
        'aprobado',
        'aceptada',
        'aceptado',
        'activo',
        'activa',
        'confirmada',
        'confirmado',
      ].includes(estado)
    ) {
      return {
        titulo: 'Reserva Confirmada',
        subtitulo: 'Activa · Vigente',
        color: '#2E7D32',
        fondo: '#E8F5E9',
        icono: 'checkmark',
      };
    }

    if (['rechazada', 'rechazado'].includes(estado)) {
      return {
        titulo: 'Reserva Rechazada',
        subtitulo: 'No disponible',
        color: '#C62828',
        fondo: '#FFEBEE',
        icono: 'close',
      };
    }

    if (['cancelada', 'cancelado'].includes(estado)) {
      return {
        titulo: 'Reserva Cancelada',
        subtitulo: 'No disponible',
        color: '#757575',
        fondo: '#EEEEEE',
        icono: 'close',
      };
    }

    if (['completada', 'completado'].includes(estado)) {
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
    if (!fecha) return 'Sin fecha';

    const fechaReal = new Date(`${fecha}T00:00:00`);

    if (isNaN(fechaReal.getTime())) return 'Sin fecha';

    return fechaReal.toLocaleDateString('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const vehiculo = reserva.coche || {};

  const nombreVehiculo =
    `${vehiculo.marca || 'Vehículo'} ${vehiculo.modelo || ''}`.trim();

  const precio = Number(
    vehiculo.precio ?? vehiculo.valor_dia ?? 0
  );

  const imagenVehiculo =
    vehiculo.imagen || vehiculo.url_imagen || null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mi Reserva</Text>
          <Text style={styles.subtitle}>
            Detalles de tu reserva
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusCircle,
                  { backgroundColor: estadoVisual.color },
                ]}
              >
                <Ionicons
                  name={estadoVisual.icono}
                  size={17}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {estadoVisual.titulo}
                </Text>
                <Text
                  style={[
                    styles.statusSubtitle,
                    { color: estadoVisual.color },
                  ]}
                >
                  {estadoVisual.subtitulo}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.idBadge,
                { backgroundColor: estadoVisual.fondo },
              ]}
            >
              <Text
                style={[
                  styles.idBadgeText,
                  { color: estadoVisual.color },
                ]}
              >
                {estadoVisual.titulo.replace('Reserva ', '')}
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
              <Text style={styles.timeValue}>Fecha de inicio</Text>
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
              CÓDIGO QR DE ENTREGA
            </Text>

            {!esAprobada ? (
              <View style={styles.qrMessage}>
                <Ionicons
                  name="time-outline"
                  size={35}
                  color="#EF6C00"
                />
                <Text style={styles.qrMessageTitle}>
                  QR pendiente
                </Text>
                <Text style={styles.qrMessageText}>
                  El código estará disponible cuando el administrador
                  apruebe tu reserva.
                </Text>
              </View>
            ) : !idAlquiler ? (
              <View style={styles.qrMessage}>
                <Ionicons
                  name="information-circle-outline"
                  size={35}
                  color="#D62828"
                />
                <Text style={styles.qrMessageTitle}>
                  Alquiler pendiente de registro
                </Text>
                <Text style={styles.qrMessageText}>
                  Tu reserva está aprobada, pero todavía no tiene un
                  alquiler asociado.
                </Text>
              </View>
            ) : qrLoading ? (
              <View style={styles.qrMessage}>
                <ActivityIndicator size="large" color="#D62828" />
                <Text style={styles.qrMessageText}>
                  Generando tu código QR...
                </Text>
              </View>
            ) : qrToken ? (
              <>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrToken}
                    size={160}
                    backgroundColor="#FFFFFF"
                    color="#111111"
                  />
                </View>

                <Text style={styles.qrText}>
                  Reserva #{idReserva}
                </Text>

                <Text style={styles.qrHint}>
                  Presenta este código al administrador para registrar
                  la entrega del vehículo.
                </Text>
              </>
            ) : (
              <View style={styles.qrMessage}>
                <Ionicons
                  name="alert-circle-outline"
                  size={35}
                  color="#D62828"
                />
                <Text style={styles.qrMessageTitle}>
                  No se pudo generar el QR
                </Text>
                <Text style={styles.qrMessageText}>
                  {qrError || 'Intenta generar el código nuevamente.'}
                </Text>

                <TouchableOpacity
                  style={styles.qrRetryButton}
                  onPress={actualizarQR}
                >
                  <Text style={styles.qrRetryText}>
                    Generar nuevamente
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={actualizarReserva}
            >
              <Text style={styles.outlineButtonText}>
                Actualizar reserva
              </Text>
            </TouchableOpacity>

            {esAprobada && idAlquiler && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={actualizarQR}
                disabled={qrLoading}
              >
                <Text style={styles.primaryButtonText}>
                  Renovar QR
                </Text>
              </TouchableOpacity>
            )}
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
    shadowOffset: { width: 0, height: 3 },
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
    marginRight: 8,
  },
  statusCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusInfo: {
    flex: 1,
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
  qrContainer: {
    width: 190,
    height: 190,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  qrMessage: {
    width: '100%',
    minHeight: 140,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  qrMessageTitle: {
    marginTop: 9,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  qrMessageText: {
    marginTop: 7,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
  },
  qrText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  qrHint: {
    marginTop: 5,
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    lineHeight: 17,
  },
  qrRetryButton: {
    marginTop: 12,
    backgroundColor: '#D62828',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  qrRetryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
});
