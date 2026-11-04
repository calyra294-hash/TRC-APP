
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext.js';
import { crearEstilos } from './VehicleCard.styles.js';

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
  resumenResenas,
}) {
  const { theme, isDark } = useTheme();

  const styles = useMemo(
    () => crearEstilos(theme, isDark),
    [theme, isDark]
  );

  const {
    nombre,
    categoria,
    precio,
    imagen,
    pasajeros = 5,
    transmision = 'Manual',
    combustible = 'Gasolina',
  } = vehiculo;

  const promedio = Number(resumenResenas?.promedio || 0);
  const totalResenas = Number(resumenResenas?.total || 0);

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
          {totalResenas > 0 ? (
            <>
              <Ionicons name="star" size={14} color="#FFB800" />

              <Text style={styles.ratingText}>
                {promedio.toFixed(1)}
              </Text>

              <Text style={styles.reviewsText}>
                ({totalResenas})
              </Text>
            </>
          ) : (
            <Text style={styles.reviewsText}>
              Sin reseñas
            </Text>
          )}
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {nombre}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>C$ {precio}</Text>
            <Text style={styles.pricePeriod}>/día</Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specTag}>
            <Ionicons name="people-outline" size={14} color={theme.secondaryText} />
            <Text style={styles.specText}>{pasajeros} pasaj.</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="hardware-chip-outline" size={14} color={theme.secondaryText} />
            <Text style={styles.specText}>{transmision}</Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons name="flame-outline" size={14} color={theme.secondaryText} />
            <Text style={styles.specText}>{combustible}</Text>
          </View>
        </View>

        {estaReservado ? (
          <View style={styles.availabilityReserved}>
            <Text style={styles.availabilityTitleReserved}>
              <Ionicons name="time-outline" size={14} color="#D97706" />
              {' '}Reservado actualmente
            </Text>

            {reservadoHasta ? (
              <Text style={styles.availabilitySubtitleReserved}>
                Reservado hasta: {formatearFecha(reservadoHasta)}
              </Text>
            ) : null}

            {disponibleDesde ? (
              <Text style={styles.availabilitySubtitleReserved}>
                Disponible desde: {formatearFecha(disponibleDesde)}
              </Text>
            ) : null}
          </View>
        ) : disponibilidad && proximaReserva ? (
          <View style={styles.availabilityAvailable}>
            <Text style={styles.availabilityTitleAvailable}>
              ✓ Disponible para reservar
            </Text>

            {disponibleHasta ? (
              <Text style={styles.availabilitySubtitleAvailable}>
                Disponible hasta: {formatearFecha(disponibleHasta)}
              </Text>
            ) : null}

            <Text style={styles.availabilitySubtitleAvailable}>
              Próxima reserva: {formatearFecha(proximaReserva)}
            </Text>
          </View>
        ) : (
          <View style={styles.availabilityAvailable}>
            <Text style={styles.availabilityTitleAvailable}>
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
