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

import { useReservas } from '../../hooks/useReservas';
import { actualizarEstadoReserva } from '../../services/reservas.service';

const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    if (fecha._seconds) {
        return new Date(fecha._seconds * 1000).toLocaleDateString('es-NI');
    }

    if (fecha.seconds) {
        return new Date(fecha.seconds * 1000).toLocaleDateString('es-NI');
    }

    if (typeof fecha === 'string') {
        return fecha;
    }

    return 'Fecha no disponible';
};

export default function ReservasAdminScreen() {
    const { reservas, loading, error, refrescar } = useReservas();

    const cambiarEstado = (id, estado) => {
        if (!id) {
            Alert.alert('Error', 'No se encontró el identificador de la reserva.');
            return;
        }

        Alert.alert(
            'Confirmar acción',
            `¿Deseas ${estado} esta reserva?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await actualizarEstadoReserva(id, estado);
                            Alert.alert('Correcto', `Reserva ${estado} correctamente.`);
                            refrescar();
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo actualizar.');
                        }
                    },
                },
            ]
        );
    };

    const renderReserva = ({ item }) => {
        const id = item.id || item.id_reserva;
        const estado = String(
            item.estado_aprobacion || 'pendiente'
        ).toLowerCase();

        const vehiculo = item.vehiculo || {};

        return (
            <View style={styles.card}>
                <View style={styles.encabezado}>
                    <Text style={styles.vehiculo}>
                        {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                    </Text>

                    <Text style={styles.estado}>
                        {estado.toUpperCase()}
                    </Text>
                </View>

                <Text style={styles.detalle}>
                    Cliente: {item.email_usuario || item.email || 'No disponible'}
                </Text>

                <Text style={styles.detalle}>
                    Inicio: {formatearFecha(item.fecha_inicio)}
                </Text>

                <Text style={styles.detalle}>
                    Fin: {formatearFecha(item.fecha_fin)}
                </Text>

                <Text style={styles.monto}>
                    Total: C$ {Number(item.monto_total || 0).toLocaleString('es-NI')}
                </Text>

                {estado === 'pendiente' && (
                    <View style={styles.botones}>
                        <TouchableOpacity
                            style={styles.botonAprobar}
                            onPress={() => cambiarEstado(id, 'aprobada')}
                        >
                            <Text style={styles.textoBoton}>Aprobar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botonRechazar}
                            onPress={() => cambiarEstado(id, 'rechazada')}
                        >
                            <Text style={styles.textoBoton}>Rechazar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

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
            <Text style={styles.titulo}>Gestión de reservas</Text>

            <Text style={styles.subtitulo}>
                Reservas registradas: {reservas.length}
            </Text>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : null}

            <FlatList
                data={reservas}
                keyExtractor={(item, index) =>
                    String(item.id || item.id_reserva || index)
                }
                renderItem={renderReserva}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refrescar}
                        colors={['#D31A24']}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.vacio}>
                        No hay reservas registradas.
                    </Text>
                }
                contentContainerStyle={styles.lista}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 55,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cargando: {
        marginTop: 12,
        color: '#666666',
    },
    titulo: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#121212',
        marginHorizontal: 18,
    },
    subtitulo: {
        color: '#777777',
        marginHorizontal: 18,
        marginTop: 5,
        marginBottom: 15,
    },
    lista: {
        paddingHorizontal: 15,
        paddingBottom: 25,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 13,
        elevation: 2,
    },
    encabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    vehiculo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#121212',
    },
    estado: {
        color: '#D31A24',
        fontWeight: 'bold',
        fontSize: 12,
    },
    detalle: {
        color: '#555555',
        fontSize: 14,
        marginBottom: 5,
    },
    monto: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#121212',
    },
    botones: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 15,
    },
    botonAprobar: {
        flex: 1,
        backgroundColor: '#D31A24',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonRechazar: {
        flex: 1,
        backgroundColor: '#333333',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    textoBoton: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    error: {
        color: '#D31A24',
        marginHorizontal: 18,
        marginBottom: 10,
    },
    vacio: {
        textAlign: 'center',
        color: '#777777',
        marginTop: 35,
    },
});
