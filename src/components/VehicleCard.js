import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './VehicleCard.styles.js';

export default function VehicleCard({ vehiculo, onSelect }) {
  const {
    nombre,
    categoria,
    rating = 5.0,
    resenas = 0,
    precio,
    imagen,
    pasajeros = 5,
    transmision = 'Manual',
    combustible = 'Gasolina'
  } = vehiculo;

  return (
    <View style={styles.cardContainer}>
      {/* Imagen y Badges Flotantes */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imagen }} style={styles.image} resizeMode="cover" />

        {/* Badge Categoria */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoria}</Text>
        </View>

        {/* Badge Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({resenas})</Text>
        </View>
      </View>

      {/* Detalles del Vehículo */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{nombre}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${precio}</Text>
            <Text style={styles.pricePeriod}>/día</Text>
          </View>
        </View>

        {/* Specs / Tags de características */}
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

        {/* Botón Acción - Llama a la prop onSelect pasándole el objeto vehiculo */}
        <TouchableOpacity
          style={styles.selectButton}
          activeOpacity={0.8}
          onPress={() => onSelect && onSelect(vehiculo)}
        >
          <Text style={styles.selectButtonText}>SELECCIONAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}