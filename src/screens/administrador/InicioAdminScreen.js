import React, { useCallback, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useReservas } from '../../hooks/useReservas';
import { useAlquileres } from '../../hooks/useAlquileres';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import { obtenerNotificaciones } from '../../services/notificaciones.service.js';

export default function InicioAdminScreen({ navigation }) {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();

    const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

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

    const cargarContadorNotificaciones = useCallback(async () => {
        try {
            const respuesta = await obtenerNotificaciones();

            const lista =
                respuesta?.data?.notificaciones ||
                respuesta?.notificaciones ||
                [];

            const cantidad =
                respuesta?.data?.no_leidas ??
                respuesta?.no_leidas ??
                lista.filter(item => item.leido === false).length;

            setNotificacionesNoLeidas(cantidad);
        } catch (error) {
            console.log(
                'Error al cargar contador de notificaciones:',
                error.message
            );
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            cargarContadorNotificaciones();
        }, [cargarContadorNotificaciones])
    );

    const pendientes = reservas.filter(
        item =>
            String(item.estado_aprobacion || 'pendiente').toLowerCase() ===
            'pendiente'
    ).length;

    const aprobadas = reservas.filter(
        item =>
            String(item.estado_aprobacion || '').toLowerCase() ===
            'aprobada'
    ).length;

    const alquileresActivos = alquileres.filter(item => {
        const estado = String(item.estado_alquiler || '').toLowerCase();

        return [
            'activo',
            'en curso',
            'pendiente_entrega',
            'pendiente_devolucion',
        ].includes(estado);
    }).length;

    const actualizarDatos = () => {
        refrescarReservas();
        refrescarAlquileres();
        cargarContadorNotificaciones();
    };

    const cargando = cargandoReservas || cargandoAlquileres;

    const nombreAdmin =
        user?.nombre ||
        user?.nombre1 ||
        'Administrador';

    const tarjetas = [
        {
            titulo: 'Total de reservas',
            numero: reservas.length,
            icono: 'calendar-outline',
            detalle: 'Solicitudes registradas',
        },
        {
            titulo: 'Pendientes',
            numero: pendientes,
            icono: 'time-outline',
            detalle: 'Esperando aprobación',
        },
        {
            titulo: 'Aprobadas',
            numero: aprobadas,
            icono: 'checkmark-circle-outline',
            detalle: 'Reservas confirmadas',
        },
        {
            titulo: 'Alquileres activos',
            numero: alquileresActivos,
            icono: 'car-sport-outline',
            detalle: 'Vehículos alquilados',
        },
    ];

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.background },
            ]}
            contentContainerStyle={styles.contenido}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={false}
                    onRefresh={actualizarDatos}
                    colors={['#D31A24']}
                    tintColor={theme.primary}
                />
            }
        >
            {/* ENCABEZADO PRINCIPAL */}

            <View style={styles.encabezado}>
                <View style={styles.encabezadoSuperior}>
                    <View style={styles.marca}>
                        <View style={styles.logo}>
                            <Ionicons
                                name="car-sport"
                                size={23}
                                color="#FFFFFF"
                            />
                        </View>

                        <View>
                            <Text style={styles.marcaNombre}>
                                TRC APP
                            </Text>

                            <Text style={styles.marcaSubtitulo}>
                                ADMINISTRACIÓN
                            </Text>
                        </View>
                    </View>

                    <View style={styles.encabezadoAcciones}>
                        <TouchableOpacity
                            style={styles.botonNotificaciones}
                            onPress={() =>
                                navigation.navigate('Notificaciones')
                            }
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="notifications-outline"
                                size={23}
                                color="#FFFFFF"
                            />

                            {notificacionesNoLeidas > 0 && (
                                <View style={styles.contadorNotificaciones}>
                                    <Text style={styles.textoContador}>
                                        {notificacionesNoLeidas > 99
                                            ? '99+'
                                            : notificacionesNoLeidas}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.estadoAdmin}>
                            <View style={styles.puntoEstado} />

                            <Text style={styles.estadoTexto}>
                                En línea
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bienvenidaContenedor}>
                    <Text style={styles.bienvenida}>
                        ¡Hola, bienvenido!
                    </Text>

                    <Text style={styles.nombre}>
                        {nombreAdmin}
                    </Text>

                    <Text style={styles.subtitulo}>
                        Administra tu negocio desde aquí.
                    </Text>
                </View>

                <View style={styles.encabezadoDecoracion}>
                    <Ionicons
                        name="car-sport"
                        size={115}
                        color="#FFFFFF"
                    />
                </View>

                <View style={styles.lineaRoja} />
            </View>

            {/* RESUMEN GENERAL */}

            <View style={styles.tituloSeccion}>
                <View>
                    <Text
                        style={[
                            styles.titulo,
                            { color: theme.text },
                        ]}
                    >
                        Resumen general
                    </Text>

                    <Text style={styles.descripcionSeccion}>
                        Estado actual de tu negocio
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.botonActualizar,
                        { backgroundColor: theme.card },
                    ]}
                    onPress={actualizarDatos}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="refresh"
                        size={19}
                        color="#D31A24"
                    />
                </TouchableOpacity>
            </View>

            {cargando ? (
                <View
                    style={[
                        styles.cargandoBox,
                        { backgroundColor: theme.card },
                    ]}
                >
                    <ActivityIndicator
                        size="large"
                        color="#D31A24"
                    />

                    <Text
                        style={[
                            styles.textoCargando,
                            { color: theme.secondaryText },
                        ]}
                    >
                        Actualizando información...
                    </Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {tarjetas.map((item, index) => (
                        <View
                            key={item.titulo}
                            style={[
                                styles.tarjeta,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <View style={styles.tarjetaSuperior}>
                                <View style={styles.iconoTarjeta}>
                                    <Ionicons
                                        name={item.icono}
                                        size={23}
                                        color="#D31A24"
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.numero,
                                        { color: theme.text },
                                    ]}
                                >
                                    {item.numero}
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.etiqueta,
                                    { color: theme.text },
                                ]}
                            >
                                {item.titulo}
                            </Text>

                            <Text
                                style={[
                                    styles.detalleTarjeta,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                {item.detalle}
                            </Text>

                            <View
                                style={[
                                    styles.acentoTarjeta,
                                    index === 1 &&
                                    styles.acentoPendiente,
                                ]}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* EXPERIENCIA DE CLIENTES */}

            <Text
                style={[
                    styles.titulo,
                    { color: theme.text },
                ]}
            >
                Experiencia de clientes
            </Text>

            <TouchableOpacity
                style={[
                    styles.resenasCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate('ResenasAdmin')
                }
            >
                <View style={styles.resenasIcono}>
                    <Ionicons
                        name="star"
                        size={27}
                        color="#FFFFFF"
                    />
                </View>

                <View style={styles.resenasTexto}>
                    <Text
                        style={[
                            styles.resenasTitulo,
                            { color: theme.text },
                        ]}
                    >
                        Reseñas y calificaciones
                    </Text>

                    <Text
                        style={[
                            styles.resenasDescripcion,
                            { color: theme.secondaryText },
                        ]}
                    >
                        Consulta las opiniones de tus clientes y sus experiencias.
                    </Text>
                </View>

                <View style={styles.flechaResenas}>
                    <Ionicons
                        name="chevron-forward"
                        size={21}
                        color="#D31A24"
                    />
                </View>
            </TouchableOpacity>

            {/* ACCESOS RÁPIDOS */}

            <View style={styles.tituloSeccionAccesos}>
                <Text
                    style={[
                        styles.titulo,
                        { color: theme.text },
                    ]}
                >
                    Accesos rápidos
                </Text>

                <Text style={styles.descripcionSeccion}>
                    Gestiona las principales funciones
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.acceso,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Reservas')}
            >
                <View style={styles.accesoIcono}>
                    <Ionicons
                        name="calendar"
                        size={24}
                        color="#D31A24"
                    />
                </View>

                <View style={styles.accesoTexto}>
                    <Text
                        style={[
                            styles.accesoTitulo,
                            { color: theme.text },
                        ]}
                    >
                        Gestionar reservas
                    </Text>

                    <Text
                        style={[
                            styles.accesoDescripcion,
                            { color: theme.secondaryText },
                        ]}
                    >
                        Revisar, aprobar o rechazar solicitudes
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={21}
                    color={theme.secondaryText}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.acceso,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Vehículos')}
            >
                <View style={styles.accesoIcono}>
                    <Ionicons
                        name="car-sport"
                        size={24}
                        color="#D31A24"
                    />
                </View>

                <View style={styles.accesoTexto}>
                    <Text
                        style={[
                            styles.accesoTitulo,
                            { color: theme.text },
                        ]}
                    >
                        Ver vehículos
                    </Text>

                    <Text
                        style={[
                            styles.accesoDescripcion,
                            { color: theme.secondaryText },
                        ]}
                    >
                        Consultar el catálogo de vehículos
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={21}
                    color={theme.secondaryText}
                />
            </TouchableOpacity>

            {/* PIE DE PANTALLA */}

            <View style={styles.pie}>
                <View
                    style={[
                        styles.pieLinea,
                        { backgroundColor: theme.border },
                    ]}
                />

                <View style={styles.pieContenido}>
                    <Ionicons
                        name="shield-checkmark"
                        size={17}
                        color="#D31A24"
                    />

                    <Text
                        style={[
                            styles.pieTexto,
                            { color: theme.secondaryText },
                        ]}
                    >
                        TRC App · Panel de administración
                    </Text>
                </View>

                <Text
                    style={[
                        styles.pieVersion,
                        { color: theme.secondaryText },
                    ]}
                >
                    Gestión de alquiler vehicular
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    contenido: {
        padding: 17,
        paddingBottom: 35,
    },

    encabezado: {
        backgroundColor: '#121212',
        borderRadius: 23,
        padding: 21,
        paddingTop: 45,
        paddingBottom: 25,
        marginBottom: 27,
        overflow: 'hidden',
        position: 'relative',
    },

    encabezadoSuperior: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },

    marca: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    logo: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#D31A24',
        alignItems: 'center',
        justifyContent: 'center',
    },

    marcaNombre: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },

    marcaSubtitulo: {
        color: '#AAAAAA',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1.3,
        marginTop: 3,
    },

    encabezadoAcciones: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    botonNotificaciones: {
        width: 37,
        height: 37,
        borderRadius: 12,
        backgroundColor: '#292929',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    contadorNotificaciones: {
        position: 'absolute',
        top: -5,
        right: -5,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: '#D31A24',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#121212',
    },

    textoContador: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
    },

    estadoAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#292929',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
    },

    puntoEstado: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#64C58B',
    },

    estadoTexto: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },

    bienvenidaContenedor: {
        marginTop: 26,
        zIndex: 2,
    },

    bienvenida: {
        color: '#CCCCCC',
        fontSize: 13,
    },

    nombre: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 5,
        maxWidth: '85%',
    },

    subtitulo: {
        color: '#AAAAAA',
        fontSize: 12,
        marginTop: 8,
    },

    encabezadoDecoracion: {
        position: 'absolute',
        right: -17,
        bottom: -14,
        opacity: 0.09,
        transform: [{ rotate: '-10deg' }],
    },

    lineaRoja: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '35%',
        height: 4,
        backgroundColor: '#D31A24',
    },

    tituloSeccion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },

    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    descripcionSeccion: {
        color: '#888888',
        fontSize: 11,
        marginTop: 5,
    },

    botonActualizar: {
        width: 39,
        height: 39,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },

    cargandoBox: {
        borderRadius: 18,
        padding: 30,
        alignItems: 'center',
        marginBottom: 24,
    },

    textoCargando: {
        marginTop: 10,
        fontSize: 12,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 26,
    },

    tarjeta: {
        width: '48%',
        borderRadius: 18,
        padding: 15,
        marginBottom: 13,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 2,
    },

    tarjetaSuperior: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    iconoTarjeta: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },

    numero: {
        fontSize: 27,
        fontWeight: 'bold',
    },

    etiqueta: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 13,
    },

    detalleTarjeta: {
        fontSize: 10,
        marginTop: 5,
    },

    acentoTarjeta: {
        height: 3,
        width: 31,
        backgroundColor: '#D31A24',
        borderRadius: 5,
        marginTop: 13,
    },

    acentoPendiente: {
        backgroundColor: '#E5A02C',
    },

    resenasCard: {
        borderRadius: 19,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 29,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
    },

    resenasIcono: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#D31A24',
        alignItems: 'center',
        justifyContent: 'center',
    },

    resenasTexto: {
        flex: 1,
        marginLeft: 13,
        marginRight: 7,
    },

    resenasTitulo: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    resenasDescripcion: {
        fontSize: 10,
        marginTop: 5,
        lineHeight: 16,
    },

    flechaResenas: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#FCEBEC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    tituloSeccionAccesos: {
        marginBottom: 15,
    },

    acceso: {
        borderRadius: 17,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2,
    },

    accesoIcono: {
        width: 47,
        height: 47,
        borderRadius: 14,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },

    accesoTexto: {
        flex: 1,
        marginLeft: 13,
        marginRight: 8,
    },

    accesoTitulo: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    accesoDescripcion: {
        fontSize: 10,
        marginTop: 5,
    },

    pie: {
        alignItems: 'center',
        marginTop: 19,
    },

    pieLinea: {
        width: '100%',
        height: 1,
        marginBottom: 17,
    },

    pieContenido: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    pieTexto: {
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 7,
    },

    pieVersion: {
        fontSize: 10,
        marginTop: 6,
    },
});