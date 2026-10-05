import React from 'react';

import { View, Text, Image, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { styles } from './VehicleCard.styles.js';

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

  const estaReservado = disponibilidad?.estaReservado || false;

  const fechaDisponible =
    disponibilidad?.fechaDisponible || null;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imagen }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {categoria}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Ionicons
            name="star"
            size={14}
            color="#FFB800"
          />

          <Text style={styles.ratingText}>
            {Number(rating).toFixed(1)}
          </Text>

          <Text style={styles.reviewsText}>
            ({resenas})
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {nombre}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${precio}
            </Text>

            <Text style={styles.pricePeriod}>
              /día
            </Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specTag}>
            <Ionicons
              name="people-outline"
              size={14}
              color="#6B7280"
            />

            <Text style={styles.specText}>
              {pasajeros} pasaj.
            </Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons
              name="hardware-chip-outline"
              size={14}
              color="#6B7280"
            />

            <Text style={styles.specText}>
              {transmision}
            </Text>
          </View>

          <View style={styles.specTag}>
            <Ionicons
              name="flame-outline"
              size={14}
              color="#6B7280"
            />

            <Text style={styles.specText}>
              {combustible}
            </Text>
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
            <Text
              style={{
                color: '#B45309',
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              🔒 Reservado actualmente
            </Text>

            {fechaDisponible ? (
              <Text
                style={{
                  color: '#92400E',
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Disponible nuevamente el{' '}
                {fechaDisponible}
              </Text>
            ) : null}
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
            <Text
              style={{
                color: '#15803D',
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              ✓ Disponible para reservar
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.selectButton,
            estaReservado && {
              opacity: 0.5,
            },
          ]}
          activeOpacity={0.8}
          disabled={estaReservado}
          onPress={() =>
            onSelect && onSelect(vehiculo)
          }
        >
          <Text style={styles.selectButtonText}>
            {estaReservado
              ? 'NO DISPONIBLE'
              : 'SELECCIONAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}