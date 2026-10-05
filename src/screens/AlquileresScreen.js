import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAlquileres } from '../hooks/useAlquileres';
import { styles } from './AlquileresScreen.styles';

const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    try {
        let fechaObj;

        if (fecha._seconds) {
            fechaObj = new Date(fecha._seconds * 1000);
        } else if (fecha.seconds) {
            fechaObj = new Date(fecha.seconds * 1000);
        } else {
            fechaObj = new Date(fecha);
        }

        if (isNaN(fechaObj.getTime())) {
            return 'Sin fecha';
        }

        return fechaObj.toLocaleDateString('es-NI', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (error) {
        return 'Sin fecha';
    }
};

const obtenerColorEstado = (estado) => {
    const estadoNormalizado = String(estado || '').toLowerCase();

    if (
        estadoNormalizado.includes('completado') ||
        estadoNormalizado.includes('finalizado')
    ) {
        return {
            fondo: '#E6F4EA',
            texto: '#0F9D58',
        };
    }

    if (
        estadoNormalizado.includes('cancelado') ||
        estadoNormalizado.includes('cancelada')
    ) {
        return {
            fondo: '#F2F4F7',
            texto: '#667085',
        };
    }

    if (
        estadoNormalizado.includes('alquilado') ||
        estadoNormalizado.includes('en curso') ||
        estadoNormalizado.includes('activo')
    ) {
        return {
            fondo: '#FFF4E5',
            texto: '#D97706',
        };
    }

    return {
        fondo: '#FEE4E2',
        texto: '#D92D20',
    };
};

const formatearEstado = (estado) => {
    if (!estado) return 'Sin estado';

    const texto = String(estado).toLowerCase();

    if (
        texto === 'alquilado' ||
        texto === 'activo' ||
        texto === 'en curso'
    ) {
        return 'En curso';
    }

    if (
        texto === 'completado' ||
        texto === 'finalizado'
    ) {
        return 'Completado';
    }

    if (
        texto === 'cancelado' ||
        texto === 'cancelada'
    ) {
        return 'Cancelado';
    }

    return estado;
};

export default function AlquileresScreen({ navigation }) {
    const {
        alquileres,
        loading,
        error,
        refrescar,
    } = useAlquileres();

    useFocusEffect(
        useCallback(() => {
            refrescar();
        }, [refrescar])
    );

    const renderAlquiler = ({ item }) => {
        const estado = formatearEstado(item.estado_alquiler);
        const coloresEstado = obtenerColorEstado(estado);

        const nombreVehiculo =
            `${item.vehiculo?.marca || ''} ${item.vehiculo?.modelo || ''}`.trim();

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() =>
                    navigation.navigate('DetalleAlquiler', {
                        alquiler: item,
                    })
                }
            >
                <View style={styles.imageContainer}>
                    {item.vehiculo?.foto_principal ? (
                        <Image
                            source={{
                                uri: item.vehiculo.foto_principal,
                            }}
                            style={styles.vehicleImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons
                                name="car-outline"
                                size={50}
                                color="#D1D5DB"
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    coloresEstado.fondo,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        coloresEstado.texto,
                                },
                            ]}
                        >
                            {estado}
                        </Text>
                    </View>

                    <View style={styles.imageOverlay}>
                        <Text
                            style={styles.vehicleName}
                            numberOfLines={1}
                        >
                            {nombreVehiculo || 'Vehículo'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoColumn}>
                            <Text style={styles.label}>
                                ID DEL ALQUILER
                            </Text>

                            <Text
                                style={styles.value}
                                numberOfLines={1}
                            >
                                {item.id}
                            </Text>
                        </View>

                        <View style={styles.infoColumnRight}>
                            <Text style={styles.label}>
                                MONTO FINAL
                            </Text>

                            <Text style={styles.price}>
                                ${Number(
                                    item.monto_final || 0
                                ).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {item.vehiculo?.placa ? (
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.label}>
                                    PLACA
                                </Text>

                                <Text style={styles.value}>
                                    {item.vehiculo.placa}
                                </Text>
                            </View>

                            <View style={styles.infoColumnRight}>
                                <Text style={styles.label}>
                                    DÍAS
                                </Text>

                                <Text style={styles.value}>
                                    {item.cantidad_dias || 0}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    <View style={styles.dateRow}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateLabel}>
                                ENTREGA
                            </Text>

                            <Text style={styles.dateValue}>
                                {formatearFecha(
                                    item.fecha_entrega
                                )}
                            </Text>
                        </View>

                        <View style={styles.dateBox}>
                            <Text style={styles.dateLabel}>
                                DEVOLUCIÓN
                            </Text>

                            <Text style={styles.dateValue}>
                                {formatearFecha(
                                    item.fecha_devolucion
                                )}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailButton}>
                        <Text style={styles.detailText}>
                            Ver detalles
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#E53935"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="car-outline"
                size={64}
                color="#D1D5DB"
            />

            <Text style={styles.emptyTitle}>
                {error
                    ? 'Error de conexión'
                    : 'No tienes alquileres'}
            </Text>

            <Text style={styles.emptySubtitle}>
                {error
                    ? error
                    : 'Aquí aparecerán los vehículos que hayas alquilado.'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Mis Alquileres
                    </Text>

                    <Text style={styles.subtitle}>
                        Consulta tus alquileres y su estado
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#E53935"
                        />

                        <Text style={styles.loadingText}>
                            Cargando alquileres...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={alquileres}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderAlquiler}
                        contentContainerStyle={[
                            styles.listContent,
                            alquileres.length === 0 &&
                            styles.emptyListContent,
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        onRefresh={refrescar}
                        refreshing={loading}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}