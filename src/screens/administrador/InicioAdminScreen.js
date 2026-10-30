
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReservas } from '../../hooks/useReservas';
import { useAlquileres } from '../../hooks/useAlquileres';
import { useAuth } from '../../context/AuthContext';

export default function InicioAdminScreen({ navigation }) {
    const { user } = useAuth();
    const {
        reservas,
        loading: cargandoReservas,
        refrescar: refrescarReservas,
    } = useReservas();

    const {
        alquileres,
        loading: cargandoAlquileres,
        refrescar: refrescarAlquileres,
    } = useAlquileres();

    const pendientes = reservas.filter(
        item => String(item.estado_aprobacion || 'pendiente').toLowerCase() === 'pendiente'
    ).length;

    const aprobadas = reservas.filter(
        item => String(item.estado_aprobacion || '').toLowerCase() === 'aprobada'
    ).length;

    const alquileresActivos = alquileres.filter(item => {
        const estado = String(item.estado_alquiler || '').toLowerCase();
        return ['activo', 'en curso', 'pendiente_entrega', 'pendiente_devolucion'].includes(estado);
    }).length;

    const actualizarDatos = () => {
        refrescarReservas();
        refrescarAlquileres();
    };

    const cargando = cargandoReservas || cargandoAlquileres;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
            <View style={styles.encabezado}>
                <View>
                    <Text style={styles.bienvenida}>¡Bienvenido!</Text>
                    <Text style={styles.nombre}>
                        {user?.nombre || user?.nombre1 || 'Administrador'}
                    </Text>
                    <Text style={styles.subtitulo}>Panel de administración</Text>
                </View>

                <View style={styles.iconoAdmin}>
                    <Ionicons name="person" size={28} color="#FFFFFF" />
                </View>
            </View>

            <View style={styles.seccionTitulo}>
                <Text style={styles.titulo}>Resumen general</Text>
                <TouchableOpacity onPress={actualizarDatos}>
                    <Ionicons name="refresh" size={23} color="#D31A24" />
                </TouchableOpacity>
            </View>

            {cargando ? (
                <ActivityIndicator size="large" color="#D31A24" style={styles.cargando} />
            ) : (
                <View style={styles.grid}>
                    <View style={styles.tarjeta}>
                        <View style={styles.iconoTarjeta}>
                            <Ionicons name="calendar-outline" size={25} color="#D31A24" />
                        </View>
                        <Text style={styles.numero}>{reservas.length}</Text>
                        <Text style={styles.etiqueta}>Total de reservas</Text>
                    </View>

                    <View style={styles.tarjeta}>
                        <View style={styles.iconoTarjeta}>
                            <Ionicons name="time-outline" size={25} color="#D31A24" />
                        </View>
                        <Text style={styles.numero}>{pendientes}</Text>
                        <Text style={styles.etiqueta}>Pendientes</Text>
                    </View>

                    <View style={styles.tarjeta}>
                        <View style={styles.iconoTarjeta}>
                            <Ionicons name="checkmark-circle-outline" size={25} color="#D31A24" />
                        </View>
                        <Text style={styles.numero}>{aprobadas}</Text>
                        <Text style={styles.etiqueta}>Reservas aprobadas</Text>
                    </View>

                    <View style={styles.tarjeta}>
                        <View style={styles.iconoTarjeta}>
                            <Ionicons name="car-outline" size={25} color="#D31A24" />
                        </View>
                        <Text style={styles.numero}>{alquileresActivos}</Text>
                        <Text style={styles.etiqueta}>Alquileres activos</Text>
                    </View>
                </View>
            )}

            <Text style={styles.titulo}>Accesos rápidos</Text>

            <TouchableOpacity
                style={styles.acceso}
                onPress={() => navigation.navigate('Reservas')}
            >
                <View style={styles.accesoIcono}>
                    <Ionicons name="calendar" size={23} color="#D31A24" />
                </View>
                <View style={styles.accesoTexto}>
                    <Text style={styles.accesoTitulo}>Gestionar reservas</Text>
                    <Text style={styles.accesoDescripcion}>
                        Revisar, aprobar o rechazar solicitudes
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#777" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.acceso}
                onPress={() => navigation.navigate('Vehículos')}
            >
                <View style={styles.accesoIcono}>
                    <Ionicons name="car-sport" size={23} color="#D31A24" />
                </View>
                <View style={styles.accesoTexto}>
                    <Text style={styles.accesoTitulo}>Ver vehículos</Text>
                    <Text style={styles.accesoDescripcion}>
                        Consultar el catálogo de vehículos
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#777" />
            </TouchableOpacity>

            <View style={styles.pie}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#D31A24" />
                <Text style={styles.pieTexto}>TRC App · Administración</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    contenido: {
        padding: 18,
        paddingBottom: 35,
    },
    encabezado: {
        backgroundColor: '#121212',
        borderRadius: 18,
        padding: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    bienvenida: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    nombre: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: 'bold',
        marginTop: 4,
    },
    subtitulo: {
        color: '#CCCCCC',
        fontSize: 13,
        marginTop: 5,
    },
    iconoAdmin: {
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: '#950808',
        justifyContent: 'center',
        alignItems: 'center',
    },
    seccionTitulo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    titulo: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#121212',
        marginBottom: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    tarjeta: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 13,
        elevation: 2,
    },
    iconoTarjeta: {
        width: 43,
        height: 43,
        borderRadius: 12,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    numero: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#121212',
    },
    etiqueta: {
        fontSize: 13,
        color: '#666666',
        marginTop: 4,
    },
    cargando: {
        marginVertical: 35,
    },
    acceso: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 1,
    },
    accesoIcono: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accesoTexto: {
        flex: 1,
        marginLeft: 13,
    },
    accesoTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222222',
    },
    accesoDescripcion: {
        fontSize: 12,
        color: '#777777',
        marginTop: 4,
    },
    pie: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    pieTexto: {
        color: '#777777',
        fontSize: 12,
        marginLeft: 6,
    },
});
