import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { styles } from './VehicleCard.styles.js';

const formatearFecha = (fecha) => {
  if (!fecha) return '';

  const partes = String(fecha).split('-');

  if (partes.length !== 3) return fecha;

  const [anio, mes, dia] = partes;

  const fechaLocal = new Date(
    Date.UTC(Number(anio), Number(mes) - 1, Number(dia))
  );

  return new Intl.DateTimeFormat('es-NI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(fechaLocal);
};

export default function VehicleCard({
  vehiculo,
  onSelect,
  disponibilidad,
}) {
  const {
    nombre,
    categoria,
    rating = 5.0,
    resenas = 0,
    precio,
    imagen,
    pasajeros = 5,
    transmision = 'Manual',
    combustible = 'Gasolina',
  } = vehiculo;

  const estaReservado = disponibilidad?.ocupado_actualmente || false;
  const reservadoHasta = disponibilidad?.reservado_hasta || null;
  const disponibleDesde = disponibilidad?.disponible_desde || null;
  const disponibleHasta = disponibilidad?.disponible_hasta || null;
  const proximaReserva = disponibilidad?.proxima_reserva_inicio || null;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imagen }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoria}</Text>
        </View>

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>
            {Number(rating).toFixed(1)}
          </Text>
          <Text style={styles.reviewsText}>({resenas})</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {nombre}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${precio}</Text>
            <Text style={styles.pricePeriod}>/día</Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specTag}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.specText}>{pasajeros} pasaj.</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="hardware-chip-outline" size={14} color="#6B7280" />
            <Text style={styles.specText}>{transmision}</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="flame-outline" size={14} color="#6B7280" />
            <Text style={styles.specText}>{combustible}</Text>
          </View>
        </View>

        {estaReservado ? (
          <View style={styles.availabilityReserved}>
            <View style={styles.availabilityHeader}>
              <View style={styles.availabilityIconReserved}>
                <Ionicons name="time-outline" size={19} color="#B45309" />
              </View>

              <View style={styles.availabilityTitleContainer}>
                <Text style={styles.availabilityTitleReserved}>
                  Reservado actualmente
                </Text>
                <Text style={styles.availabilitySubtitleReserved}>
                  Este vehículo tiene una reserva en curso.
                </Text>
              </View>
            </View>

            {reservadoHasta ? (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabelReserved}>
                  Reservado hasta
                </Text>
                <Text style={styles.dateValueReserved}>
                  {formatearFecha(reservadoHasta)}
                </Text>
              </View>
            ) : null}

            {disponibleDesde ? (
              <View style={styles.availableDateBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#15803D"
                />
                <View style={styles.availableDateTextContainer}>
                  <Text style={styles.availableDateLabel}>
                    Disponible desde
                  </Text>
                  <Text style={styles.availableDateValue}>
                    {formatearFecha(disponibleDesde)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.availabilityAvailable}>
            <View style={styles.availabilityHeader}>
              <View style={styles.availabilityIconAvailable}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#15803D"
                />
              </View>

              <View style={styles.availabilityTitleContainer}>
                <Text style={styles.availabilityTitleAvailable}>
                  Disponible para reservar
                </Text>
                <Text style={styles.availabilitySubtitleAvailable}>
                  Podés consultar las fechas de alquiler.
                </Text>
              </View>
            </View>

            {proximaReserva && disponibleHasta ? (
              <View style={styles.nextReservationBox}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabelAvailable}>
                    Disponible hasta
                  </Text>
                  <Text style={styles.dateValueAvailable}>
                    {formatearFecha(disponibleHasta)}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabelAvailable}>
                    Próxima reserva
                  </Text>
                  <Text style={styles.dateValueAvailable}>
                    {formatearFecha(proximaReserva)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        <TouchableOpacity
          style={styles.selectButton}
          activeOpacity={0.8}
          onPress={() => onSelect && onSelect(vehiculo)}
        >
          <Text style={styles.selectButtonText}>
            SELECCIONAR
          </Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}