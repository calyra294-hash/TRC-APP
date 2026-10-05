import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import VehicleCard from '../components/VehicleCard';
import DetalleVehiculoScreen from './DetalleVehiculoScreen';

import { useVehiculos, useCategorias } from '../hooks';

import { getReservas } from '../services/reservas.service';
import { getAlquileres } from '../services/alquileres.service';

import { styles } from './VehiculosScreen.styles.js';

export default function VehiculosScreen({ navigation }) {
  const {
    vehiculos,
    loading,
    error,
    categoriaActiva,
    setCategoriaActiva,
    refrescar,
  } = useVehiculos();

  const { categorias, loadingCategorias } =
    useCategorias();

  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState(null);

  const [reservas, setReservas] = useState([]);

  const [alquileres, setAlquileres] = useState([]);

  const [cargandoReservas, setCargandoReservas] =
    useState(true);

  const [cargandoAlquileres, setCargandoAlquileres] =
    useState(true);

  const handleSeleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

  // ==============================
  // CARGAR RESERVAS
  // ==============================
  const cargarReservas = useCallback(async () => {
    try {
      setCargandoReservas(true);

      const data = await getReservas();

      setReservas(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        'Error al cargar reservas para disponibilidad:',
        error
      );

      setReservas([]);
    } finally {
      setCargandoReservas(false);
    }
  }, []);

  // ==============================
  // CARGAR ALQUILERES
  // ==============================
  const cargarAlquileres = useCallback(async () => {
    try {
      setCargandoAlquileres(true);

      // null = consultar todos los alquileres
      const data = await getAlquileres(null);

      setAlquileres(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        'Error al cargar alquileres para disponibilidad:',
        error
      );

      setAlquileres([]);
    } finally {
      setCargandoAlquileres(false);
    }
  }, []);

  React.useEffect(() => {
    cargarReservas();
    cargarAlquileres();
  }, [
    cargarReservas,
    cargarAlquileres,
  ]);

  // ==============================
  // FORMATEAR FECHA
  // ==============================
  const formatearFecha = (fecha) => {
    if (!fecha) return null;

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
      return null;
    }

    return fechaObj.toLocaleDateString(
      'es-NI',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  // ==============================
  // OBTENER DISPONIBILIDAD
  // ==============================
  const obtenerDisponibilidad = (vehiculo) => {
    const idVehiculo = String(
      vehiculo.id ||
      vehiculo.id_coche ||
      ''
    );

    // --------------------------------
    // BUSCAR ALQUILERES DEL VEHÍCULO
    // --------------------------------
    const alquileresVehiculo =
      alquileres.filter(
        (alquiler) => {
          const idCocheAlquiler =
            String(
              alquiler.id_coche ||
              alquiler.vehiculo
                ?.id_coche ||
              ''
            );

          return (
            idCocheAlquiler ===
            idVehiculo
          );
        }
      );

    // --------------------------------
    // REVISAR SI EXISTE ALQUILER ACTIVO
    // --------------------------------
    const alquilerActivo =
      alquileresVehiculo.find(
        (alquiler) => {
          const estado =
            String(
              alquiler.estado_alquiler ||
              alquiler.estado ||
              ''
            )
              .toLowerCase()
              .trim();

          return [
            'alquilado',
            'activo',
            'en curso',
            'en_curso',
            'vigente',
          ].includes(estado);
        }
      );

    // Si está alquilado actualmente,
    // el vehículo está bloqueado.
    if (alquilerActivo) {
      const fechaFin =
        alquilerActivo.fecha_fin;

      return {
        estaReservado: true,
        fechaDisponible:
          formatearFecha(
            fechaFin
          ),
      };
    }

    // --------------------------------
    // RESERVAS DEL VEHÍCULO
    // --------------------------------
    const reservasVehiculo =
      reservas.filter(
        (reserva) => {
          const idCocheReserva =
            String(
              reserva.id_coche ||
              reserva.coche
                ?.id_coche ||
              ''
            );

          const estadoReserva =
            String(
              reserva.estado_aprobacion ||
              ''
            )
              .toLowerCase()
              .trim();

          const estadosNoBloqueantes = [
            'rechazada',
            'rechazado',
            'cancelada',
            'cancelado',
          ];

          if (
            estadosNoBloqueantes.includes(
              estadoReserva
            )
          ) {
            return false;
          }

          return (
            idCocheReserva ===
            idVehiculo
          );
        }
      );

    if (
      reservasVehiculo.length === 0
    ) {
      return {
        estaReservado: false,
        fechaDisponible: null,
      };
    }

    // --------------------------------
    // REVISAR CADA RESERVA
    // --------------------------------
    const reservasActivas =
      reservasVehiculo
        .map((reserva) => {
          const inicio =
            new Date(
              reserva.fecha_inicio
            );

          const fin =
            new Date(
              reserva.fecha_fin
            );

          if (
            isNaN(
              inicio.getTime()
            ) ||
            isNaN(
              fin.getTime()
            )
          ) {
            return null;
          }

          // Buscar alquiler relacionado
          const idReserva =
            String(
              reserva.id_reserva ||
              reserva.id ||
              ''
            );

          const alquilerRelacionado =
            alquileresVehiculo.find(
              (alquiler) =>
                String(
                  alquiler.id_reserva ||
                  ''
                ) === idReserva
            );

          // --------------------------------
          // SI EL ALQUILER YA FINALIZÓ
          // LA RESERVA YA NO BLOQUEA
          // --------------------------------
          if (
            alquilerRelacionado
          ) {
            const estadoAlquiler =
              String(
                alquilerRelacionado.estado_alquiler ||
                alquilerRelacionado.estado ||
                ''
              )
                .toLowerCase()
                .trim();

            const estadosFinalizados = [
              'finalizado',
              'finalizada',
              'completado',
              'completada',
              'cancelado',
              'cancelada',
            ];

            if (
              estadosFinalizados.includes(
                estadoAlquiler
              )
            ) {
              return null;
            }
          }

          inicio.setHours(
            0,
            0,
            0,
            0
          );

          fin.setHours(
            23,
            59,
            59,
            999
          );

          return {
            inicio,
            fin,
          };
        })
        .filter(Boolean);

    // --------------------------------
    // FECHA ACTUAL
    // --------------------------------
    const hoy = new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );

    // Solo reservas que todavía
    // no han terminado
    const reservasPendientes =
      reservasActivas
        .filter(
          (reserva) =>
            reserva.fin >= hoy
        )
        .sort(
          (a, b) =>
            a.inicio.getTime() -
            b.inicio.getTime()
        );

    if (
      reservasPendientes.length === 0
    ) {
      return {
        estaReservado: false,
        fechaDisponible: null,
      };
    }

    // --------------------------------
    // RESERVA ACTUAL
    // --------------------------------
    const reservaActual =
      reservasPendientes.find(
        (reserva) =>
          reserva.inicio <= hoy &&
          reserva.fin >= hoy
      );

    if (reservaActual) {
      const siguienteDia =
        new Date(
          reservaActual.fin
        );

      siguienteDia.setDate(
        siguienteDia.getDate() + 1
      );

      return {
        estaReservado: true,
        fechaDisponible:
          formatearFecha(
            siguienteDia
          ),
      };
    }

    // Si existe una reserva futura,
    // por ahora el vehículo sigue
    // apareciendo como disponible
    // hasta que llegue esa fecha.
    return {
      estaReservado: false,
      fechaDisponible: null,
    };
  };

  // ==============================
  // ESTADO VACÍO
  // ==============================
  const renderEmptyState = () => (
    <View
      style={
        styles.emptyContainer
      }
    >
      <Ionicons
        name="car-outline"
        size={64}
        color="#D1D5DB"
      />

      <Text
        style={
          styles.emptyTitle
        }
      >
        {error
          ? 'Error de conexión'
          : 'No hay vehículos disponibles'}
      </Text>

      <Text
        style={
          styles.emptySubtitle
        }
      >
        {error
          ? error
          : 'Intenta cambiando los filtros o vuelve más tarde.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
      >
        {/* HEADER */}
        <View
          style={
            styles.headerContainer
          }
        >
          <Text
            style={styles.title}
          >
            Vehículos
          </Text>

          <View
            style={
              styles.searchRow
            }
          >
            <View
              style={
                styles.searchBar
              }
            >
              <Ionicons
                name="search-outline"
                size={20}
                color="#9CA3AF"
              />

              <TextInput
                placeholder="Buscar vehículo..."
                placeholderTextColor="#9CA3AF"
                style={
                  styles.searchInput
                }
              />
            </View>

            <TouchableOpacity
              style={
                styles.filterButton
              }
            >
              <Ionicons
                name="options-outline"
                size={18}
                color="#E53935"
              />

              <Text
                style={
                  styles.filterButtonText
                }
              >
                Filtros
              </Text>
            </TouchableOpacity>
          </View>

          {loadingCategorias ? (
            <ActivityIndicator
              size="small"
              color="#E53935"
              style={{
                paddingVertical: 12,
              }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoriesScroll
              }
            >
              {categorias.map(
                (cat) => {
                  const isSelected =
                    categoriaActiva ===
                    cat;

                  return (
                    <TouchableOpacity
                      key={
                        cat
                      }
                      onPress={() =>
                        setCategoriaActiva(
                          cat
                        )
                      }
                      style={[
                        styles.chip,
                        isSelected &&
                        styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected &&
                          styles.chipTextActive,
                        ]}
                      >
                        {
                          cat
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
          )}
        </View>

        {/* LISTA */}
        {loading ||
          cargandoReservas ||
          cargandoAlquileres ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#E53935"
            />

            <Text
              style={{
                marginTop: 10,
                color: '#6B7280',
              }}
            >
              Consultando disponibilidad...
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehiculos}
            keyExtractor={(
              item
            ) =>
              item.id.toString()
            }
            renderItem={({
              item,
            }) => {
              const disponibilidad =
                obtenerDisponibilidad(
                  item
                );

              return (
                <VehicleCard
                  vehiculo={
                    item
                  }
                  disponibilidad={
                    disponibilidad
                  }
                  onSelect={
                    handleSeleccionarVehiculo
                  }
                />
              );
            }}
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={
              false
            }
            ListEmptyComponent={
              renderEmptyState
            }
            onRefresh={async () => {
              await refrescar();
              await cargarReservas();
              await cargarAlquileres();
            }}
            refreshing={
              loading ||
              cargandoReservas ||
              cargandoAlquileres
            }
          />
        )}

        {/* MODAL DETALLE */}
        <Modal
          visible={
            vehiculoSeleccionado !==
            null
          }
          animationType="slide"
          transparent={false}
          onRequestClose={() =>
            setVehiculoSeleccionado(
              null
            )
          }
        >
          <DetalleVehiculoScreen
            route={{
              params: {
                vehiculo:
                  vehiculoSeleccionado,
              },
            }}
            navigation={{
              goBack: () =>
                setVehiculoSeleccionado(
                  null
                ),
            }}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
}