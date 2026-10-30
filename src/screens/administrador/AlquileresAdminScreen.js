
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlquileres } from '../../hooks/useAlquileres';

function formatearFecha(fecha) {
    if (!fecha) return 'No disponible';

    try {
        let valor = fecha;

        if (typeof valor === 'object') {
            if (typeof valor.toDate === 'function') {
                valor = valor.toDate();
            } else if (valor._seconds) {
                valor = new Date(valor._seconds * 1000);
            } else if (valor.seconds) {
                valor = new Date(valor.seconds * 1000);
            }
        }

        const date = new Date(valor);

        if (Number.isNaN(date.getTime())) return 'No disponible';

        return date.toLocaleDateString('es-NI');
    } catch {
        return 'No disponible';
    }
}

function obtenerEstado(estado) {
    const valor = String(estado || 'Sin estado').toLowerCase();

    if (valor.includes('activo') || valor.includes('curso')) {
        return { texto: 'EN CURSO', color: '#D97706', fondo: '#FEF3C7' };
    }

    if (valor.includes('pendiente')) {
        return { texto: 'PENDIENTE', color: '#B45309', fondo: '#FEF3C7' };
    }

    if (valor.includes('completado') || valor.includes('finalizado')) {
        return { texto: 'COMPLETADO', color: '#15803D', fondo: '#DCFCE7' };
    }

    if (valor.includes('cancelado')) {
        return { texto: 'CANCELADO', color: '#B91C1C', fondo: '#FEE2E2' };
    }

    return { texto: valor.toUpperCase(), color: '#555555', fondo: '#EEEEEE' };
}

export default function AlquileresAdminScreen() {
    const {
        alquileres,
        loading,
        error,
        refrescar,
    } = useAlquileres();

    const renderAlquiler = ({ item }) => {
        const estado = obtenerEstado(item.estado_alquiler);
        const vehiculo = item.vehiculo || {};

        const identificador =
            item.id_alquiler || item.id || item.id_reserva || 'Sin ID';

        const monto = Number(item.monto_final || 0);

        return (
            <View style={styles.card}>
                <View style={styles.encabezado}>
                    <View style={styles.iconoVehiculo}>
                        <Ionicons name="car-sport" size={27} color="#D31A24" />
                    </View>

                    <View style={styles.infoVehiculo}>
                        <Text style={styles.vehiculo}>
                            {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                        </Text>
                        <Text style={styles.placa}>
                            Placa: {vehiculo.placa || 'No disponible'}
                        </Text>
                    </View>

                    <View style={[styles.estado, { backgroundColor: estado.fondo }]}>
                        <Text style={[styles.estadoTexto, { color: estado.color }]}>
                            {estado.texto}
                        </Text>
                    </View>
                </View>

                <View style={styles.divisor} />

                <View style={styles.dato}>
                    <Ionicons name="document-text-outline" size={17} color="#777777" />
                    <Text style={styles.datoTexto}>Alquiler: {identificador}</Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons name="calendar-outline" size={17} color="#777777" />
                    <Text style={styles.datoTexto}>
                        Inicio: {formatearFecha(item.fecha_inicio)}
                    </Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons name="calendar" size={17} color="#777777" />
                    <Text style={styles.datoTexto}>
                        Finalización: {formatearFecha(item.fecha_fin)}
                    </Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons name="time-outline" size={17} color="#777777" />
                    <Text style={styles.datoTexto}>
                        Duración: {item.cantidad_dias || 'No disponible'} días
                    </Text>
                </View>

                <View style={styles.total}>
                    <Text style={styles.totalEtiqueta}>Monto final</Text>
                    <Text style={styles.totalMonto}>
                        C$ {monto.toLocaleString('es-NI')}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading && alquileres.length === 0) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#D31A24" />
                <Text style={styles.cargandoTexto}>Cargando alquileres...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.encabezadoPantalla}>
                <View>
                    <Text style={styles.titulo}>Gestión de alquileres</Text>
                    <Text style={styles.subtitulo}>
                        Consulta los alquileres registrados
                    </Text>
                </View>

                <View style={styles.contador}>
                    <Text style={styles.contadorNumero}>{alquileres.length}</Text>
                    <Text style={styles.contadorTexto}>Total</Text>
                </View>
            </View>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : null}

            <FlatList
                data={alquileres}
                keyExtractor={(item, index) =>
                    String(item.id_alquiler || item.id || item.id_reserva || index)
                }
                renderItem={renderAlquiler}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refrescar}
                        colors={['#D31A24']}
                    />
                }
                contentContainerStyle={styles.lista}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons name="car-outline" size={55} color="#BBBBBB" />
                        <Text style={styles.vacioTitulo}>No hay alquileres</Text>
                        <Text style={styles.vacioTexto}>
                            Cuando existan alquileres registrados, aparecerán aquí.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 18,
    },
    encabezadoPantalla: {
        paddingHorizontal: 18,
        paddingBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#121212',
    },
    subtitulo: {
        fontSize: 13,
        color: '#777777',
        marginTop: 5,
    },
    contador: {
        backgroundColor: '#FCEBEC',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 8,
        alignItems: 'center',
    },
    contadorNumero: {
        color: '#D31A24',
        fontSize: 20,
        fontWeight: 'bold',
    },
    contadorTexto: {
        color: '#777777',
        fontSize: 11,
    },
    lista: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconoVehiculo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoVehiculo: {
        flex: 1,
        marginLeft: 11,
    },
    vehiculo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222222',
    },
    placa: {
        fontSize: 12,
        color: '#777777',
        marginTop: 4,
    },
    estado: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8,
    },
    estadoTexto: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    divisor: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 14,
    },
    dato: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    datoTexto: {
        fontSize: 13,
        color: '#555555',
        marginLeft: 9,
        flex: 1,
    },
    total: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        marginTop: 5,
        paddingTop: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalEtiqueta: {
        fontSize: 14,
        color: '#555555',
        fontWeight: '600',
    },
    totalMonto: {
        fontSize: 18,
        color: '#D31A24',
        fontWeight: 'bold',
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    cargandoTexto: {
        color: '#777777',
        marginTop: 12,
    },
    vacio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 35,
    },
    vacioTitulo: {
        color: '#333333',
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
    },
    vacioTexto: {
        color: '#888888',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 20,
    },
    error: {
        color: '#B91C1C',
        backgroundColor: '#FEE2E2',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 9,
    },
});
