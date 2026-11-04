
import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../context/ThemeContext.js';
import { crearEstilos } from './DetalleVehiculoScreen.styles.js';

import { crearReserva } from '../../../services/reservas.service.js';
import { getResenasVehiculo } from '../../../services/resenas.service.js';

const ID_USUARIO_TEMPORAL = 1;

export default function DetalleVehiculoScreen({ route, navigation }) {
  const { vehiculo } = route.params || {};

  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => crearEstilos(theme, isDark),
    [theme, isDark]
  );

  const [modalReserva, setModalReserva] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const [datosResenas, setDatosResenas] = useState({
    promedio: 0,
    total: 0,
    resenas: [],
  });

  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [errorResenas, setErrorResenas] = useState(false);

  const detalles = useMemo(() => {
    if (!vehiculo) return {};

    if (
      typeof vehiculo.detalles_tecnicos === 'object' &&
      vehiculo.detalles_tecnicos !== null
    ) {
      return vehiculo.detalles_tecnicos;
    }

    return {
      pasajeros: vehiculo.pasajeros || 5,
      combustible: vehiculo.combustible || 'Gasolina',
      transmision: vehiculo.transmision || 'Manual',
      maletero: vehiculo.maletero || '850L',
    };
  }, [vehiculo]);

  useEffect(() => {
    let activo = true;

    const cargarResenas = async () => {
      const idVehiculo = vehiculo?.id_coche || vehiculo?.id;

      if (!idVehiculo) {
        setCargandoResenas(false);
        return;
      }

      try {
        setCargandoResenas(true);
        setErrorResenas(false);

        const resultado = await getResenasVehiculo(idVehiculo);

        if (activo) {
          setDatosResenas({
            promedio: Number(resultado?.promedio || 0),
            total: Number(resultado?.total || 0),
            resenas: Array.isArray(resultado?.resenas)
              ? resultado.resenas
              : [],
          });
        }
      } catch (error) {
        console.error('Error al cargar reseñas del vehículo:', error);

        if (activo) {
          setErrorResenas(true);
          setDatosResenas({
            promedio: 0,
            total: 0,
            resenas: [],
          });
        }
      } finally {
        if (activo) setCargandoResenas(false);
      }
    };

    cargarResenas();

    return () => {
      activo = false;
    };
  }, [vehiculo?.id_coche, vehiculo?.id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  };

  const formatearFechaResena = (fecha) => {
    if (!fecha) return 'Fecha no disponible';

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getTime())) {
      return 'Fecha no disponible';
    }

    return fechaDate.toLocaleDateString('es-NI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderEstrellas = (calificacion, tamano = 16) => {
    const valor = Math.max(0, Math.min(5, Number(calificacion) || 0));

    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={`estrella-${index}`}
        name={index < Math.round(valor) ? 'star' : 'star-outline'}
        size={tamano}
        color="#FFB800"
      />
    ));
  };

  if (!vehiculo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          No se seleccionó ningún vehículo.
        </Text>
      </SafeAreaView>
    );
  }

  const abrirReserva = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setMostrarCalendarioInicio(false);
    setMostrarCalendarioFin(false);
    setModalReserva(true);
  };

  const cerrarReserva = () => {
    if (!guardando) {
      setModalReserva(false);
      setMostrarCalendarioInicio(false);
      setMostrarCalendarioFin(false);
    }
  };

  const procesarReserva = async () => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert(
        'Fechas requeridas',
        'Seleccioná la fecha de inicio y la fecha de finalización.'
      );
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (fin <= inicio) {
      Alert.alert(
        'Fechas incorrectas',
        'La fecha de finalización debe ser posterior a la fecha de inicio.'
      );
      return;
    }

    const cantidadDias = Math.round(
      (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    );

    const valorDia = Number(
      vehiculo.valor_dia || vehiculo.precio || 0
    );

    const montoTotal = cantidadDias * valorDia;

    try {
      setGuardando(true);

      const idCoche = Number(vehiculo.id_coche || vehiculo.id);

      if (!Number.isFinite(idCoche) || idCoche <= 0) {
        throw new Error('No se pudo identificar el vehículo seleccionado.');
      }

      const fechaInicioSeleccionada = formatearFecha(inicio);
      const fechaFinSeleccionada = formatearFecha(fin);

      const datosReserva = {
        id_usuario: ID_USUARIO_TEMPORAL,
        id_coche: idCoche,
        fecha_inicio: fechaInicioSeleccionada,
        fecha_fin: fechaFinSeleccionada,
        estado_aprobacion: 'pendiente',
        monto_total: montoTotal,
      };

      console.log('Datos de la reserva:', datosReserva);

      await crearReserva(datosReserva);

      setModalReserva(false);

      Alert.alert(
        'Reserva realizada',
        `Tu reserva fue registrada correctamente.\n\nVehículo: ${vehiculo.nombre || `${vehiculo.marca} ${vehiculo.modelo}`
        }\nFechas: ${fechaInicioSeleccionada} al ${fechaFinSeleccionada}\nTotal: $${montoTotal.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.goBack) navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear reserva:', error);

      const mensaje = error.message || 'No se pudo registrar la reserva.';

      const esConflicto =
        error.status === 409 ||
        /reserva para las fechas|ocupado por un alquiler|no está disponible|fechas seleccionadas/i.test(
          mensaje
        );

      Alert.alert(
        esConflicto ? 'Vehículo no disponible' : 'Error',
        mensaje
      );
    } finally {
      setGuardando(false);
    }
  };

  const fechaHoy = formatearFecha(new Date());

  const calendarioWeb = (fecha, setFecha, fechaMinima) => (
    <input
      type="date"
      value={fecha ? formatearFecha(fecha) : ''}
      min={fechaMinima}
      disabled={guardando}
      onChange={(event) => {
        if (!event.target.value) return;

        const partes = event.target.value.split('-');

        const nuevaFecha = new Date(
          Number(partes[0]),
          Number(partes[1]) - 1,
          Number(partes[2])
        );

        setFecha(nuevaFecha);
      }}
      style={styles.webDateInput}
    />
  );

  const nombreVehiculo =
    vehiculo.nombre || `${vehiculo.marca} ${vehiculo.modelo}`;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: vehiculo.url_imagen || vehiculo.imagen }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>

          <View style={styles.badge4x4}>
            <Text style={styles.badge4x4Text}>
              {vehiculo.categoria_nombre || vehiculo.categoria || '4x4'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{nombreVehiculo}</Text>

              <View style={styles.ratingRow}>
                {renderEstrellas(datosResenas.promedio, 16)}

                <Text style={styles.ratingText}>
                  {cargandoResenas
                    ? 'Cargando...'
                    : datosResenas.total > 0
                      ? `${datosResenas.promedio.toFixed(1)} (${datosResenas.total} ${datosResenas.total === 1 ? 'reseña' : 'reseñas'
                      })`
                      : 'Sin reseñas'}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                ${vehiculo.valor_dia || vehiculo.precio}
              </Text>
              <Text style={styles.perDayText}>/día</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Características</Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Ionicons name="people" size={24} color="#D31A24" />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>PASAJEROS</Text>
                <Text style={styles.gridValue}>
                  {detalles.pasajeros ?? vehiculo.pasajeros ?? 5} personas
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Ionicons name="cog" size={24} color="#D31A24" />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>TRANSMISIÓN</Text>
                <Text style={styles.gridValue}>
                  {detalles.transmision || vehiculo.transmision || 'Manual'}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Ionicons name="color-fill" size={24} color="#D31A24" />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>COMBUSTIBLE</Text>
                <Text style={styles.gridValue}>
                  {detalles.combustible || vehiculo.combustible || 'Gasolina'}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Ionicons name="briefcase" size={24} color="#D31A24" />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>MALETERO</Text>
                <Text style={styles.gridValue}>
                  {detalles.maletero || vehiculo.maletero || '850L'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Descripción</Text>

          <Text style={styles.descriptionText}>
            {vehiculo.descripcion || 'Sin descripción disponible.'}
          </Text>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsHeading}>
                Opiniones de clientes
              </Text>

              <Text style={styles.reviewsCount}>
                {datosResenas.total}{' '}
                {datosResenas.total === 1 ? 'opinión' : 'opiniones'}
              </Text>
            </View>

            {cargandoResenas ? (
              <View style={styles.reviewsLoading}>
                <ActivityIndicator size="large" color="#D31A24" />
                <Text style={styles.reviewsLoadingText}>
                  Cargando opiniones...
                </Text>
              </View>
            ) : errorResenas ? (
              <View style={styles.reviewsError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={25}
                  color="#D31A24"
                />
                <Text style={styles.reviewsErrorText}>
                  No se pudieron cargar las opiniones. Intenta nuevamente más tarde.
                </Text>
              </View>
            ) : datosResenas.resenas.length === 0 ? (
              <View style={styles.reviewsEmpty}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={32}
                  color={theme.secondaryText}
                />
                <Text style={styles.reviewsEmptyTitle}>
                  Aún no hay reseñas para este vehículo.
                </Text>
                <Text style={styles.reviewsEmptyText}>
                  Las opiniones de los clientes aparecerán aquí.
                </Text>
              </View>
            ) : (
              datosResenas.resenas.map((resena, index) => (
                <View
                  key={resena.id || `resena-${index}`}
                  style={styles.reviewCard}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={styles.reviewUserRow}>
                      <View style={styles.reviewAvatar}>
                        <Ionicons
                          name="person"
                          size={19}
                          color="#D31A24"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewUserName}>
                          {resena.cliente?.nombre || 'Cliente'}
                        </Text>

                        <Text style={styles.reviewDate}>
                          {formatearFechaResena(resena.fecha_creacion)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {renderEstrellas(resena.calificacion, 13)}
                    </View>
                  </View>

                  <Text style={styles.reviewComment}>
                    {resena.comentario || 'Sin comentario.'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <View>
          <Text style={styles.footerSubText}>Precio por día</Text>
          <Text style={styles.footerPrice}>
            ${vehiculo.valor_dia || vehiculo.precio}{' '}
            <Text style={styles.currencyText}>USD</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reserveButton}
          activeOpacity={0.8}
          onPress={abrirReserva}
        >
          <Text style={styles.reserveButtonText}>RESERVAR AHORA</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalReserva}
        animationType="slide"
        transparent
        onRequestClose={cerrarReserva}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reservationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva reserva</Text>

              <TouchableOpacity
                onPress={cerrarReserva}
                disabled={guardando}
              >
                <Ionicons
                  name="close-circle"
                  size={30}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalVehicleName}>
              {nombreVehiculo}
            </Text>

            <Text style={styles.modalLabel}>Fecha de inicio</Text>

            {Platform.OS === 'web' ? (
              calendarioWeb(fechaInicio, setFechaInicio, fechaHoy)
            ) : (
              <TouchableOpacity
                onPress={() => setMostrarCalendarioInicio(true)}
                disabled={guardando}
                style={styles.dateButton}
              >
                <Text
                  style={
                    fechaInicio
                      ? styles.dateButtonText
                      : styles.datePlaceholder
                  }
                >
                  {fechaInicio
                    ? formatearFecha(fechaInicio)
                    : 'Seleccionar fecha'}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={23}
                  color="#D31A24"
                />
              </TouchableOpacity>
            )}

            {Platform.OS !== 'web' && mostrarCalendarioInicio && (
              <DateTimePicker
                value={fechaInicio || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                themeVariant={isDark ? 'dark' : 'light'}
                onChange={(event, selectedDate) => {
                  setMostrarCalendarioInicio(false);

                  if (selectedDate) {
                    setFechaInicio(selectedDate);

                    if (fechaFin && selectedDate >= fechaFin) {
                      setFechaFin(null);
                    }
                  }
                }}
              />
            )}

            <Text style={styles.modalLabel}>Fecha de finalización</Text>

            {!fechaInicio ? (
              <View style={styles.dateDisabled}>
                <Text style={styles.dateDisabledText}>
                  Primero seleccioná la fecha de inicio
                </Text>
              </View>
            ) : Platform.OS === 'web' ? (
              calendarioWeb(
                fechaFin,
                setFechaFin,
                formatearFecha(
                  new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000)
                )
              )
            ) : (
              <TouchableOpacity
                onPress={() => setMostrarCalendarioFin(true)}
                disabled={guardando}
                style={styles.dateButton}
              >
                <Text
                  style={
                    fechaFin
                      ? styles.dateButtonText
                      : styles.datePlaceholder
                  }
                >
                  {fechaFin
                    ? formatearFecha(fechaFin)
                    : 'Seleccionar fecha'}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={23}
                  color="#D31A24"
                />
              </TouchableOpacity>
            )}

            {Platform.OS !== 'web' &&
              mostrarCalendarioFin &&
              fechaInicio && (
                <DateTimePicker
                  value={
                    fechaFin ||
                    new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000)
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={
                    new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000)
                  }
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(event, selectedDate) => {
                    setMostrarCalendarioFin(false);

                    if (selectedDate) {
                      setFechaFin(selectedDate);
                    }
                  }}
                />
              )}

            <Text style={styles.modalHint}>
              Seleccioná las fechas usando el calendario.
            </Text>

            <TouchableOpacity
              onPress={procesarReserva}
              disabled={guardando}
              style={[
                styles.confirmButton,
                guardando && styles.confirmButtonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {guardando ? 'VERIFICANDO...' : 'CONFIRMAR RESERVA'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
