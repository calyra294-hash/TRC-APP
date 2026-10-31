
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
    reserva?.estado_aprobacion ||
    reserva?.estado ||
    'pendiente'
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

  const estadoAlquiler = String(
    reserva?.estado_alquiler || reserva?.estado || ''
  ).toLowerCase().trim();

  const esAlquilerActivo = [
    'activo',
    'activa',
  ].includes(estadoAlquiler);

  const puedeObtenerQR = esAprobada || esAlquilerActivo;

  useFocusEffect(
    useCallback(() => {
      refrescar();
      setQrVersion(version => version + 1);
    }, [refrescar])
  );

  useEffect(() => {
    let activo = true;

    setQrToken(null);
    setQrError('');

    if (!puedeObtenerQR || !idAlquiler) {
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
          setQrError(
            err.message || 'No se pudo generar el código QR.'
          );
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
  }, [idAlquiler, puedeObtenerQR, qrVersion]);

  const actualizarQR = () => {
    setQrToken(null);
    setQrError('');
    setQrVersion(version => version + 1);
  };

  const actualizarReserva = async () => {
    await refrescar();
    actualizarQR();
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    let fechaReal;

    if (fecha._seconds) {
      fechaReal = new Date(fecha._seconds * 1000);
    } else if (fecha.seconds) {
      fechaReal = new Date(fecha.seconds * 1000);
    } else {
      const texto = String(fecha);

      fechaReal = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
          ? `${texto}T00:00:00`
          : texto
      );
    }

    if (isNaN(fechaReal.getTime())) return 'Sin fecha';

    return fechaReal.toLocaleDateString('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

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
        titulo: 'Reserva confirmada',
        subtitulo: 'Tu reserva ha sido aprobada',
        color: '#16834A',
        fondo: '#EAF7EF',
        icono: 'checkmark-circle',
      };
    }

    if (['rechazada', 'rechazado'].includes(estado)) {
      return {
        titulo: 'Reserva rechazada',
        subtitulo: 'La reserva no fue aprobada',
        color: '#D62828',
        fondo: '#FDECEC',
        icono: 'close-circle',
      };
    }

    if (['cancelada', 'cancelado'].includes(estado)) {
      return {
        titulo: 'Reserva cancelada',
        subtitulo: 'Esta reserva ya no está activa',
        color: '#777777',
        fondo: '#F0F0F0',
        icono: 'remove-circle',
      };
    }

    if (['completada', 'completado'].includes(estado)) {
      return {
        titulo: 'Reserva completada',
        subtitulo: 'El proceso ha finalizado',
        color: '#526477',
        fondo: '#EEF2F6',
        icono: 'checkmark-done-circle',
      };
    }

    return {
      titulo: 'Reserva pendiente',
      subtitulo: 'Esperando aprobación del administrador',
      color: '#D97706',
      fondo: '#FFF4E5',
      icono: 'time',
    };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D31A24" />
        <Text style={styles.loadingText}>
          Cargando tu reserva...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#D31A24"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No se pudieron cargar las reservas
        </Text>

        <Text style={styles.emptyText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={refrescar}
        >
          <Ionicons
            name="refresh-outline"
            size={17}
            color="#FFFFFF"
          />
          <Text style={styles.retryText}>
            Intentar nuevamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reservas || reservas.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color="#D31A24"
          />
        </View>

        <Text style={styles.emptyTitle}>
          Todavía no tienes reservas
        </Text>

        <Text style={styles.emptyText}>
          Cuando reserves uno de nuestros vehículos, podrás consultar aquí
          todos los detalles de tu reserva.
        </Text>
      </View>
    );
  }

  const idReserva = reserva.id ?? reserva.id_reserva ?? 'Sin código';
  const estadoVisual = obtenerEstado();
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
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              TITO'S RENT A CAR
            </Text>

            <Text style={styles.title}>Mi reserva</Text>

            <Text style={styles.subtitle}>
              Consulta el estado y los detalles de tu reservación.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar-outline"
              size={25}
              color="#D31A24"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: estadoVisual.fondo },
                ]}
              >
                <Ionicons
                  name={estadoVisual.icono}
                  size={23}
                  color={estadoVisual.color}
                />
              </View>

              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {estadoVisual.titulo}
                </Text>

                <Text style={styles.statusSubtitle}>
                  {estadoVisual.subtitulo}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: estadoVisual.fondo },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: estadoVisual.color },
                ]}
              >
                {estadoVisual.titulo.replace('Reserva ', '')}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.sectionHeading}>
            <Ionicons
              name="car-sport-outline"
              size={19}
              color="#D31A24"
            />
            <Text style={styles.sectionTitle}>
              Vehículo reservado
            </Text>
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
                  size={42}
                  color="#B8B8B8"
                />
              )}
            </View>

            <View style={styles.vehicleInfo}>
              <Text
                style={styles.vehicleName}
                numberOfLines={2}
              >
                {nombreVehiculo}
              </Text>

              <View style={styles.plateRow}>
                <Ionicons
                  name="card-outline"
                  size={14}
                  color="#888888"
                />

                <Text style={styles.vehicleDetails}>
                  {vehiculo.placa || 'Vehículo reservado'}
                </Text>
              </View>

              <Text style={styles.vehiclePrice}>
                ${precio.toFixed(2)}
                <Text style={styles.perDay}> / día</Text>
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.sectionHeading}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color="#D31A24"
            />
            <Text style={styles.sectionTitle}>
              Periodo de alquiler
            </Text>
          </View>

          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <View style={styles.dateIcon}>
                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color="#D31A24"
                />
              </View>

              <Text style={styles.dateLabel}>RECOGIDA</Text>

              <Text style={styles.dateValue}>
                {formatearFecha(reserva.fecha_inicio)}
              </Text>

              <Text style={styles.dateDescription}>
                Inicio del alquiler
              </Text>
            </View>

            <View style={styles.dateBox}>
              <View style={styles.dateIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color="#D31A24"
                />
              </View>

              <Text style={styles.dateLabel}>DEVOLUCIÓN</Text>

              <Text style={styles.dateValue}>
                {formatearFecha(reserva.fecha_fin)}
              </Text>

              <Text style={styles.dateDescription}>
                Fin del alquiler
              </Text>
            </View>
          </View>

          <View style={styles.totalBlock}>
            <View>
              <Text style={styles.totalLabel}>
                TOTAL DE LA RESERVA
              </Text>

              <Text style={styles.totalText}>
                ${Number(reserva.monto_total || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.totalIcon}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color="#D31A24"
              />
            </View>
          </View>

          <View style={styles.locationBlock}>
            <View style={styles.sectionHeading}>
              <Ionicons
                name="location-outline"
                size={19}
                color="#D31A24"
              />

              <Text style={styles.sectionTitle}>
                Lugar de recogida
              </Text>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons
                  name="location"
                  size={21}
                  color="#FFFFFF"
                />
              </View>

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

          <View style={styles.separator} />

          <View style={styles.qrBlock}>
            <View style={styles.qrHeading}>
              <View style={styles.sectionHeading}>
                <Ionicons
                  name="qr-code-outline"
                  size={20}
                  color="#D31A24"
                />

                <Text style={styles.sectionTitle}>
                  Código QR de entrega y devolución
                </Text>
              </View>

              <Text style={styles.qrSmallLabel}>
                ACCESO DEL ALQUILER
              </Text>
            </View>

            {!puedeObtenerQR ? (
              <View style={styles.qrMessage}>
                <View style={styles.qrMessageIcon}>
                  <Ionicons
                    name="time-outline"
                    size={25}
                    color="#D97706"
                  />
                </View>

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
                <View style={styles.qrMessageIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={25}
                    color="#D31A24"
                  />
                </View>

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
                <ActivityIndicator
                  size="large"
                  color="#D31A24"
                />

                <Text style={styles.qrMessageText}>
                  Generando tu código QR...
                </Text>
              </View>
            ) : qrToken ? (
              <View style={styles.qrSuccess}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrToken}
                    size={175}
                    backgroundColor="#FFFFFF"
                    color="#111111"
                  />
                </View>

                <Text style={styles.qrText}>
                  Reserva #{idReserva}
                </Text>

                <Text style={styles.qrHint}>
                  Presenta este código al administrador para registrar
                  la entrega o devolución de tu vehículo.
                </Text>
              </View>
            ) : (
              <View style={styles.qrMessage}>
                <View style={styles.qrMessageIcon}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={25}
                    color="#D31A24"
                  />
                </View>

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
              <Ionicons
                name="refresh-outline"
                size={17}
                color="#D31A24"
              />

              <Text style={styles.outlineButtonText}>
                Actualizar
              </Text>
            </TouchableOpacity>

            {puedeObtenerQR && idAlquiler && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  qrLoading && styles.disabledButton,
                ]}
                onPress={actualizarQR}
                disabled={qrLoading}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={17}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryButtonText}>
                  Renovar QR
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.footerText}>
          Gracias por elegir Tito's Rent a Car.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#F5F6F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#D31A24',
    marginBottom: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#151515',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#777777',
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  statusIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#202020',
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#242424',
    marginLeft: 7,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 11,
  },
  vehicleImage: {
    width: 105,
    height: 78,
    borderRadius: 11,
    backgroundColor: '#EEEEEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  vehicleImageReal: {
    width: '100%',
    height: '100%',
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#202020',
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  vehicleDetails: {
    fontSize: 11,
    color: '#777777',
    marginLeft: 5,
  },
  vehiclePrice: {
    marginTop: 7,
    fontSize: 15,
    fontWeight: '800',
    color: '#D31A24',
  },
  perDay: {
    fontSize: 11,
    fontWeight: '500',
    color: '#777777',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDEDEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#888888',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#222222',
  },
  dateDescription: {
    marginTop: 5,
    fontSize: 10,
    color: '#888888',
  },
  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F7DEDF',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#777777',
    letterSpacing: 0.5,
  },
  totalText: {
    marginTop: 5,
    fontSize: 25,
    fontWeight: '900',
    color: '#D31A24',
  },
  totalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBlock: {
    marginTop: 19,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 13,
    padding: 12,
  },
  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#D31A24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#292929',
  },
  locationSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#777777',
  },
  qrBlock: {
    marginTop: 2,
    alignItems: 'center',
  },
  qrHeading: {
    width: '100%',
  },
  qrSmallLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#999999',
    marginTop: -5,
    marginBottom: 12,
  },
  qrSuccess: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 17,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  qrContainer: {
    width: 205,
    height: 205,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: '800',
    color: '#222222',
  },
  qrHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 17,
  },
  qrMessage: {
    width: '100%',
    minHeight: 145,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  qrMessageIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrMessageTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#333333',
    textAlign: 'center',
  },
  qrMessageText: {
    marginTop: 7,
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 17,
  },
  qrRetryButton: {
    marginTop: 12,
    backgroundColor: '#D31A24',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  qrRetryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#D31A24',
    borderRadius: 12,
    paddingVertical: 13,
  },
  outlineButtonText: {
    color: '#D31A24',
    fontSize: 12,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#D31A24',
    borderRadius: 12,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footerText: {
    marginTop: 17,
    textAlign: 'center',
    fontSize: 11,
    color: '#999999',
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emptyTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: '800',
    color: '#252525',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    backgroundColor: '#D31A24',
    paddingHorizontal: 23,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
