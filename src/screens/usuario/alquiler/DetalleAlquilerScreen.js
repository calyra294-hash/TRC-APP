import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './DetalleAlquilerScreen.styles';

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

const obtenerEstado = (estado) => {
    const estadoNormalizado = String(estado || '').toLowerCase();

    if (
        estadoNormalizado.includes('completado') ||
        estadoNormalizado.includes('finalizado')
    ) {
        return {
            nombre: 'Completado',
            fondo: '#E6F4EA',
            texto: '#0F9D58',
        };
    }

    if (estadoNormalizado.includes('cancelado')) {
        return {
            nombre: 'Cancelado',
            fondo: '#F2F4F7',
            texto: '#667085',
        };
    }

    return {
        nombre: 'En curso',
        fondo: '#FEE4E2',
        texto: '#D92D20',
    };
};

export default function DetalleAlquilerScreen({ route, navigation }) {
    const alquiler = route?.params?.alquiler;

    if (!alquiler) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={60}
                        color="#D92D20"
                    />

                    <Text style={styles.errorTitle}>
                        No se encontró el alquiler
                    </Text>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const estado = obtenerEstado(alquiler.estado_alquiler);

    const nombreVehiculo = `${alquiler.vehiculo?.marca || 'Vehículo'} ${alquiler.vehiculo?.modelo || ''
        }`.trim();

    const esCancelado = estado.nombre === 'Cancelado';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#101828"
                        />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            Detalle del alquiler
                        </Text>

                        <Text style={styles.headerId}>
                            {alquiler.id}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.headerStatus,
                            { backgroundColor: estado.fondo },
                        ]}
                    >
                        <Text
                            style={[
                                styles.headerStatusText,
                                { color: estado.texto },
                            ]}
                        >
                            {estado.nombre}
                        </Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <View style={styles.vehicleCard}>
                        <View style={styles.vehicleImageContainer}>
                            {alquiler.vehiculo?.foto_principal ? (
                                <Image
                                    source={{
                                        uri: alquiler.vehiculo.foto_principal,
                                    }}
                                    style={styles.vehicleImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons
                                        name="car-outline"
                                        size={60}
                                        color="#D1D5DB"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.vehicleInfo}>
                            <View style={styles.vehicleTextContainer}>
                                <Text style={styles.vehicleName}>
                                    {nombreVehiculo}
                                </Text>

                                <Text style={styles.vehicleLabel}>
                                    Vehículo alquilado
                                </Text>
                            </View>

                            <View style={styles.amountContainer}>
                                <Text style={styles.amountLabel}>
                                    TOTAL
                                </Text>

                                <Text style={styles.amount}>
                                    ${esCancelado ? '0.00' : alquiler.monto_final.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>
                        FECHAS DEL ALQUILER
                    </Text>

                    <View style={styles.dateRow}>
                        <View style={styles.dateBox}>
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#E53935"
                            />

                            <Text style={styles.dateLabel}>
                                ENTREGA
                            </Text>

                            <Text style={styles.dateValue}>
                                {esCancelado
                                    ? 'Sin entrega'
                                    : formatearFecha(alquiler.fecha_entrega)}
                            </Text>
                        </View>

                        <View style={styles.dateBox}>
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#E53935"
                            />

                            <Text style={styles.dateLabel}>
                                DEVOLUCIÓN
                            </Text>

                            <Text style={styles.dateValue}>
                                {esCancelado
                                    ? 'Sin devolución'
                                    : formatearFecha(alquiler.fecha_devolucion)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>
                        ESPECIFICACIONES DEL ALQUILER
                    </Text>

                    <View style={styles.specificationsCard}>
                        <View style={styles.specificationRow}>
                            <View style={styles.specificationIcon}>
                                <Ionicons
                                    name="car-outline"
                                    size={21}
                                    color="#E53935"
                                />
                            </View>

                            <View style={styles.specificationText}>
                                <Text style={styles.specificationLabel}>
                                    Estado general del vehículo
                                </Text>

                                <Text style={styles.specificationValue}>
                                    {esCancelado
                                        ? 'Sin entrega'
                                        : alquiler.especificaciones?.estado_general ||
                                        'No especificado'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.specificationRow}>
                            <View style={styles.specificationIcon}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={21}
                                    color="#E53935"
                                />
                            </View>

                            <View style={styles.specificationText}>
                                <Text style={styles.specificationLabel}>
                                    Kilometraje de devolución
                                </Text>

                                <Text style={styles.specificationValue}>
                                    {esCancelado
                                        ? 'No aplica'
                                        : alquiler.especificaciones
                                            ?.kilometraje_devolucion || 'No aplica'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.specificationRow}>
                            <View style={styles.specificationIcon}>
                                <Ionicons
                                    name="water-outline"
                                    size={21}
                                    color="#E53935"
                                />
                            </View>

                            <View style={styles.specificationText}>
                                <Text style={styles.specificationLabel}>
                                    Nivel de combustible
                                </Text>

                                <Text style={styles.specificationValue}>
                                    {esCancelado
                                        ? 'No aplica'
                                        : alquiler.especificaciones?.nivel_combustible ||
                                        'No aplica'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.reservationContainer}>
                        <Text style={styles.reservationLabel}>
                            ID DE RESERVA
                        </Text>

                        <Text style={styles.reservationId}>
                            {alquiler.id_reserva || 'Sin reserva'}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}