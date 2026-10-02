import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DetalleVehiculoScreen.styles.js';

const e = React.createElement;

export default function DetalleVehiculoScreen({ route, navigation }) {
  const { vehiculo } = route.params || {};

  // El servicio ya nos entrega el objeto parseado, pero mantenemos este useMemo como capa extra de defensa de UI
  const detalles = useMemo(() => {
    if (!vehiculo) return {};
    if (typeof vehiculo.detalles_tecnicos === 'object' && vehiculo.detalles_tecnicos !== null) {
      return vehiculo.detalles_tecnicos;
    }
    return {
      pasajeros: vehiculo.pasajeros || 5,
      combustible: vehiculo.combustible || 'Gasolina',
      transmision: vehiculo.transmision || 'Manual',
      maletero: vehiculo.maletero || '850L'
    };
  }, [vehiculo]);

  if (!vehiculo) {
    return e(
      SafeAreaView,
      { style: styles.container },
      e(Text, { style: styles.errorText }, 'No se seleccionó ningún vehículo.')
    );
  }

  return e(
    View,
    { style: styles.container },
    e(
      ScrollView,
      { 
        showsVerticalScrollIndicator: false, 
        contentContainerStyle: styles.scrollContent 
      },
      
      // --- IMAGEN CABECERA ---
      e(
        View,
        { style: styles.imageContainer },
        e(Image, {
          source: { uri: vehiculo.url_imagen || vehiculo.imagen },
          style: styles.vehicleImage,
          resizeMode: 'cover',
        }),
        
        // Botón Regresar
        e(
          TouchableOpacity,
          {
            style: styles.backButton,
            activeOpacity: 0.8,
            onPress: () => navigation.goBack(),
          },
          e(Ionicons, { name: 'chevron-back', size: 24, color: '#333' })
        ),

        // Badge Categoría
        e(
          View,
          { style: styles.badge4x4 },
          e(Text, { style: styles.badge4x4Text }, vehiculo.categoria_nombre || vehiculo.categoria || '4x4')
        )
      ),

      // --- TARJETA DE DETALLES ---
      e(
        View,
        { style: styles.infoCard },
        
        // Título y Precio
        e(
          View,
          { style: styles.headerRow },
          e(
            View,
            { style: { flex: 1 } },
            e(Text, { style: styles.title }, vehiculo.nombre || `${vehiculo.marca} ${vehiculo.modelo}`),
            e(
              View,
              { style: styles.ratingRow },
              e(Ionicons, { name: 'star', size: 16, color: '#FFC107' }),
              e(Ionicons, { name: 'star', size: 16, color: '#FFC107' }),
              e(Ionicons, { name: 'star', size: 16, color: '#FFC107' }),
              e(Ionicons, { name: 'star', size: 16, color: '#FFC107' }),
              e(Ionicons, { name: 'star', size: 16, color: '#FFC107' }),
              e(
                Text,
                { style: styles.ratingText },
                '4.8 ',
                e(Text, { style: styles.reviewsText }, '(124 reseñas)')
              )
            )
          ),
          e(
            View,
            { style: styles.priceContainer },
            e(Text, { style: styles.priceText }, `$${vehiculo.valor_dia || vehiculo.precio}`),
            e(Text, { style: styles.perDayText }, '/día')
          )
        ),

        // Grid Características
        e(Text, { style: styles.sectionTitle }, 'Características'),
        e(
          View,
          { style: styles.gridContainer },
          
          // Pasajeros
          e(
            View,
            { style: styles.gridItem },
            e(Ionicons, { name: 'people', size: 24, color: '#4C1D95' }),
            e(
              View,
              { style: styles.gridTextContainer },
              e(Text, { style: styles.gridLabel }, 'PASAJEROS'),
              e(Text, { style: styles.gridValue }, `${detalles.pasajeros ?? vehiculo.pasajeros ?? 5} personas`)
            )
          ),

          // Transmisión
          e(
            View,
            { style: styles.gridItem },
            e(Ionicons, { name: 'cog', size: 24, color: '#4C1D95' }),
            e(
              View,
              { style: styles.gridTextContainer },
              e(Text, { style: styles.gridLabel }, 'TRANSMISIÓN'),
              e(Text, { style: styles.gridValue }, detalles.transmision || vehiculo.transmision || 'Manual')
            )
          ),

          // Combustible
          e(
            View,
            { style: styles.gridItem },
            e(Ionicons, { name: 'color-fill', size: 24, color: '#E53935' }),
            e(
              View,
              { style: styles.gridTextContainer },
              e(Text, { style: styles.gridLabel }, 'COMBUSTIBLE'),
              e(Text, { style: styles.gridValue }, detalles.combustible || vehiculo.combustible || 'Gasolina')
            )
          ),

          // Maletero
          e(
            View,
            { style: styles.gridItem },
            e(Ionicons, { name: 'briefcase', size: 24, color: '#0284C7' }),
            e(
              View,
              { style: styles.gridTextContainer },
              e(Text, { style: styles.gridLabel }, 'MALETERO'),
              e(Text, { style: styles.gridValue }, detalles.maletero || vehiculo.maletero || '850L')
            )
          )
        ),

        // Descripción
        e(Text, { style: styles.sectionTitle }, 'Descripción'),
        e(
          Text,
          { style: styles.descriptionText },
          vehiculo.descripcion
        )
      )
    ),

    // --- BARRA INFERIOR DE RESERVA ---
    e(
      View,
      { style: styles.footerContainer },
      e(
        View,
        null,
        e(Text, { style: styles.footerSubText }, 'Precio por día'),
        e(
          Text,
          { style: styles.footerPrice },
          `$${vehiculo.valor_dia || vehiculo.precio} `,
          e(Text, { style: styles.currencyText }, 'USD')
        )
      ),
      e(
        TouchableOpacity,
        {
          style: styles.reserveButton,
          activeOpacity: 0.8,
          onPress: () => console.log('Iniciar Reserva para:', vehiculo.id_coche || vehiculo.id),
        },
        e(Text, { style: styles.reserveButtonText }, 'RESERVAR AHORA')
      )
    )
  );
}