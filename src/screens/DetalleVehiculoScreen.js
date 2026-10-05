import React, { useMemo, useState } from 'react';

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
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DetalleVehiculoScreen.styles.js';

import {
  crearReserva,
  getReservas,
} from '../services/reservas.service';

const e = React.createElement;

// USUARIO TEMPORAL PARA PRUEBAS
const ID_USUARIO_TEMPORAL = 1;

export default function DetalleVehiculoScreen({ route, navigation }) {
  const { vehiculo } = route.params || {};

  const [modalReserva, setModalReserva] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] =
    useState(false);

  const [mostrarCalendarioFin, setMostrarCalendarioFin] =
    useState(false);

  const [guardando, setGuardando] = useState(false);

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

  if (!vehiculo) {
    return e(
      SafeAreaView,
      { style: styles.container },
      e(
        Text,
        { style: styles.errorText },
        'No se seleccionó ningún vehículo.'
      )
    );
  }

  const abrirReserva = () => {
    console.log('BOTÓN RESERVAR AHORA PRESIONADO');

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

  const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
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

    if (fin <= inicio) {
      Alert.alert(
        'Fechas incorrectas',
        'La fecha de finalización debe ser posterior a la fecha de inicio.'
      );
      return;
    }

    const cantidadDias = Math.ceil(
      (fin.getTime() - inicio.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const valorDia = Number(
      vehiculo.valor_dia || vehiculo.precio || 0
    );

    const montoTotal = cantidadDias * valorDia;

    try {
      setGuardando(true);

      // VERIFICAR DISPONIBILIDAD DEL VEHÍCULO
      const reservas = await getReservas();

      const idCoche = Number(
        vehiculo.id_coche || vehiculo.id
      );

      const fechaInicioSeleccionada =
        formatearFecha(fechaInicio);

      const fechaFinSeleccionada =
        formatearFecha(fechaFin);

      const reservaCruza = reservas.some((reserva) => {
        const mismaCoche =
          Number(reserva.id_coche) === idCoche;

        const estado = String(
          reserva.estado_aprobacion || ''
        ).toLowerCase();

        const noBloquea =
          estado === 'rechazada' ||
          estado === 'cancelada' ||
          estado === 'cancelado';

        if (!mismaCoche || noBloquea) {
          return false;
        }

        const inicioExistente = reserva.fecha_inicio;
        const finExistente = reserva.fecha_fin;

        return (
          fechaInicioSeleccionada <= finExistente &&
          fechaFinSeleccionada >= inicioExistente
        );
      });

      if (reservaCruza) {
        Alert.alert(
          'Vehículo no disponible',
          'Este vehículo ya está reservado para las fechas seleccionadas. Por favor, elegí otras fechas o seleccioná otro vehículo.'
        );

        setGuardando(false);
        return;
      }

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
        `Tu reserva fue registrada correctamente.\n\nVehículo: ${vehiculo.nombre ||
        `${vehiculo.marca} ${vehiculo.modelo}`
        }\nFechas: ${fechaInicioSeleccionada} al ${fechaFinSeleccionada}\nTotal: $${montoTotal.toFixed(
          2
        )}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.goBack) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear reserva:', error);

      Alert.alert(
        'Error',
        error.message ||
        'No se pudo registrar la reserva.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const fechaHoy = formatearFecha(new Date());

  const calendarioWeb = (
    fecha,
    setFecha,
    fechaMinima
  ) =>
    e('input', {
      type: 'date',
      value: fecha ? formatearFecha(fecha) : '',
      min: fechaMinima,
      disabled: guardando,
      onChange: (event) => {
        if (!event.target.value) return;

        const partes = event.target.value.split('-');

        const nuevaFecha = new Date(
          Number(partes[0]),
          Number(partes[1]) - 1,
          Number(partes[2])
        );

        setFecha(nuevaFecha);
      },
      style: {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '13px',
        fontSize: '16px',
        backgroundColor: '#fff',
        color: '#222',
        outline: 'none',
        marginBottom: '10px',
      },
    });

  return e(
    View,
    { style: styles.container },

    e(
      ScrollView,
      {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent,
      },

      e(
        View,
        { style: styles.imageContainer },

        e(Image, {
          source: {
            uri: vehiculo.url_imagen || vehiculo.imagen,
          },
          style: styles.vehicleImage,
          resizeMode: 'cover',
        }),

        e(
          TouchableOpacity,
          {
            style: styles.backButton,
            activeOpacity: 0.8,
            onPress: () => navigation.goBack(),
          },
          e(Ionicons, {
            name: 'chevron-back',
            size: 24,
            color: '#333',
          })
        ),

        e(
          View,
          { style: styles.badge4x4 },

          e(
            Text,
            { style: styles.badge4x4Text },

            vehiculo.categoria_nombre ||
            vehiculo.categoria ||
            '4x4'
          )
        )
      ),

      e(
        View,
        { style: styles.infoCard },

        e(
          View,
          { style: styles.headerRow },

          e(
            View,
            { style: { flex: 1 } },

            e(
              Text,
              { style: styles.title },

              vehiculo.nombre ||
              `${vehiculo.marca} ${vehiculo.modelo}`
            ),

            e(
              View,
              { style: styles.ratingRow },

              e(Ionicons, {
                name: 'star',
                size: 16,
                color: '#FFC107',
              }),

              e(Ionicons, {
                name: 'star',
                size: 16,
                color: '#FFC107',
              }),

              e(Ionicons, {
                name: 'star',
                size: 16,
                color: '#FFC107',
              }),

              e(Ionicons, {
                name: 'star',
                size: 16,
                color: '#FFC107',
              }),

              e(Ionicons, {
                name: 'star',
                size: 16,
                color: '#FFC107',
              }),

              e(
                Text,
                { style: styles.ratingText },

                '4.8 ',

                e(
                  Text,
                  { style: styles.reviewsText },
                  '(124 reseñas)'
                )
              )
            )
          ),

          e(
            View,
            { style: styles.priceContainer },

            e(
              Text,
              { style: styles.priceText },

              `$${vehiculo.valor_dia || vehiculo.precio}`
            ),

            e(
              Text,
              { style: styles.perDayText },
              '/día'
            )
          )
        ),

        e(
          Text,
          { style: styles.sectionTitle },
          'Características'
        ),

        e(
          View,
          { style: styles.gridContainer },

          e(
            View,
            { style: styles.gridItem },

            e(Ionicons, {
              name: 'people',
              size: 24,
              color: '#4C1D95',
            }),

            e(
              View,
              { style: styles.gridTextContainer },

              e(
                Text,
                { style: styles.gridLabel },
                'PASAJEROS'
              ),

              e(
                Text,
                { style: styles.gridValue },

                `${detalles.pasajeros ?? vehiculo.pasajeros ?? 5} personas`
              )
            )
          ),

          e(
            View,
            { style: styles.gridItem },

            e(Ionicons, {
              name: 'cog',
              size: 24,
              color: '#4C1D95',
            }),

            e(
              View,
              { style: styles.gridTextContainer },

              e(
                Text,
                { style: styles.gridLabel },
                'TRANSMISIÓN'
              ),

              e(
                Text,
                { style: styles.gridValue },

                detalles.transmision ||
                vehiculo.transmision ||
                'Manual'
              )
            )
          ),

          e(
            View,
            { style: styles.gridItem },

            e(Ionicons, {
              name: 'color-fill',
              size: 24,
              color: '#E53935',
            }),

            e(
              View,
              { style: styles.gridTextContainer },

              e(
                Text,
                { style: styles.gridLabel },
                'COMBUSTIBLE'
              ),

              e(
                Text,
                { style: styles.gridValue },

                detalles.combustible ||
                vehiculo.combustible ||
                'Gasolina'
              )
            )
          ),

          e(
            View,
            { style: styles.gridItem },

            e(Ionicons, {
              name: 'briefcase',
              size: 24,
              color: '#0284C7',
            }),

            e(
              View,
              { style: styles.gridTextContainer },

              e(
                Text,
                { style: styles.gridLabel },
                'MALETERO'
              ),

              e(
                Text,
                { style: styles.gridValue },

                detalles.maletero ||
                vehiculo.maletero ||
                '850L'
              )
            )
          )
        ),

        e(
          Text,
          { style: styles.sectionTitle },
          'Descripción'
        ),

        e(
          Text,
          { style: styles.descriptionText },
          vehiculo.descripcion
        )
      )
    ),

    e(
      View,
      { style: styles.footerContainer },

      e(
        View,
        null,

        e(
          Text,
          { style: styles.footerSubText },
          'Precio por día'
        ),

        e(
          Text,
          { style: styles.footerPrice },

          `$${vehiculo.valor_dia || vehiculo.precio} `,

          e(
            Text,
            { style: styles.currencyText },
            'USD'
          )
        )
      ),

      e(
        TouchableOpacity,
        {
          style: styles.reserveButton,
          activeOpacity: 0.8,
          onPress: abrirReserva,
        },

        e(
          Text,
          { style: styles.reserveButtonText },
          'RESERVAR AHORA'
        )
      )
    ),

    e(
      Modal,
      {
        visible: modalReserva,
        animationType: 'slide',
        transparent: true,
        onRequestClose: cerrarReserva,
      },

      e(
        View,
        {
          style: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          },
        },

        e(
          View,
          {
            style: {
              backgroundColor: '#fff',
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              padding: 25,
              paddingBottom: 35,
            },
          },

          e(
            View,
            {
              style: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              },
            },

            e(
              Text,
              {
                style: {
                  fontSize: 23,
                  fontWeight: 'bold',
                  color: '#222',
                },
              },
              'Nueva reserva'
            ),

            e(
              TouchableOpacity,
              {
                onPress: cerrarReserva,
              },

              e(Ionicons, {
                name: 'close-circle',
                size: 30,
                color: '#666',
              })
            )
          ),

          e(
            Text,
            {
              style: {
                fontSize: 16,
                color: '#555',
                marginBottom: 20,
              },
            },

            vehiculo.nombre ||
            `${vehiculo.marca} ${vehiculo.modelo}`
          ),

          e(
            Text,
            {
              style: {
                fontWeight: 'bold',
                marginBottom: 7,
              },
            },
            'Fecha de inicio'
          ),

          Platform.OS === 'web'
            ? calendarioWeb(
              fechaInicio,
              setFechaInicio,
              fechaHoy
            )
            : e(
              TouchableOpacity,
              {
                onPress: () =>
                  setMostrarCalendarioInicio(true),

                disabled: guardando,

                style: {
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              },

              e(
                Text,
                {
                  style: {
                    fontSize: 16,
                    color: fechaInicio
                      ? '#222'
                      : '#888',
                  },
                },

                fechaInicio
                  ? formatearFecha(fechaInicio)
                  : 'Seleccionar fecha'
              ),

              e(Ionicons, {
                name: 'calendar-outline',
                size: 23,
                color: '#4C1D95',
              })
            ),

          Platform.OS !== 'web' &&
          mostrarCalendarioInicio &&
          e(DateTimePicker, {
            value: fechaInicio || new Date(),
            mode: 'date',
            display:
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default',

            minimumDate: new Date(),

            onChange: (event, selectedDate) => {
              setMostrarCalendarioInicio(false);

              if (selectedDate) {
                setFechaInicio(selectedDate);

                if (
                  fechaFin &&
                  selectedDate >= fechaFin
                ) {
                  setFechaFin(null);
                }
              }
            },
          }),

          e(
            Text,
            {
              style: {
                fontWeight: 'bold',
                marginBottom: 7,
                marginTop: 8,
              },
            },
            'Fecha de finalización'
          ),

          !fechaInicio
            ? e(
              View,
              {
                style: {
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 10,
                  backgroundColor: '#f5f5f5',
                },
              },

              e(
                Text,
                {
                  style: {
                    fontSize: 16,
                    color: '#999',
                  },
                },

                'Primero seleccioná la fecha de inicio'
              )
            )
            : Platform.OS === 'web'
              ? calendarioWeb(
                fechaFin,
                setFechaFin,
                formatearFecha(
                  new Date(
                    fechaInicio.getTime() +
                    24 * 60 * 60 * 1000
                  )
                )
              )
              : e(
                TouchableOpacity,
                {
                  onPress: () =>
                    setMostrarCalendarioFin(true),

                  disabled: guardando,

                  style: {
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                },

                e(
                  Text,
                  {
                    style: {
                      fontSize: 16,
                      color: fechaFin
                        ? '#222'
                        : '#888',
                    },
                  },

                  fechaFin
                    ? formatearFecha(fechaFin)
                    : 'Seleccionar fecha'
                ),

                e(Ionicons, {
                  name: 'calendar-outline',
                  size: 23,
                  color: '#4C1D95',
                })
              ),

          Platform.OS !== 'web' &&
          mostrarCalendarioFin &&
          fechaInicio &&
          e(DateTimePicker, {
            value:
              fechaFin ||
              new Date(
                fechaInicio.getTime() +
                24 * 60 * 60 * 1000
              ),

            mode: 'date',

            display:
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default',

            minimumDate: new Date(
              fechaInicio.getTime() +
              24 * 60 * 60 * 1000
            ),

            onChange: (event, selectedDate) => {
              setMostrarCalendarioFin(false);

              if (selectedDate) {
                setFechaFin(selectedDate);
              }
            },
          }),

          e(
            Text,
            {
              style: {
                color: '#666',
                marginTop: 5,
                marginBottom: 20,
              },
            },

            'Seleccioná las fechas usando el calendario.'
          ),

          e(
            TouchableOpacity,
            {
              onPress: procesarReserva,
              disabled: guardando,

              style: {
                backgroundColor: guardando
                  ? '#999'
                  : '#4C1D95',

                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              },
            },

            e(
              Text,
              {
                style: {
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                },
              },

              guardando
                ? 'VERIFICANDO...'
                : 'CONFIRMAR RESERVA'
            )
          )
        )
      )
    )
  );
}