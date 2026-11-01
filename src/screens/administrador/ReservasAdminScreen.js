import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useReservas } from '../../hooks/useReservas';
import { actualizarEstadoReserva } from '../../services/reservas.service';

const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    if (fecha?._seconds) {
        return new Date(fecha._seconds * 1000).toLocaleDateString('es-NI');
    }

    if (fecha?.seconds) {
        return new Date(fecha.seconds * 1000).toLocaleDateString('es-NI');
    }

    if (typeof fecha === 'string') {
        const fechaConvertida = new Date(fecha);

        if (!Number.isNaN(fechaConvertida.getTime())) {
            return fechaConvertida.toLocaleDateString('es-NI');
        }

        return fecha;
    }

    if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-NI');
    }

    return 'Fecha no disponible';
};

const obtenerEstado = (estado) => {
    const estadoNormalizado = String(estado || 'pendiente')
        .toLowerCase()
        .trim()
        .replace(/_/g, ' ');

    if (estadoNormalizado === 'aprobada' || estadoNormalizado === 'aprobado') {
        return {
            texto: 'APROBADA',
            color: '#16834A',
            fondo: '#E5F5EC',
            icono: 'checkmark-circle',
        };
    }

    if (estadoNormalizado === 'rechazada' || estadoNormalizado === 'rechazado') {
        return {
            texto: 'RECHAZADA',
            color: '#D31A24',
            fondo: '#FCE8E9',
            icono: 'close-circle',
        };
    }

    if (estadoNormalizado === 'completada' || estadoNormalizado === 'completado') {
        return {
            texto: 'COMPLETADA',
            color: '#16834A',
            fondo: '#E5F5EC',
            icono: 'checkmark-done-circle',
        };
    }

    return {
        texto: 'PENDIENTE',
        color: '#B7791F',
        fondo: '#FFF3D9',
        icono: 'time',
    };
};

export default function ReservasAdminScreen() {
    const { reservas, loading, error, refrescar } = useReservas();

    const pendientes = reservas.filter(
        (item) => String(item.estado_aprobacion || 'pendiente').toLowerCase() === 'pendiente'
    ).length;

    const aprobadas = reservas.filter(
        (item) => String(item.estado_aprobacion || '').toLowerCase() === 'aprobada'
    ).length;

    const rechazadas = reservas.filter(
        (item) => String(item.estado_aprobacion || '').toLowerCase() === 'rechazada'
    ).length;

    const cambiarEstado = (id, estado) => {
        if (!id) {
            Alert.alert('Error', 'No se encontró el identificador de la reserva.');
            return;
        }

        const accion = estado === 'aprobada' ? 'aprobar' : 'rechazar';

        Alert.alert(
            'Confirmar acción',
            `¿Deseas ${accion} esta reserva?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await actualizarEstadoReserva(id, estado);

                            Alert.alert(
                                'Correcto',
                                `Reserva ${estado} correctamente.`
                            );

                            await refrescar();
                        } catch (err) {
                            Alert.alert(
                                'Error',
                                err.message || 'No se pudo actualizar la reserva.'
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderReserva = ({ item }) => {
        const id = item.id || item.id_reserva;

        const estadoOriginal = String(
            item.estado_aprobacion || 'pendiente'
        ).toLowerCase().trim();

        const estado = obtenerEstado(estadoOriginal);
        const vehiculo = item.vehiculo || {};

        return (
            <View style={styles.card}>
                <View style={styles.cardSuperior}>
                    <View style={styles.iconoVehiculo}>
                        <Ionicons
                            name="car-sport"
                            size={27}
                            color="#D31A24"
                        />
                    </View>

                    <View style={styles.infoVehiculo}>
                        <Text style={styles.vehiculo} numberOfLines={1}>
                            {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                        </Text>

                        <Text style={styles.identificador}>
                            Reserva #{String(id || 'N/D').slice(-8)}
                        </Text>
                    </View>

                    <View style={[styles.estadoBadge, { backgroundColor: estado.fondo }]}>
                        <Ionicons
                            name={estado.icono}
                            size={13}
                            color={estado.color}
                        />
                        <Text style={[styles.estadoTexto, { color: estado.color }]}>
                            {estado.texto}
                        </Text>
                    </View>
                </View>

                <View style={styles.separador} />

                <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>INFORMACIÓN DEL CLIENTE</Text>

                    <View style={styles.filaDetalle}>
                        <Ionicons name="person-outline" size={17} color="#888888" />
                        <Text style={styles.detalle} numberOfLines={2}>
                            {item.email_usuario || item.email || 'No disponible'}
                        </Text>
                    </View>
                </View>

                <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>PERÍODO DE RESERVA</Text>

                    <View style={styles.fechasContainer}>
                        <View style={styles.fechaItem}>
                            <View style={styles.fechaIcono}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={17}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={styles.fechaInfo}>
                                <Text style={styles.fechaEtiqueta}>Fecha de inicio</Text>
                                <Text style={styles.fechaValor}>
                                    {formatearFecha(item.fecha_inicio)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.fechaItem}>
                            <View style={styles.fechaIcono}>
                                <Ionicons
                                    name="calendar"
                                    size={17}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={styles.fechaInfo}>
                                <Text style={styles.fechaEtiqueta}>Fecha de finalización</Text>
                                <Text style={styles.fechaValor}>
                                    {formatearFecha(item.fecha_fin)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.totalContainer}>
                    <View>
                        <Text style={styles.totalEtiqueta}>TOTAL DE LA RESERVA</Text>
                        <Text style={styles.totalMonto}>
                            C$ {Number(item.monto_total || 0).toLocaleString('es-NI')}
                        </Text>
                    </View>

                    <Ionicons
                        name="receipt-outline"
                        size={27}
                        color="#D31A24"
                    />
                </View>

                {estadoOriginal === 'pendiente' && (
                    <View style={styles.botones}>
                        <TouchableOpacity
                            style={styles.botonAprobar}
                            onPress={() => cambiarEstado(id, 'aprobada')}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={19}
                                color="#FFFFFF"
                            />
                            <Text style={styles.textoBoton}>Aprobar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botonRechazar}
                            onPress={() => cambiarEstado(id, 'rechazada')}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="close-circle-outline"
                                size={19}
                                color="#FFFFFF"
                            />
                            <Text style={styles.textoBoton}>Rechazar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const encabezado = (
        <View>
            <View style={styles.hero}>
                <View style={styles.heroContenido}>
                    <View style={styles.heroIcono}>
                        <Ionicons name="calendar" size={25} color="#FFFFFF" />
                    </View>

                    <Text style={styles.heroTitulo}>Gestión de reservas</Text>

                    <Text style={styles.heroSubtitulo}>
                        Administra y revisa las solicitudes de alquiler de vehículos.
                    </Text>

                    <View style={styles.heroContador}>
                        <Ionicons name="document-text-outline" size={17} color="#FFFFFF" />
                        <Text style={styles.heroContadorTexto}>
                            {reservas.length} reservas registradas
                        </Text>
                    </View>
                </View>

                <View style={styles.heroDecoracion} />
            </View>

            <View style={styles.resumen}>
                <Text style={styles.resumenTitulo}>Resumen general</Text>

                <View style={styles.resumenGrid}>
                    <View style={styles.resumenCard}>
                        <View style={[styles.resumenIcono, { backgroundColor: '#FCE8E9' }]}>
                            <Ionicons name="documents-outline" size={20} color="#D31A24" />
                        </View>
                        <Text style={styles.resumenNumero}>{reservas.length}</Text>
                        <Text style={styles.resumenEtiqueta}>Total</Text>
                    </View>

                    <View style={styles.resumenCard}>
                        <View style={[styles.resumenIcono, { backgroundColor: '#FFF3D9' }]}>
                            <Ionicons name="time-outline" size={20} color="#B7791F" />
                        </View>
                        <Text style={styles.resumenNumero}>{pendientes}</Text>
                        <Text style={styles.resumenEtiqueta}>Pendientes</Text>
                    </View>

                    <View style={styles.resumenCard}>
                        <View style={[styles.resumenIcono, { backgroundColor: '#E5F5EC' }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#16834A" />
                        </View>
                        <Text style={styles.resumenNumero}>{aprobadas}</Text>
                        <Text style={styles.resumenEtiqueta}>Aprobadas</Text>
                    </View>

                    <View style={styles.resumenCard}>
                        <View style={[styles.resumenIcono, { backgroundColor: '#FCE8E9' }]}>
                            <Ionicons name="close-circle-outline" size={20} color="#D31A24" />
                        </View>
                        <Text style={styles.resumenNumero}>{rechazadas}</Text>
                        <Text style={styles.resumenEtiqueta}>Rechazadas</Text>
                    </View>
                </View>
            </View>

            <View style={styles.listaEncabezado}>
                <Text style={styles.listaTitulo}>Reservas registradas</Text>
                <Text style={styles.listaCantidad}>{reservas.length} en total</Text>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={19} color="#D31A24" />
                    <Text style={styles.error}>{error}</Text>
                </View>
            ) : null}
        </View>
    );

    if (loading && reservas.length === 0) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#D31A24" />
                <Text style={styles.cargando}>Cargando reservas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reservas}
                keyExtractor={(item, index) =>
                    String(item.id || item.id_reserva || index)
                }
                renderItem={renderReserva}
                ListHeaderComponent={encabezado}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refrescar}
                        colors={['#D31A24']}
                        tintColor="#D31A24"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.vacioContainer}>
                        <View style={styles.vacioIcono}>
                            <Ionicons
                                name="calendar-outline"
                                size={38}
                                color="#AAAAAA"
                            />
                        </View>
                        <Text style={styles.vacioTitulo}>Sin reservas todavía</Text>
                        <Text style={styles.vacio}>
                            Cuando los clientes registren reservas, aparecerán aquí.
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F7',
    },

    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
    },

    cargando: {
        marginTop: 12,
        color: '#666666',
        fontSize: 14,
    },

    lista: {
        paddingBottom: 30,
    },

    hero: {
        backgroundColor: '#121212',
        paddingTop: 55,
        paddingHorizontal: 22,
        paddingBottom: 27,
        overflow: 'hidden',
        position: 'relative',
    },

    heroContenido: {
        zIndex: 2,
    },

    heroIcono: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: '#D31A24',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 17,
    },

    heroTitulo: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },

    heroSubtitulo: {
        color: '#C4C4C4',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 7,
        maxWidth: 290,
    },

    heroContador: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#292929',
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 10,
        marginTop: 18,
        gap: 7,
    },

    heroContadorTexto: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    heroDecoracion: {
        position: 'absolute',
        width: 175,
        height: 175,
        borderRadius: 90,
        borderWidth: 28,
        borderColor: 'rgba(211,26,36,0.16)',
        right: -65,
        top: 25,
    },

    resumen: {
        paddingHorizontal: 17,
        paddingTop: 22,
    },

    resumenTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#121212',
        marginBottom: 13,
    },

    resumenGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },

    resumenCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 13,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },

    resumenIcono: {
        width: 37,
        height: 37,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    resumenNumero: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#121212',
    },

    resumenEtiqueta: {
        color: '#777777',
        fontSize: 12,
        marginTop: 3,
    },

    listaEncabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        marginTop: 25,
        marginBottom: 13,
    },

    listaTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#121212',
    },

    listaCantidad: {
        fontSize: 12,
        color: '#888888',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 17,
        padding: 16,
        marginHorizontal: 15,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },

    cardSuperior: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconoVehiculo: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FCE8E9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoVehiculo: {
        flex: 1,
        marginLeft: 11,
        marginRight: 6,
    },

    vehiculo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#121212',
    },

    identificador: {
        color: '#888888',
        fontSize: 11,
        marginTop: 4,
    },

    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderRadius: 8,
    },

    estadoTexto: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    separador: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 15,
    },

    seccion: {
        marginBottom: 16,
    },

    seccionTitulo: {
        color: '#999999',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.8,
        marginBottom: 10,
    },

    filaDetalle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    detalle: {
        color: '#444444',
        fontSize: 12,
        flex: 1,
    },

    fechasContainer: {
        backgroundColor: '#F7F7F8',
        borderRadius: 12,
        padding: 12,
        gap: 13,
    },

    fechaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    fechaIcono: {
        width: 33,
        height: 33,
        borderRadius: 10,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    fechaInfo: {
        flex: 1,
    },

    fechaEtiqueta: {
        color: '#888888',
        fontSize: 10,
        marginBottom: 3,
    },

    fechaValor: {
        color: '#333333',
        fontSize: 12,
        fontWeight: '600',
    },

    totalContainer: {
        backgroundColor: '#FFF3F3',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },

    totalEtiqueta: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#888888',
        letterSpacing: 0.6,
    },

    totalMonto: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#D31A24',
        marginTop: 5,
    },

    botones: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 15,
    },

    botonAprobar: {
        flex: 1,
        backgroundColor: '#D31A24',
        paddingVertical: 13,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },

    botonRechazar: {
        flex: 1,
        backgroundColor: '#292929',
        paddingVertical: 13,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },

    textoBoton: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FCE8E9',
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 10,
    },

    error: {
        color: '#D31A24',
        fontSize: 12,
        flex: 1,
    },

    vacioContainer: {
        alignItems: 'center',
        paddingHorizontal: 35,
        paddingTop: 30,
        paddingBottom: 40,
    },

    vacioIcono: {
        width: 75,
        height: 75,
        borderRadius: 25,
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    vacioTitulo: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 7,
    },

    vacio: {
        textAlign: 'center',
        color: '#888888',
        fontSize: 12,
        lineHeight: 19,
    },
});