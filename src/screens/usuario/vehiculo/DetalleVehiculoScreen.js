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
import { styles } from './DetalleVehiculoScreen.styles.js';

import { crearReserva } from '../../../services/reservas.service.js';
import { getResenasVehiculo } from '../../../services/resenas.service.js';

const e = React.createElement;

const ID_USUARIO_TEMPORAL = 1;

export default function DetalleVehiculoScreen({ route, navigation }) {
  const { vehiculo } = route.params || {};

  // COMPROBAR IDENTIFICADOR DEL VEHÍCULO
  console.log('VEHÍCULO SELECCIONADO:', vehiculo);
  console.log('ID COCHE:', vehiculo?.id_coche);
  console.log('ID:', vehiculo?.id);

  const [modalReserva, setModalReserva] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] =
    useState(false);

  const [mostrarCalendarioFin, setMostrarCalendarioFin] =
    useState(false);

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

      console.log('ID ENVIADO A RESEÑAS:', idVehiculo);

      if (!idVehiculo) {
        setCargandoResenas(false);
        return;
      }

      try {
        setCargandoResenas(true);
        setErrorResenas(false);

        const resultado = await getResenasVehiculo(idVehiculo);

        console.log('RESULTADO DE RESEÑAS:', resultado);

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
        if (activo) {
          setCargandoResenas(false);
        }
      }
    };

    cargarResenas();

    return () => {
      activo = false;
    };
  }, [vehiculo?.id_coche, vehiculo?.id]);

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
    const valor = Math.max(
      0,
      Math.min(5, Number(calificacion) || 0)
    );

    return Array.from({ length: 5 }, (_, index) =>
      e(Ionicons, {
        key: `estrella-${index}`,
        name: index < Math.round(valor) ? 'star' : 'star-outline',
        size: tamano,
        color: '#FFB800',
      })
    );
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
      (fin.getTime() - inicio.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const valorDia = Number(
      vehiculo.valor_dia || vehiculo.precio || 0
    );

    const montoTotal = cantidadDias * valorDia;

    try {
      setGuardando(true);

      const idCoche = Number(
        vehiculo.id_coche || vehiculo.id
      );

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
              if (navigation?.goBack) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear reserva:', error);

      const mensaje =
        error.message || 'No se pudo registrar la reserva.';

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

  const calendarioWeb = (fecha, setFecha, fechaMinima) =>
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

              ...renderEstrellas(datosResenas.promedio, 16),

              e(
                Text,
                { style: styles.ratingText },
                cargandoResenas
                  ? 'Cargando...'
                  : datosResenas.total > 0
                    ? `${datosResenas.promedio.toFixed(1)} (${datosResenas.total} ${datosResenas.total === 1 ? 'reseña' : 'reseñas'})`
                    : 'Sin reseñas'
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
              color: '#D31A24',
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
              color: '#D31A24',
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
              color: '#D31A24',
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
              color: '#D31A24',
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
          vehiculo.descripcion || 'Sin descripción disponible.'
        ),

        // SECCIÓN DE RESEÑAS
        e(
          View,
          {
            style: {
              marginTop: 25,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: '#EEEEEE',
            },
          },

          e(
            View,
            {
              style: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 15,
              },
            },

            e(
              Text,
              {
                style: {
                  fontSize: 19,
                  fontWeight: 'bold',
                  color: '#222222',
                },
              },
              'Opiniones de clientes'
            ),

            e(
              Text,
              {
                style: {
                  fontSize: 13,
                  color: '#777777',
                },
              },
              `${datosResenas.total} ${datosResenas.total === 1 ? 'opinión' : 'opiniones'}`
            )
          ),

          cargandoResenas
            ? e(
              View,
              {
                style: {
                  paddingVertical: 25,
                  alignItems: 'center',
                },
              },
              e(ActivityIndicator, {
                size: 'large',
                color: '#D31A24',
              }),
              e(
                Text,
                {
                  style: {
                    color: '#777777',
                    marginTop: 10,
                    fontSize: 13,
                  },
                },
                'Cargando opiniones...'
              )
            )
            : errorResenas
              ? e(
                View,
                {
                  style: {
                    backgroundColor: '#FFF4F4',
                    borderRadius: 12,
                    padding: 15,
                    alignItems: 'center',
                  },
                },
                e(Ionicons, {
                  name: 'alert-circle-outline',
                  size: 25,
                  color: '#D31A24',
                }),
                e(
                  Text,
                  {
                    style: {
                      color: '#8B2525',
                      marginTop: 7,
                      textAlign: 'center',
                      fontSize: 13,
                    },
                  },
                  'No se pudieron cargar las opiniones. Intenta nuevamente más tarde.'
                )
              )
              : datosResenas.resenas.length === 0
                ? e(
                  View,
                  {
                    style: {
                      backgroundColor: '#F7F7F7',
                      borderRadius: 12,
                      padding: 22,
                      alignItems: 'center',
                    },
                  },
                  e(Ionicons, {
                    name: 'chatbubble-ellipses-outline',
                    size: 32,
                    color: '#999999',
                  }),
                  e(
                    Text,
                    {
                      style: {
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#555555',
                        marginTop: 10,
                      },
                    },
                    'Aún no hay reseñas para este vehículo.'
                  ),
                  e(
                    Text,
                    {
                      style: {
                        fontSize: 12,
                        color: '#888888',
                        marginTop: 5,
                        textAlign: 'center',
                      },
                    },
                    'Las opiniones de los clientes aparecerán aquí.'
                  )
                )
                : e(
                  View,
                  null,

                  ...datosResenas.resenas.map((resena, index) =>
                    e(
                      View,
                      {
                        key: resena.id || `resena-${index}`,
                        style: {
                          backgroundColor: '#F8F8F8',
                          borderRadius: 13,
                          padding: 15,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: '#EEEEEE',
                        },
                      },

                      e(
                        View,
                        {
                          style: {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          },
                        },

                        e(
                          View,
                          {
                            style: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                            },
                          },

                          e(
                            View,
                            {
                              style: {
                                width: 38,
                                height: 38,
                                borderRadius: 19,
                                backgroundColor: '#FCE8E9',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              },
                            },
                            e(Ionicons, {
                              name: 'person',
                              size: 19,
                              color: '#D31A24',
                            })
                          ),

                          e(
                            View,
                            { style: { flex: 1 } },
                            e(
                              Text,
                              {
                                style: {
                                  fontSize: 14,
                                  fontWeight: 'bold',
                                  color: '#222222',
                                },
                              },
                              resena.cliente?.nombre || 'Cliente'
                            ),
                            e(
                              Text,
                              {
                                style: {
                                  fontSize: 11,
                                  color: '#888888',
                                  marginTop: 3,
                                },
                              },
                              formatearFechaResena(resena.fecha_creacion)
                            )
                          )
                        ),

                        e(
                          View,
                          {
                            style: {
                              flexDirection: 'row',
                              alignItems: 'center',
                            },
                          },
                          ...renderEstrellas(resena.calificacion, 13)
                        )
                      ),

                      e(
                        Text,
                        {
                          style: {
                            fontSize: 13,
                            color: '#444444',
                            lineHeight: 20,
                            marginTop: 13,
                          },
                        },
                        resena.comentario || 'Sin comentario.'
                      )
                    )
                  )
                )
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
              { onPress: cerrarReserva },
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
                    color: fechaInicio ? '#222' : '#888',
                  },
                },
                fechaInicio
                  ? formatearFecha(fechaInicio)
                  : 'Seleccionar fecha'
              ),
              e(Ionicons, {
                name: 'calendar-outline',
                size: 23,
                color: '#D31A24',
              })
            ),

          Platform.OS !== 'web' &&
          mostrarCalendarioInicio &&
          e(DateTimePicker, {
            value: fechaInicio || new Date(),
            mode: 'date',
            display: Platform.OS === 'ios' ? 'spinner' : 'default',
            minimumDate: new Date(),
            onChange: (event, selectedDate) => {
              setMostrarCalendarioInicio(false);

              if (selectedDate) {
                setFechaInicio(selectedDate);

                if (fechaFin && selectedDate >= fechaFin) {
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
                      color: fechaFin ? '#222' : '#888',
                    },
                  },
                  fechaFin
                    ? formatearFecha(fechaFin)
                    : 'Seleccionar fecha'
                ),
                e(Ionicons, {
                  name: 'calendar-outline',
                  size: 23,
                  color: '#D31A24',
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
            display: Platform.OS === 'ios' ? 'spinner' : 'default',
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
                backgroundColor: guardando ? '#999' : '#D31A24',
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