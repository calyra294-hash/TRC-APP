import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleCard({ vehiculo, onSelect }) {
  const { nombre, categoria, rating, resenas, precio, imagen, pasajeros, transmision, combustible } = vehiculo;

  return (
    <View style={styles.cardContainer}>
      {/* Imagen y Badges Flotantes */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imagen }} style={styles.image} resizeMode="cover" />
        
        {/* Badge Categoria (Top Left) */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoria}</Text>
        </View>

        {/* Badge Rating (Bottom Left) */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.reviewsText}>({resenas})</Text>
        </View>
      </View>

      {/* Detalles del Vehículo */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{nombre}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${precio}</Text>
            <Text style={styles.pricePeriod}>/día</Text>
          </View>
        </View>

        {/* Specs / Tags de características */}
        <View style={styles.specsRow}>
          <View style={styles.specTag}>
            <Text style={styles.specText}>{pasajeros} pasaj.</Text>
          </View>
          <View style={styles.specTag}>
            <Text style={styles.specText}>{transmision}</Text>
          </View>
          <View style={styles.specTag}>
            <Text style={styles.specText}>{combustible}</Text>
          </View>
        </View>

        {/* Botón Acción */}
        <TouchableOpacity style={styles.selectButton} activeOpacity={0.8} onPress={() => onSelect(vehiculo)}>
          <Text style={styles.selectButtonText}>SELECCIONAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsText: {
    color: '#D0D0D0',
    fontSize: 11,
  },
  detailsContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#8E8E93',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  specTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  specText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});