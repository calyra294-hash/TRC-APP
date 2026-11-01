
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
          <View
            style={{
              marginTop: 10,
              marginBottom: 8,
              padding: 10,
              borderRadius: 10,
              backgroundColor: '#FFF4E5',
            }}
          >
            <Text style={{ color: '#B45309', fontWeight: '700', fontSize: 13 }}>
              <Ionicons name="time-outline" size={14} />
              {' '}Reservado actualmente
            </Text>

            {reservadoHasta ? (
              <Text style={{ color: '#92400E', fontSize: 12, marginTop: 4 }}>
                Reservado hasta: {formatearFecha(reservadoHasta)}
              </Text>
            ) : null}

            {disponibleDesde ? (
              <Text
                style={{
                  color: '#92400E',
                  fontSize: 12,
                  marginTop: 3,
                  fontWeight: '600',
                }}
              >
                Disponible desde: {formatearFecha(disponibleDesde)}
              </Text>
            ) : null}
          </View>
        ) : disponibilidad && proximaReserva ? (
          <View
            style={{
              marginTop: 10,
              marginBottom: 8,
              padding: 10,
              borderRadius: 10,
              backgroundColor: '#E6F4EA',
            }}
          >
            <Text style={{ color: '#15803D', fontWeight: '700', fontSize: 13 }}>
              ✓ Disponible para reservar
            </Text>

            {disponibleHasta ? (
              <Text style={{ color: '#166534', fontSize: 12, marginTop: 4 }}>
                Disponible hasta: {formatearFecha(disponibleHasta)}
              </Text>
            ) : null}

            <Text style={{ color: '#166534', fontSize: 12, marginTop: 3 }}>
              Próxima reserva: {formatearFecha(proximaReserva)}
            </Text>
          </View>
        ) : (
          <View
            style={{
              marginTop: 10,
              marginBottom: 8,
              padding: 10,
              borderRadius: 10,
              backgroundColor: '#E6F4EA',
            }}
          >
            <Text style={{ color: '#15803D', fontWeight: '700', fontSize: 13 }}>
              ✓ Disponible para reservar
            </Text>
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
        </TouchableOpacity>
      </View>
    </View>
  );
}
