import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

import { useReservas } from '../../../hooks/useReservas';
import { useVehiculos } from '../../../hooks/useVehiculos';
import { useTheme } from '../../../context/ThemeContext';

import {
  getQRAlquiler,
  editarReserva,
  eliminarReserva,
} from '../../../services/reservas.service.js';

const formatearFechaEnvio = (fecha) => {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${año}-${mes}-${dia}`;
};

const convertirFecha = (fecha) => {
  if (!fecha) return null;

  let fechaReal;

  if (fecha._seconds) {
    fechaReal = new Date(fecha._seconds * 1000);
  } else if (fecha.seconds) {
    fechaReal = new Date(fecha.seconds * 1000);
  } else {
    const texto = String(fecha);

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
      const [año, mes, dia] = texto.split('-').map(Number);
      fechaReal = new Date(año, mes - 1, dia);
    } else {
      fechaReal = new Date(texto);
    }
  }

  if (isNaN(fechaReal.getTime())) return null;

  fechaReal.setHours(0, 0, 0, 0);

  return fechaReal;
};

const obtenerIdVehiculo = (vehiculo) => {
  return Number(vehiculo?.id_coche || vehiculo?.id);
};

export default function ReservasScreen() {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => crearEstilos(theme, isDark),
    [theme, isDark]
  );

  const { reservas, loading, error, refrescar } = useReservas();
  const { vehiculos = [] } = useVehiculos();

  const [qrToken, setQrToken] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrVersion, setQrVersion] = useState(0);

  const [modalEditar, setModalEditar] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [fechaInicioEdit, setFechaInicioEdit] = useState(null);
  const [fechaFinEdit, setFechaFinEdit] = useState(null);
  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
  const [guardandoCambio, setGuardandoCambio] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const reserva = reservas?.[0];

  const estado = String(
    reserva?.estado_aprobacion ||
    reserva?.estado ||
    'pendiente'
  ).toLowerCase().trim();

  const esPendiente = estado === 'pendiente';

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

  const vehiculosDisponibles = useMemo(() => {
    const lista = Array.isArray(vehiculos) ? [...vehiculos] : [];

    const vehiculoActual = reserva?.coche;

    if (vehiculoActual) {
      const idActual = obtenerIdVehiculo(vehiculoActual);

      const yaExiste = lista.some(
        item => obtenerIdVehiculo(item) === idActual
      );

      if (idActual && !yaExiste) {
        lista.unshift(vehiculoActual);
      }
    }

    return lista;
  }, [vehiculos, reserva]);

  const precioDiario = Number(
    vehiculoSeleccionado?.valor_dia ||
    vehiculoSeleccionado?.precio ||
    0
  );

  const cantidadDias = useMemo(() => {
    if (!fechaInicioEdit || !fechaFinEdit) return 0;

    const inicio = new Date(fechaInicioEdit);
    const fin = new Date(fechaFinEdit);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diferencia = fin.getTime() - inicio.getTime();

    return Math.round(diferencia / (1000 * 60 * 60 * 24));
  }, [fechaInicioEdit, fechaFinEdit]);

  const totalEstimado = cantidadDias > 0
    ? cantidadDias * precioDiario
    : 0;

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
    const fechaReal = convertirFecha(fecha);

    if (!fechaReal) return 'Sin fecha';

    return fechaReal.toLocaleDateString('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const abrirEdicion = () => {
    const vehiculoActual = reserva?.coche || {};

    const idActual = Number(
      reserva?.id_coche ||
      vehiculoActual.id_coche ||
      vehiculoActual.id
    );

    const vehiculoEncontrado = vehiculosDisponibles.find(
      item => obtenerIdVehiculo(item) === idActual
    );

    setVehiculoSeleccionado(
      vehiculoEncontrado || vehiculoActual
    );

    setFechaInicioEdit(convertirFecha(reserva?.fecha_inicio));
    setFechaFinEdit(convertirFecha(reserva?.fecha_fin));

    setMostrarFechaInicio(false);
    setMostrarFechaFin(false);
    setModalEditar(true);
  };

  const cerrarEdicion = () => {
    if (guardandoCambio) return;

    setModalEditar(false);
    setMostrarFechaInicio(false);
    setMostrarFechaFin(false);
  };

  const guardarEdicion = async () => {
    const idReserva = reserva?.id ?? reserva?.id_reserva;

    if (!idReserva) {
      Alert.alert(
        'Error',
        'No se pudo identificar la reserva que deseas editar.'
      );
      return;
    }

    if (!vehiculoSeleccionado) {
      Alert.alert(
        'Vehículo requerido',
        'Seleccioná el vehículo que deseas reservar.'
      );
      return;
    }

    if (!fechaInicioEdit || !fechaFinEdit) {
      Alert.alert(
        'Fechas requeridas',
        'Seleccioná la fecha de inicio y la fecha de finalización.'
      );
      return;
    }

    const inicio = new Date(fechaInicioEdit);
    const fin = new Date(fechaFinEdit);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (fin <= inicio) {
      Alert.alert(
        'Fechas incorrectas',
        'La fecha de finalización debe ser posterior a la fecha de inicio.'
      );
      return;
    }

    const idCoche = obtenerIdVehiculo(vehiculoSeleccionado);

    if (!Number.isFinite(idCoche) || idCoche <= 0) {
      Alert.alert(
        'Error',
        'No se pudo identificar el vehículo seleccionado.'
      );
      return;
    }

    try {
      setGuardandoCambio(true);

      await editarReserva(idReserva, {
        id_coche: idCoche,
        fecha_inicio: formatearFechaEnvio(inicio),
        fecha_fin: formatearFechaEnvio(fin),
      });

      setModalEditar(false);

      await refrescar();
      actualizarQR();

      Alert.alert(
        'Reserva actualizada',
        'Los cambios de tu reserva se guardaron correctamente.'
      );
    } catch (err) {
      console.error('Error al editar reserva:', err);

      Alert.alert(
        'No se pudo actualizar',
        err.message || 'Ocurrió un error al modificar tu reserva.'
      );
    } finally {
      setGuardandoCambio(false);
    }
  };

  const confirmarEliminar = () => {
    const idReserva = reserva?.id ?? reserva?.id_reserva;

    if (!idReserva) {
      Alert.alert(
        'Error',
        'No se pudo identificar la reserva que deseas eliminar.'
      );
      return;
    }

    Alert.alert(
      'Eliminar reserva',
      '¿Estás segura de que deseas eliminar esta reserva? Esta acción no se puede deshacer.',
      [
        {
          text: 'No, conservar',
          style: 'cancel',
        },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setEliminando(true);

              await eliminarReserva(idReserva);

              setQrToken(null);
              setQrError('');

              await refrescar();

              Alert.alert(
                'Reserva eliminada',
                'Tu reserva se eliminó correctamente.'
              );
            } catch (err) {
              console.error('Error al eliminar reserva:', err);

              Alert.alert(
                'No se pudo eliminar',
                err.message || 'Ocurrió un error al eliminar tu reserva.'
              );
            } finally {
              setEliminando(false);
            }
          },
        },
      ]
    );
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
        fondo: isDark ? '#173525' : '#EAF7EF',
        icono: 'checkmark-circle',
      };
    }

    if (['rechazada', 'rechazado'].includes(estado)) {
      return {
        titulo: 'Reserva rechazada',
        subtitulo: 'La reserva no fue aprobada',
        color: '#D62828',
        fondo: isDark ? '#3A2022' : '#FDECEC',
        icono: 'close-circle',
      };
    }

    if (['cancelada', 'cancelado'].includes(estado)) {
      return {
        titulo: 'Reserva cancelada',
        subtitulo: 'Esta reserva ya no está activa',
        color: isDark ? '#BBBBBB' : '#777777',
        fondo: isDark ? '#303030' : '#F0F0F0',
        icono: 'remove-circle',
      };
    }

    if (['completada', 'completado'].includes(estado)) {
      return {
        titulo: 'Reserva completada',
        subtitulo: 'El proceso ha finalizado',
        color: isDark ? '#A9C4DE' : '#526477',
        fondo: isDark ? '#25303B' : '#EEF2F6',
        icono: 'checkmark-done-circle',
      };
    }

    return {
      titulo: 'Reserva pendiente',
      subtitulo: 'Esperando aprobación del administrador',
      color: '#D97706',
      fondo: isDark ? '#3A2D1B' : '#FFF4E5',
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
                  color={theme.secondaryText}
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

          {esPendiente && (
            <View style={styles.pendingActions}>
              <Text style={styles.pendingActionsTitle}>
                Administrar reserva
              </Text>

              <Text style={styles.pendingActionsDescription}>
                Mientras esté pendiente, puedes modificar los datos o eliminarla.
              </Text>

              <View style={styles.pendingButtonsRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={abrirEdicion}
                  disabled={eliminando || guardandoCambio}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.editButtonText}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    eliminando && styles.disabledButton,
                  ]}
                  onPress={confirmarEliminar}
                  disabled={eliminando || guardandoCambio}
                >
                  {eliminando ? (
                    <ActivityIndicator
                      size="small"
                      color="#D31A24"
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#D31A24"
                    />
                  )}

                  <Text style={styles.deleteButtonText}>
                    {eliminando ? 'Eliminando...' : 'Eliminar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

      <Modal
        visible={modalEditar}
        animationType="slide"
        transparent
        onRequestClose={cerrarEdicion}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  Editar reserva
                </Text>

                <Text style={styles.modalSubtitle}>
                  Modifica el vehículo y las fechas.
                </Text>
              </View>

              <TouchableOpacity
                onPress={cerrarEdicion}
                disabled={guardandoCambio}
              >
                <Ionicons
                  name="close-circle"
                  size={29}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.editSectionTitle}>
                Selecciona un vehículo
              </Text>

              {vehiculosDisponibles.length === 0 ? (
                <Text style={styles.noVehiclesText}>
                  No se encontraron vehículos disponibles en el catálogo.
                </Text>
              ) : (
                <View style={styles.vehicleOptions}>
                  {vehiculosDisponibles.map((item, index) => {
                    const idItem = obtenerIdVehiculo(item);
                    const idSeleccionado = obtenerIdVehiculo(
                      vehiculoSeleccionado
                    );

                    const seleccionado =
                      idItem === idSeleccionado;

                    const nombre =
                      item.nombre ||
                      `${item.marca || ''} ${item.modelo || ''}`.trim();

                    const imagen =
                      item.url_imagen || item.imagen;

                    return (
                      <TouchableOpacity
                        key={String(idItem || index)}
                        style={[
                          styles.vehicleOption,
                          seleccionado && styles.vehicleOptionSelected,
                        ]}
                        onPress={() => setVehiculoSeleccionado(item)}
                        disabled={guardandoCambio}
                      >
                        {imagen ? (
                          <Image
                            source={{ uri: imagen }}
                            style={styles.vehicleOptionImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.vehicleOptionImagePlaceholder}>
                            <Ionicons
                              name="car-sport-outline"
                              size={28}
                              color={theme.secondaryText}
                            />
                          </View>
                        )}

                        <View style={styles.vehicleOptionInfo}>
                          <Text
                            style={styles.vehicleOptionName}
                            numberOfLines={1}
                          >
                            {nombre || 'Vehículo'}
                          </Text>

                          <Text style={styles.vehicleOptionPrice}>
                            ${Number(
                              item.valor_dia || item.precio || 0
                            ).toFixed(2)} / día
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            seleccionado
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={22}
                          color={seleccionado ? '#D31A24' : theme.secondaryText}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.modalDivider} />

              <Text style={styles.editSectionTitle}>
                Fecha de inicio
              </Text>

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setMostrarFechaFin(false);
                  setMostrarFechaInicio(true);
                }}
                disabled={guardandoCambio}
              >
                <Text style={styles.datePickerButtonText}>
                  {fechaInicioEdit
                    ? formatearFechaEnvio(fechaInicioEdit)
                    : 'Seleccionar fecha'}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={21}
                  color="#D31A24"
                />
              </TouchableOpacity>

              {mostrarFechaInicio && (
                <DateTimePicker
                  value={fechaInicioEdit || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setMostrarFechaInicio(false);

                    if (
                      event?.type === 'dismissed' ||
                      !selectedDate
                    ) {
                      return;
                    }

                    const nuevaFecha = new Date(selectedDate);
                    nuevaFecha.setHours(0, 0, 0, 0);

                    setFechaInicioEdit(nuevaFecha);

                    if (fechaFinEdit && nuevaFecha >= fechaFinEdit) {
                      const nuevaFinal = new Date(nuevaFecha);
                      nuevaFinal.setDate(nuevaFinal.getDate() + 1);
                      setFechaFinEdit(nuevaFinal);
                    }
                  }}
                />
              )}

              <Text style={styles.editSectionTitle}>
                Fecha de finalización
              </Text>

              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  !fechaInicioEdit && styles.datePickerDisabled,
                ]}
                onPress={() => {
                  if (!fechaInicioEdit) {
                    Alert.alert(
                      'Selecciona primero la fecha inicial',
                      'Después podrás elegir la fecha de finalización.'
                    );
                    return;
                  }

                  setMostrarFechaInicio(false);
                  setMostrarFechaFin(true);
                }}
                disabled={guardandoCambio || !fechaInicioEdit}
              >
                <Text
                  style={[
                    styles.datePickerButtonText,
                    !fechaInicioEdit && styles.datePickerPlaceholder,
                  ]}
                >
                  {fechaFinEdit
                    ? formatearFechaEnvio(fechaFinEdit)
                    : 'Seleccionar fecha'}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={21}
                  color="#D31A24"
                />
              </TouchableOpacity>

              {mostrarFechaFin && fechaInicioEdit && (
                <DateTimePicker
                  value={
                    fechaFinEdit ||
                    new Date(
                      fechaInicioEdit.getTime() +
                      24 * 60 * 60 * 1000
                    )
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={
                    new Date(
                      fechaInicioEdit.getTime() +
                      24 * 60 * 60 * 1000
                    )
                  }
                  onChange={(event, selectedDate) => {
                    setMostrarFechaFin(false);

                    if (
                      event?.type === 'dismissed' ||
                      !selectedDate
                    ) {
                      return;
                    }

                    const nuevaFecha = new Date(selectedDate);
                    nuevaFecha.setHours(0, 0, 0, 0);

                    setFechaFinEdit(nuevaFecha);
                  }}
                />
              )}

              <View style={styles.estimatedTotal}>
                <View>
                  <Text style={styles.estimatedTotalLabel}>
                    TOTAL ESTIMADO
                  </Text>

                  <Text style={styles.estimatedTotalDays}>
                    {cantidadDias > 0
                      ? `${cantidadDias} día${cantidadDias === 1 ? '' : 's'}`
                      : 'Selecciona las fechas'}
                  </Text>
                </View>

                <Text style={styles.estimatedTotalAmount}>
                  ${totalEstimado.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.editNote}>
                El total definitivo será calculado nuevamente por el servidor
                según el precio vigente del vehículo.
              </Text>

              <TouchableOpacity
                style={[
                  styles.saveEditButton,
                  (guardandoCambio || vehiculosDisponibles.length === 0) &&
                  styles.disabledButton,
                ]}
                onPress={guardarEdicion}
                disabled={
                  guardandoCambio ||
                  vehiculosDisponibles.length === 0
                }
              >
                {guardandoCambio ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="save-outline"
                    size={19}
                    color="#FFFFFF"
                  />
                )}

                <Text style={styles.saveEditButtonText}>
                  {guardandoCambio
                    ? 'GUARDANDO CAMBIOS...'
                    : 'GUARDAR CAMBIOS'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={cerrarEdicion}
                disabled={guardandoCambio}
              >
                <Text style={styles.cancelEditButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const crearEstilos = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 35,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.secondaryText,
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
    color: theme.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.secondaryText,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 9,
    elevation: isDark ? 0 : 3,
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
    color: theme.text,
  },
  statusSubtitle: {
    fontSize: 11,
    color: theme.secondaryText,
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
    backgroundColor: theme.border,
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
    color: theme.text,
    marginLeft: 7,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
    borderRadius: 14,
    padding: 11,
  },
  vehicleImage: {
    width: 105,
    height: 78,
    borderRadius: 11,
    backgroundColor: isDark ? '#303030' : '#EEEEEF',
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
    color: theme.text,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  vehicleDetails: {
    fontSize: 11,
    color: theme.secondaryText,
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
    color: theme.secondaryText,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBox: {
    flex: 1,
    backgroundColor: isDark ? '#242424' : '#FAFAFA',
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDark ? '#3A2022' : '#FDEDEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.secondaryText,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
  },
  dateDescription: {
    marginTop: 5,
    fontSize: 10,
    color: theme.secondaryText,
  },
  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#321C1E' : '#FFF5F5',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: isDark ? '#51272A' : '#F7DEDF',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.secondaryText,
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
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBlock: {
    marginTop: 19,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
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
    color: theme.text,
  },
  locationSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: theme.secondaryText,
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
    color: theme.secondaryText,
    marginTop: -5,
    marginBottom: 12,
  },
  qrSuccess: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: isDark ? '#242424' : '#FAFAFA',
    borderRadius: 15,
    padding: 17,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.text,
  },
  qrHint: {
    marginTop: 6,
    fontSize: 11,
    color: theme.secondaryText,
    textAlign: 'center',
    lineHeight: 17,
  },
  qrMessage: {
    width: '100%',
    minHeight: 145,
    backgroundColor: isDark ? '#242424' : '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  qrMessageIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrMessageTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  qrMessageText: {
    marginTop: 7,
    fontSize: 11,
    color: theme.secondaryText,
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
    color: theme.secondaryText,
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.secondaryText,
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
  pendingActions: {
    marginTop: 19,
    padding: 14,
    borderRadius: 14,
    backgroundColor: isDark ? '#2D2420' : '#FFF8F0',
    borderWidth: 1,
    borderColor: isDark ? '#49372B' : '#F4E4D2',
  },
  pendingActionsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  pendingActionsDescription: {
    fontSize: 11,
    color: theme.secondaryText,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 13,
  },
  pendingButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#D31A24',
    borderRadius: 11,
    paddingVertical: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: isDark ? '#653438' : '#E8BFC1',
    borderRadius: 11,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: '#D31A24',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  editModal: {
    maxHeight: '92%',
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: theme.text,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.secondaryText,
  },
  editSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 10,
    marginTop: 5,
  },
  vehicleOptions: {
    gap: 9,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    backgroundColor: theme.input,
  },
  vehicleOptionSelected: {
    borderColor: '#D31A24',
    backgroundColor: isDark ? '#321C1E' : '#FFF5F5',
  },
  vehicleOptionImage: {
    width: 72,
    height: 54,
    borderRadius: 8,
    backgroundColor: isDark ? '#303030' : '#EEEEEE',
  },
  vehicleOptionImagePlaceholder: {
    width: 72,
    height: 54,
    borderRadius: 8,
    backgroundColor: isDark ? '#303030' : '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleOptionInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  vehicleOptionName: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.text,
  },
  vehicleOptionPrice: {
    fontSize: 11,
    color: '#D31A24',
    fontWeight: '700',
    marginTop: 5,
  },
  noVehiclesText: {
    fontSize: 12,
    color: theme.secondaryText,
    padding: 12,
    backgroundColor: theme.input,
    borderRadius: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 17,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 11,
    padding: 14,
    marginBottom: 16,
    backgroundColor: theme.input,
  },
  datePickerButtonText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },
  datePickerPlaceholder: {
    color: theme.secondaryText,
  },
  datePickerDisabled: {
    backgroundColor: isDark ? '#252525' : '#F3F3F3',
    borderColor: theme.border,
  },
  estimatedTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#321C1E' : '#FFF5F5',
    borderWidth: 1,
    borderColor: isDark ? '#51272A' : '#F5DCDD',
    borderRadius: 13,
    padding: 15,
    marginTop: 5,
  },
  estimatedTotalLabel: {
    fontSize: 10,
    color: theme.secondaryText,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  estimatedTotalDays: {
    fontSize: 11,
    color: theme.secondaryText,
    marginTop: 5,
  },
  estimatedTotalAmount: {
    fontSize: 21,
    color: '#D31A24',
    fontWeight: '900',
  },
  editNote: {
    fontSize: 10,
    color: theme.secondaryText,
    lineHeight: 15,
    marginTop: 9,
    marginBottom: 15,
  },
  saveEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#D31A24',
    paddingVertical: 15,
    borderRadius: 12,
  },
  saveEditButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cancelEditButton: {
    alignItems: 'center',
    paddingVertical: 13,
  },
  cancelEditButtonText: {
    color: theme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
});