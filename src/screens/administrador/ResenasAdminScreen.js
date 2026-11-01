import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTodasResenasAdmin } from '../../services/resenas.service';

export default function ResenasAdminScreen({ navigation }) {
    const [datos, setDatos] = useState({
        total: 0,
        promedio: 0,
        distribucion: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        },
        resenas: [],
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const cargarResenas = useCallback(async () => {
        try {
            setError('');
            const resultado = await getTodasResenasAdmin();
            setDatos(resultado);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar las reseñas.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            cargarResenas();
        }, [cargarResenas])
    );

    const actualizar = () => {
        setRefreshing(true);
        cargarResenas();
    };

    const renderEstrellas = (cantidad, size = 19) => (
        <View style={styles.estrellas}>
            {[1, 2, 3, 4, 5].map((numero) => (
                <Ionicons
                    key={numero}
                    name={numero <= Number(cantidad) ? 'star' : 'star-outline'}
                    size={size}
                    color={numero <= Number(cantidad) ? '#F5A623' : '#D8D8D8'}
                />
            ))}
        </View>
    );

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';

        const valor = fecha?.seconds
            ? new Date(fecha.seconds * 1000)
            : new Date(fecha);

        if (Number.isNaN(valor.getTime())) {
            return 'Fecha no disponible';
        }

        return valor.toLocaleDateString('es-NI', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const promedio = Number(datos.promedio || 0);
    const distribucion = datos.distribucion || {};

    return (
        <View style={styles.container}>
            {/* ENCABEZADO */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.botonVolver}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerTexto}>
                    <Text style={styles.headerTitulo}>
                        Reseñas y calificaciones
                    </Text>
                    <Text style={styles.headerSubtitulo}>
                        La experiencia de nuestros clientes
                    </Text>
                </View>

                <View style={styles.headerIcono}>
                    <Ionicons name="star" size={24} color="#F5A623" />
                </View>
            </View>

            {/* CONTENIDO */}
            {loading ? (
                <View style={styles.cargando}>
                    <ActivityIndicator size="large" color="#D31A24" />
                    <Text style={styles.textoCargando}>
                        Cargando reseñas...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contenido}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={actualizar}
                            colors={['#D31A24']}
                        />
                    }
                >
                    {error ? (
                        <View style={styles.errorCard}>
                            <View style={styles.errorIcono}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={30}
                                    color="#D31A24"
                                />
                            </View>

                            <Text style={styles.errorTitulo}>
                                Algo salió mal
                            </Text>

                            <Text style={styles.errorTexto}>
                                {error}
                            </Text>

                            <TouchableOpacity
                                style={styles.reintentar}
                                onPress={cargarResenas}
                                activeOpacity={0.85}
                            >
                                <Ionicons
                                    name="refresh"
                                    size={17}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.reintentarTexto}>
                                    Reintentar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* RESUMEN GENERAL */}
                            <View style={styles.resumenCard}>
                                <View style={styles.resumenEncabezado}>
                                    <View>
                                        <Text style={styles.resumenEtiqueta}>
                                            RESUMEN GENERAL
                                        </Text>
                                        <Text style={styles.resumenTitulo}>
                                            Satisfacción de clientes
                                        </Text>
                                    </View>

                                    <View style={styles.resumenIcono}>
                                        <Ionicons
                                            name="stats-chart"
                                            size={22}
                                            color="#D31A24"
                                        />
                                    </View>
                                </View>

                                <View style={styles.promedioContenedor}>
                                    <View style={styles.promedioNumeroBox}>
                                        <Text style={styles.promedioNumero}>
                                            {promedio.toFixed(1)}
                                        </Text>
                                        <Text style={styles.promedioDe}>
                                            de 5.0
                                        </Text>
                                    </View>

                                    <View style={styles.promedioDetalle}>
                                        {renderEstrellas(Math.round(promedio), 21)}

                                        <Text style={styles.totalTexto}>
                                            Basado en {datos.total || 0}{' '}
                                            {(datos.total || 0) === 1
                                                ? 'reseña'
                                                : 'reseñas'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.divisor} />

                                <Text style={styles.distribucionTitulo}>
                                    Distribución de calificaciones
                                </Text>

                                {[5, 4, 3, 2, 1].map((numero) => {
                                    const cantidad = Number(
                                        distribucion[numero] || 0
                                    );

                                    const porcentaje = datos.total
                                        ? (cantidad / datos.total) * 100
                                        : 0;

                                    return (
                                        <View
                                            key={numero}
                                            style={styles.distribucionFila}
                                        >
                                            <View style={styles.numeroEstrellaBox}>
                                                <Text style={styles.numeroEstrella}>
                                                    {numero}
                                                </Text>
                                                <Ionicons
                                                    name="star"
                                                    size={13}
                                                    color="#F5A623"
                                                />
                                            </View>

                                            <View style={styles.barraFondo}>
                                                <View
                                                    style={[
                                                        styles.barraProgreso,
                                                        {
                                                            width: `${porcentaje}%`,
                                                        },
                                                    ]}
                                                />
                                            </View>

                                            <Text style={styles.cantidadTexto}>
                                                {cantidad}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* TÍTULO DE OPINIONES */}
                            <View style={styles.tituloSeccion}>
                                <View>
                                    <Text style={styles.titulo}>
                                        Opiniones de clientes
                                    </Text>
                                    <Text style={styles.subtituloSeccion}>
                                        Lo que dicen sobre sus alquileres
                                    </Text>
                                </View>

                                <View style={styles.contador}>
                                    <Text style={styles.contadorTexto}>
                                        {datos.resenas?.length || 0}
                                    </Text>
                                </View>
                            </View>

                            {/* LISTA DE RESEÑAS */}
                            {!datos.resenas?.length ? (
                                <View style={styles.vacio}>
                                    <View style={styles.vacioIcono}>
                                        <Ionicons
                                            name="chatbubbles-outline"
                                            size={37}
                                            color="#D31A24"
                                        />
                                    </View>

                                    <Text style={styles.vacioTitulo}>
                                        Todavía no hay reseñas
                                    </Text>

                                    <Text style={styles.vacioTexto}>
                                        Cuando los clientes califiquen sus
                                        alquileres, sus opiniones aparecerán aquí.
                                    </Text>
                                </View>
                            ) : (
                                datos.resenas.map((item, index) => (
                                    <View
                                        key={item.id || item.id_alquiler || index}
                                        style={styles.resenaCard}
                                    >
                                        <View style={styles.resenaSuperior}>
                                            <View style={styles.clienteFila}>
                                                <View style={styles.avatar}>
                                                    <Ionicons
                                                        name="person"
                                                        size={21}
                                                        color="#D31A24"
                                                    />
                                                </View>

                                                <View style={styles.clienteInfo}>
                                                    <Text
                                                        style={styles.clienteNombre}
                                                        numberOfLines={1}
                                                    >
                                                        {item.cliente?.nombre || 'Cliente'}
                                                    </Text>

                                                    <Text
                                                        style={styles.clienteEmail}
                                                        numberOfLines={1}
                                                    >
                                                        {item.cliente?.email || 'Sin correo'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.etiquetaResena}>
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={13}
                                                    color="#27834A"
                                                />
                                                <Text style={styles.etiquetaTexto}>
                                                    Opinión
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.lineaSuave} />

                                        <View style={styles.vehiculoFila}>
                                            <View style={styles.vehiculoIcono}>
                                                <Ionicons
                                                    name="car-sport-outline"
                                                    size={19}
                                                    color="#D31A24"
                                                />
                                            </View>

                                            <View style={styles.vehiculoInfo}>
                                                <Text style={styles.vehiculoEtiqueta}>
                                                    VEHÍCULO ALQUILADO
                                                </Text>
                                                <Text style={styles.vehiculoNombre}>
                                                    {item.vehiculo?.nombre ||
                                                        item.vehiculo?.marca ||
                                                        'Vehículo'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.calificacionFila}>
                                            {renderEstrellas(item.calificacion, 20)}

                                            <Text style={styles.calificacionTexto}>
                                                {Number(item.calificacion || 0).toFixed(0)}.0 / 5
                                            </Text>
                                        </View>

                                        <View style={styles.comentarioCaja}>
                                            <Ionicons
                                                name="chatbox-ellipses-outline"
                                                size={18}
                                                color="#D31A24"
                                            />

                                            <Text style={styles.comentario}>
                                                {item.comentario || 'Sin comentario.'}
                                            </Text>
                                        </View>

                                        <View style={styles.fechaFila}>
                                            <Ionicons
                                                name="calendar-outline"
                                                size={15}
                                                color="#888888"
                                            />

                                            <Text style={styles.fecha}>
                                                {formatearFecha(item.fecha_creacion)}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },

    header: {
        backgroundColor: '#121212',
        paddingTop: 48,
        paddingBottom: 25,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: '#D31A24',
    },

    botonVolver: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#292929',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    headerTexto: {
        flex: 1,
    },

    headerTitulo: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    headerSubtitulo: {
        color: '#AAAAAA',
        fontSize: 11,
        marginTop: 5,
    },

    headerIcono: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#302719',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    contenido: {
        padding: 17,
        paddingBottom: 40,
    },

    cargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textoCargando: {
        marginTop: 12,
        color: '#777777',
        fontSize: 13,
    },

    resumenCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 21,
        padding: 19,
        marginBottom: 27,
        elevation: 3,
        shadowColor: '#000000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },

    resumenEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    resumenEtiqueta: {
        color: '#D31A24',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.3,
    },

    resumenTitulo: {
        color: '#222222',
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 5,
    },

    resumenIcono: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    promedioContenedor: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 22,
    },

    promedioNumeroBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginRight: 18,
    },

    promedioNumero: {
        color: '#121212',
        fontSize: 49,
        fontWeight: 'bold',
        letterSpacing: -2,
    },

    promedioDe: {
        color: '#888888',
        fontSize: 12,
        marginLeft: 4,
    },

    promedioDetalle: {
        flex: 1,
        justifyContent: 'center',
    },

    estrellas: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    totalTexto: {
        color: '#777777',
        fontSize: 11,
        marginTop: 7,
    },

    divisor: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 19,
    },

    distribucionTitulo: {
        color: '#333333',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 14,
    },

    distribucionFila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 11,
        gap: 10,
    },

    numeroEstrellaBox: {
        width: 33,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    numeroEstrella: {
        color: '#444444',
        fontSize: 12,
        fontWeight: 'bold',
    },

    barraFondo: {
        flex: 1,
        height: 8,
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        overflow: 'hidden',
    },

    barraProgreso: {
        height: 8,
        backgroundColor: '#D31A24',
        borderRadius: 10,
    },

    cantidadTexto: {
        width: 25,
        textAlign: 'right',
        color: '#777777',
        fontSize: 11,
        fontWeight: '600',
    },

    tituloSeccion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    titulo: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#171717',
    },

    subtituloSeccion: {
        fontSize: 11,
        color: '#888888',
        marginTop: 4,
    },

    contador: {
        minWidth: 35,
        height: 35,
        paddingHorizontal: 9,
        borderRadius: 12,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    contadorTexto: {
        color: '#D31A24',
        fontSize: 14,
        fontWeight: 'bold',
    },

    resenaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        padding: 17,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
    },

    resenaSuperior: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    clienteFila: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },

    avatar: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    clienteInfo: {
        flex: 1,
    },

    clienteNombre: {
        color: '#202020',
        fontWeight: 'bold',
        fontSize: 13,
    },

    clienteEmail: {
        color: '#999999',
        fontSize: 10,
        marginTop: 4,
    },

    etiquetaResena: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAF5ED',
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },

    etiquetaTexto: {
        color: '#27834A',
        fontSize: 10,
        fontWeight: 'bold',
    },

    lineaSuave: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 15,
    },

    vehiculoFila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 13,
    },

    vehiculoIcono: {
        width: 37,
        height: 37,
        borderRadius: 12,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    vehiculoInfo: {
        flex: 1,
    },

    vehiculoEtiqueta: {
        color: '#999999',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.8,
    },

    vehiculoNombre: {
        color: '#333333',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 3,
    },

    calificacionFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF9EF',
        paddingHorizontal: 11,
        paddingVertical: 9,
        borderRadius: 11,
        marginBottom: 13,
    },

    calificacionTexto: {
        color: '#9A6714',
        fontSize: 11,
        fontWeight: 'bold',
    },

    comentarioCaja: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F7F7F7',
        padding: 13,
        borderRadius: 12,
        gap: 9,
    },

    comentario: {
        flex: 1,
        color: '#4B4B4B',
        fontSize: 12,
        lineHeight: 20,
    },

    fechaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginTop: 15,
    },

    fecha: {
        fontSize: 10,
        color: '#888888',
    },

    vacio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 2,
    },

    vacioIcono: {
        width: 70,
        height: 70,
        borderRadius: 23,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    vacioTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#252525',
        marginTop: 15,
    },

    vacioTexto: {
        fontSize: 12,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 19,
        marginTop: 7,
    },

    errorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        padding: 25,
        alignItems: 'center',
    },

    errorIcono: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#FCE8E9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorTitulo: {
        color: '#252525',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 13,
    },

    errorTexto: {
        color: '#777777',
        textAlign: 'center',
        marginTop: 8,
        fontSize: 12,
        lineHeight: 19,
    },

    reintentar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        backgroundColor: '#D31A24',
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 11,
        marginTop: 17,
    },

    reintentarTexto: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
});
