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

import { useAlquileres } from '../../../hooks/useAlquileres';
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
            fondo: '#E8F5EC',
            texto: '#23834D',
            icono: 'checkmark-circle',
        };
    }

    if (
        estadoNormalizado.includes('cancelado') ||
        estadoNormalizado.includes('cancelada')
    ) {
        return {
            fondo: '#F1F2F4',
            texto: '#667085',
            icono: 'close-circle',
        };
    }

    if (
        estadoNormalizado.includes('alquilado') ||
        estadoNormalizado.includes('en curso') ||
        estadoNormalizado.includes('activo')
    ) {
        return {
            fondo: '#FFF3E0',
            texto: '#C77700',
            icono: 'time',
        };
    }

    return {
        fondo: '#FEE4E2',
        texto: '#D92D20',
        icono: 'alert-circle',
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
                activeOpacity={0.92}
                onPress={() =>
                    navigation.navigate('DetalleAlquiler', {
                        alquiler: item,
                    })
                }
            >
                {/* IMAGEN DEL VEHÍCULO */}
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
                                name="car-sport-outline"
                                size={58}
                                color="#C7C7C7"
                            />
                        </View>
                    )}

                    <View style={styles.imageDarkOverlay} />

                    {/* ESTADO */}
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: coloresEstado.fondo,
                            },
                        ]}
                    >
                        <Ionicons
                            name={coloresEstado.icono}
                            size={13}
                            color={coloresEstado.texto}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: coloresEstado.texto,
                                },
                            ]}
                        >
                            {estado}
                        </Text>
                    </View>

                    {/* NOMBRE DEL VEHÍCULO */}
                    <View style={styles.imageOverlay}>
                        <Text style={styles.vehicleBrand}>
                            TITO'S RENT A CAR
                        </Text>

                        <Text
                            style={styles.vehicleName}
                            numberOfLines={1}
                        >
                            {nombreVehiculo || 'Vehículo'}
                        </Text>
                    </View>
                </View>

                {/* INFORMACIÓN DEL ALQUILER */}
                <View style={styles.cardBody}>

                    {/* MONTO E IDENTIFICADOR */}
                    <View style={styles.mainInfoRow}>
                        <View style={styles.rentalIdContainer}>
                            <Text style={styles.label}>
                                ALQUILER
                            </Text>

                            <Text
                                style={styles.rentalId}
                                numberOfLines={1}
                            >
                                #{String(item.id || '').slice(-10)}
                            </Text>
                        </View>

                        <View style={styles.priceContainer}>
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

                    {/* PLACA Y DURACIÓN */}
                    <View style={styles.featuresRow}>
                        {item.vehiculo?.placa ? (
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons
                                        name="car-outline"
                                        size={17}
                                        color="#D31A24"
                                    />
                                </View>

                                <View>
                                    <Text style={styles.featureLabel}>
                                        PLACA
                                    </Text>

                                    <Text style={styles.featureValue}>
                                        {item.vehiculo.placa}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={17}
                                    color="#D31A24"
                                />
                            </View>

                            <View>
                                <Text style={styles.featureLabel}>
                                    DURACIÓN
                                </Text>

                                <Text style={styles.featureValue}>
                                    {item.cantidad_dias || 0} días
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* FECHAS */}
                    <View style={styles.datesContainer}>
                        <View style={styles.dateItem}>
                            <View style={styles.dateIconContainer}>
                                <Ionicons
                                    name="log-in-outline"
                                    size={17}
                                    color="#23834D"
                                />
                            </View>

                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>
                                    ENTREGA
                                </Text>

                                <Text style={styles.dateValue}>
                                    {formatearFecha(item.fecha_entrega)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.dateDivider} />

                        <View style={styles.dateItem}>
                            <View style={styles.dateIconContainer}>
                                <Ionicons
                                    name="log-out-outline"
                                    size={17}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>
                                    DEVOLUCIÓN
                                </Text>

                                <Text style={styles.dateValue}>
                                    {formatearFecha(item.fecha_devolucion)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* VER DETALLES */}
                    <View style={styles.detailButton}>
                        <Text style={styles.detailText}>
                            Ver detalles del alquiler
                        </Text>

                        <Ionicons
                            name="arrow-forward-circle"
                            size={21}
                            color="#D31A24"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons
                    name="car-sport-outline"
                    size={55}
                    color="#D31A24"
                />
            </View>

            <Text style={styles.emptyTitle}>
                {error
                    ? 'Error de conexión'
                    : 'Aún no tienes alquileres'}
            </Text>

            <Text style={styles.emptySubtitle}>
                {error
                    ? error
                    : 'Cuando alquiles un vehículo, aquí podrás consultar su información e historial.'}
            </Text>

            {!error ? (
                <View style={styles.emptyDecoration}>
                    <Ionicons
                        name="time-outline"
                        size={15}
                        color="#98A2B3"
                    />

                    <Text style={styles.emptyDecorationText}>
                        Tu historial aparecerá aquí
                    </Text>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* ENCABEZADO */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerEyebrow}>
                                TITO'S RENT A CAR
                            </Text>

                            <Text style={styles.title}>
                                Mis alquileres
                            </Text>
                        </View>

                        <View style={styles.headerIcon}>
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color="#D31A24"
                            />
                        </View>
                    </View>

                    <Text style={styles.subtitle}>
                        Consulta tus vehículos alquilados y revisa su historial.
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#D31A24"
                        />

                        <Text style={styles.loadingText}>
                            Cargando tus alquileres...
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