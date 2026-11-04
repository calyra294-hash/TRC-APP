import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAlquileres } from '../../hooks/useAlquileres';
import { useTheme } from '../../context/ThemeContext';

import {
    registrarEntregaAlquiler,
    registrarDevolucionAlquiler,
} from '../../services/alquileres.service';

const ROJO = '#D31A24';

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

        if (Number.isNaN(date.getTime())) {
            return 'No disponible';
        }

        return date.toLocaleDateString('es-NI');
    } catch {
        return 'No disponible';
    }
}

function normalizarEstado(estado) {
    return String(estado || 'Sin estado').trim().toLowerCase();
}

function obtenerEstado(estado) {
    const valor = normalizarEstado(estado);

    if (
        valor === 'activo' ||
        valor === 'alquilado' ||
        valor === 'en curso' ||
        valor === 'en_curso' ||
        valor === 'vigente'
    ) {
        return {
            texto: 'EN CURSO',
            color: '#B7791F',
            fondo: '#FFF5DF',
            icono: 'car-sport-outline',
        };
    }

    if (valor.includes('pendiente')) {
        return {
            texto: 'PENDIENTE',
            color: '#B7791F',
            fondo: '#FFF5DF',
            icono: 'time-outline',
        };
    }

    if (valor.includes('completado') || valor.includes('finalizado')) {
        return {
            texto: 'COMPLETADO',
            color: '#247A48',
            fondo: '#E8F5EC',
            icono: 'checkmark-circle-outline',
        };
    }

    if (valor.includes('cancelado')) {
        return {
            texto: 'CANCELADO',
            color: '#C62828',
            fondo: '#FDECEC',
            icono: 'close-circle-outline',
        };
    }

    return {
        texto: valor.toUpperCase(),
        color: '#666666',
        fondo: '#EEEEEE',
        icono: 'information-circle-outline',
    };
}

export default function AlquileresAdminScreen() {
    const { theme, isDark } = useTheme();

    const { alquileres, loading, error, refrescar } = useAlquileres();

    const [procesandoId, setProcesandoId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [alquilerSeleccionado, setAlquilerSeleccionado] = useState(null);

    const [estadoGeneral, setEstadoGeneral] = useState('');
    const [kilometraje, setKilometraje] = useState('');
    const [combustible, setCombustible] = useState('');

    const [guardandoDevolucion, setGuardandoDevolucion] = useState(false);
    const [filtro, setFiltro] = useState('Todos');

    const colores = {
        fondo: theme.background,
        tarjeta: theme.card,
        texto: theme.text,
        secundario: theme.secondaryText,
        borde: theme.border,
        superficie: isDark ? '#292929' : '#F4F4F4',
        superficieSuave: isDark ? '#242424' : '#F7F7F7',
        fondoRojo: isDark ? '#3A1C20' : '#FDEBEC',
        fondoAmarillo: isDark ? '#3B3020' : '#FFF5DF',
        fondoVerde: isDark ? '#193528' : '#E8F5EC',
        fondoModal: isDark ? '#1C1C1E' : '#FFFFFF',
        textoModal: isDark ? '#FFFFFF' : '#333333',
        input: isDark ? '#2A2A2A' : '#F7F7F7',
    };

    const obtenerId = (item) =>
        String(item?.id || item?.id_alquiler || '');

    const conteos = useMemo(() => {
        return {
            total: alquileres.length,
            pendientes: alquileres.filter(
                (item) => normalizarEstado(item.estado_alquiler) === 'pendiente_entrega'
            ).length,
            activos: alquileres.filter(
                (item) => [
                    'activo',
                    'alquilado',
                    'en curso',
                    'en_curso',
                    'vigente',
                ].includes(normalizarEstado(item.estado_alquiler))
            ).length,
            completados: alquileres.filter((item) => {
                const estado = normalizarEstado(item.estado_alquiler);
                return estado.includes('completado') || estado.includes('finalizado');
            }).length,
        };
    }, [alquileres]);

    const alquileresFiltrados = useMemo(() => {
        if (filtro === 'Todos') return alquileres;

        return alquileres.filter((item) => {
            const estado = normalizarEstado(item.estado_alquiler);

            if (filtro === 'Pendientes') {
                return estado.includes('pendiente');
            }

            if (filtro === 'En curso') {
                return [
                    'activo',
                    'alquilado',
                    'en curso',
                    'en_curso',
                    'vigente',
                ].includes(estado);
            }

            if (filtro === 'Completados') {
                return estado.includes('completado') || estado.includes('finalizado');
            }

            return true;
        });
    }, [alquileres, filtro]);

    const confirmarEntrega = (item) => {
        const id = obtenerId(item);

        if (!id) {
            Alert.alert('Error', 'No se encontró el identificador del alquiler.');
            return;
        }

        Alert.alert(
            'Confirmar entrega',
            '¿Deseas registrar la entrega de este vehículo al cliente?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sí, entregar',
                    onPress: async () => {
                        try {
                            setProcesandoId(id);

                            await registrarEntregaAlquiler(id);

                            Alert.alert(
                                'Entrega registrada',
                                'El vehículo fue entregado correctamente.'
                            );

                            await refrescar();
                        } catch (err) {
                            Alert.alert(
                                'Error',
                                err.message || 'No se pudo registrar la entrega.'
                            );
                        } finally {
                            setProcesandoId(null);
                        }
                    },
                },
            ]
        );
    };

    const abrirDevolucion = (item) => {
        setAlquilerSeleccionado(item);
        setEstadoGeneral('');
        setKilometraje('');
        setCombustible('');
        setModalVisible(true);
    };

    const guardarDevolucion = () => {
        if (!estadoGeneral.trim()) {
            Alert.alert('Campo requerido', 'Indica el estado general del vehículo.');
            return;
        }

        if (!combustible.trim()) {
            Alert.alert('Campo requerido', 'Indica el nivel de combustible.');
            return;
        }

        if (kilometraje.trim() && !/^\d+$/.test(kilometraje.trim())) {
            Alert.alert(
                'Kilometraje inválido',
                'Ingresa un kilometraje válido usando solo números.'
            );
            return;
        }

        Alert.alert(
            'Confirmar devolución',
            '¿Deseas registrar la devolución de este vehículo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Registrar',
                    onPress: ejecutarDevolucion,
                },
            ]
        );
    };

    const ejecutarDevolucion = async () => {
        const id = obtenerId(alquilerSeleccionado);

        if (!id) {
            Alert.alert('Error', 'No se encontró el identificador del alquiler.');
            return;
        }

        try {
            setGuardandoDevolucion(true);
            setProcesandoId(id);

            await registrarDevolucionAlquiler(id, {
                estado_general: estadoGeneral.trim(),
                kilometraje_devolucion: kilometraje.trim()
                    ? Number(kilometraje)
                    : 'No especificado',
                nivel_combustible: combustible.trim(),
            });

            setModalVisible(false);
            setAlquilerSeleccionado(null);

            Alert.alert(
                'Devolución registrada',
                'La devolución del vehículo se guardó correctamente.'
            );

            await refrescar();
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || 'No se pudo registrar la devolución.'
            );
        } finally {
            setGuardandoDevolucion(false);
            setProcesandoId(null);
        }
    };

    const renderAlquiler = ({ item }) => {
        const estado = obtenerEstado(item.estado_alquiler);
        const vehiculo = item.vehiculo || {};
        const estadoActual = normalizarEstado(item.estado_alquiler);
        const id = obtenerId(item);
        const ocupado = procesandoId === id;
        const monto = Number(item.monto_final || 0);

        return (
            <View style={[
                styles.tarjeta,
                {
                    backgroundColor: colores.tarjeta,
                    borderColor: colores.borde,
                },
            ]}>
                <View style={styles.tarjetaSuperior}>
                    <View style={[
                        styles.iconoVehiculo,
                        { backgroundColor: colores.fondoRojo },
                    ]}>
                        <Ionicons name="car-sport" size={26} color={ROJO} />
                    </View>

                    <View style={styles.infoVehiculo}>
                        <Text
                            style={[styles.nombreVehiculo, { color: colores.texto }]}
                            numberOfLines={1}
                        >
                            {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                        </Text>

                        <View style={styles.placaFila}>
                            <Ionicons
                                name="card-outline"
                                size={13}
                                color={colores.secundario}
                            />
                            <Text style={[styles.placa, { color: colores.secundario }]}>
                                {vehiculo.placa || 'Placa no disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={[
                        styles.estadoEtiqueta,
                        { backgroundColor: isDark ? `${estado.color}25` : estado.fondo },
                    ]}>
                        <View style={[
                            styles.puntoEstado,
                            { backgroundColor: estado.color },
                        ]} />
                        <Text style={[styles.estadoTexto, { color: estado.color }]}>
                            {estado.texto}
                        </Text>
                    </View>
                </View>

                <View style={[styles.separador, { backgroundColor: colores.borde }]} />

                <View style={styles.idAlquiler}>
                    <Ionicons
                        name="document-text-outline"
                        size={15}
                        color={colores.secundario}
                    />
                    <Text style={[styles.idTexto, { color: colores.secundario }]}>
                        Alquiler: {id || 'Sin ID'}
                    </Text>
                </View>

                <View style={styles.datosGrid}>
                    <View style={styles.dato}>
                        <View style={[
                            styles.datoIcono,
                            { backgroundColor: colores.superficie },
                        ]}>
                            <Ionicons name="calendar-outline" size={16} color={colores.secundario} />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={[styles.datoEtiqueta, { color: colores.secundario }]}>
                                Fecha de inicio
                            </Text>
                            <Text style={[styles.datoValor, { color: colores.texto }]}>
                                {formatearFecha(item.fecha_inicio)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dato}>
                        <View style={[
                            styles.datoIcono,
                            { backgroundColor: colores.superficie },
                        ]}>
                            <Ionicons name="calendar" size={16} color={colores.secundario} />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={[styles.datoEtiqueta, { color: colores.secundario }]}>
                                Fecha de finalización
                            </Text>
                            <Text style={[styles.datoValor, { color: colores.texto }]}>
                                {formatearFecha(item.fecha_fin)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dato}>
                        <View style={[
                            styles.datoIcono,
                            { backgroundColor: colores.superficie },
                        ]}>
                            <Ionicons name="time-outline" size={16} color={colores.secundario} />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={[styles.datoEtiqueta, { color: colores.secundario }]}>
                                Duración
                            </Text>
                            <Text style={[styles.datoValor, { color: colores.texto }]}>
                                {item.cantidad_dias || 'No disponible'} días
                            </Text>
                        </View>
                    </View>

                    {item.fecha_entrega ? (
                        <View style={styles.dato}>
                            <View style={[
                                styles.datoIcono,
                                { backgroundColor: colores.fondoVerde },
                            ]}>
                                <Ionicons
                                    name="key-outline"
                                    size={16}
                                    color="#247A48"
                                />
                            </View>
                            <View style={styles.datoContenido}>
                                <Text style={[styles.datoEtiqueta, { color: colores.secundario }]}>
                                    Vehículo entregado
                                </Text>
                                <Text style={[styles.datoValor, { color: colores.texto }]}>
                                    {formatearFecha(item.fecha_entrega)}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {item.fecha_devolucion ? (
                        <View style={styles.dato}>
                            <View style={[
                                styles.datoIcono,
                                { backgroundColor: colores.fondoVerde },
                            ]}>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={16}
                                    color="#247A48"
                                />
                            </View>
                            <View style={styles.datoContenido}>
                                <Text style={[styles.datoEtiqueta, { color: colores.secundario }]}>
                                    Vehículo devuelto
                                </Text>
                                <Text style={[styles.datoValor, { color: colores.texto }]}>
                                    {formatearFecha(item.fecha_devolucion)}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                <View style={[
                    styles.totalContenedor,
                    { borderTopColor: colores.borde },
                ]}>
                    <View>
                        <Text style={[styles.totalEtiqueta, { color: colores.secundario }]}>
                            MONTO FINAL
                        </Text>
                        <Text style={[styles.totalDescripcion, { color: colores.secundario }]}>
                            Importe del alquiler
                        </Text>
                    </View>

                    <Text style={styles.totalMonto}>
                        C$ {monto.toLocaleString('es-NI')}
                    </Text>
                </View>

                {estadoActual === 'pendiente_entrega' ? (
                    <TouchableOpacity
                        style={[
                            styles.botonAccion,
                            ocupado && styles.botonDeshabilitado,
                        ]}
                        onPress={() => confirmarEntrega(item)}
                        disabled={ocupado}
                        activeOpacity={0.8}
                    >
                        {ocupado ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="key-outline" size={19} color="#FFFFFF" />
                                <Text style={styles.textoBoton}>
                                    Registrar entrega del vehículo
                                </Text>
                                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                ) : null}

                {estadoActual === 'activo' ? (
                    <TouchableOpacity
                        style={[
                            styles.botonAccion,
                            styles.botonDevolucion,
                            ocupado && styles.botonDeshabilitado,
                        ]}
                        onPress={() => abrirDevolucion(item)}
                        disabled={ocupado}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={19}
                            color="#FFFFFF"
                        />
                        <Text style={styles.textoBoton}>
                            Registrar devolución
                        </Text>
                        <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    };

    const encabezadoLista = (
        <View>
            <View style={styles.encabezado}>
                <View style={styles.etiquetaAdmin}>
                    <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                    <Text style={styles.etiquetaAdminTexto}>
                        PANEL ADMINISTRATIVO
                    </Text>
                </View>

                <View style={styles.encabezadoFila}>
                    <View style={styles.encabezadoInfo}>
                        <Text style={styles.titulo}>Gestión de alquileres</Text>
                        <Text style={styles.subtitulo}>
                            Supervisa entregas y devoluciones
                        </Text>
                    </View>

                    <View style={styles.iconoEncabezado}>
                        <Ionicons name="document-text" size={27} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.indicador}>
                    <View style={styles.puntoIndicador} />
                    <Text style={styles.textoIndicador}>
                        Control de operaciones de alquiler
                    </Text>
                </View>
            </View>

            <View style={styles.seccionResumen}>
                <Text style={[styles.tituloSeccion, { color: colores.texto }]}>
                    Resumen general
                </Text>
                <Text style={[styles.subtituloSeccion, { color: colores.secundario }]}>
                    Estado de los alquileres registrados
                </Text>

                <View style={styles.resumen}>
                    <View style={[
                        styles.tarjetaResumen,
                        { backgroundColor: colores.tarjeta, borderColor: colores.borde },
                    ]}>
                        <View style={[
                            styles.iconoResumen,
                            { backgroundColor: colores.superficie },
                        ]}>
                            <Ionicons name="documents-outline" size={18} color={colores.texto} />
                        </View>
                        <Text style={[styles.numeroResumen, { color: colores.texto }]}>
                            {conteos.total}
                        </Text>
                        <Text style={[styles.textoResumen, { color: colores.secundario }]}>
                            Total
                        </Text>
                    </View>

                    <View style={[
                        styles.tarjetaResumen,
                        { backgroundColor: colores.tarjeta, borderColor: colores.borde },
                    ]}>
                        <View style={[
                            styles.iconoResumen,
                            { backgroundColor: colores.fondoAmarillo },
                        ]}>
                            <Ionicons name="time-outline" size={18} color="#B7791F" />
                        </View>
                        <Text style={[styles.numeroResumen, { color: '#B7791F' }]}>
                            {conteos.pendientes}
                        </Text>
                        <Text style={[styles.textoResumen, { color: colores.secundario }]}>
                            Pendientes
                        </Text>
                    </View>

                    <View style={[
                        styles.tarjetaResumen,
                        { backgroundColor: colores.tarjeta, borderColor: colores.borde },
                    ]}>
                        <View style={[
                            styles.iconoResumen,
                            { backgroundColor: colores.fondoRojo },
                        ]}>
                            <Ionicons name="car-sport-outline" size={18} color={ROJO} />
                        </View>
                        <Text style={[styles.numeroResumen, { color: ROJO }]}>
                            {conteos.activos}
                        </Text>
                        <Text style={[styles.textoResumen, { color: colores.secundario }]}>
                            En curso
                        </Text>
                    </View>

                    <View style={[
                        styles.tarjetaResumen,
                        { backgroundColor: colores.tarjeta, borderColor: colores.borde },
                    ]}>
                        <View style={[
                            styles.iconoResumen,
                            { backgroundColor: colores.fondoVerde },
                        ]}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color="#247A48"
                            />
                        </View>
                        <Text style={[styles.numeroResumen, { color: '#247A48' }]}>
                            {conteos.completados}
                        </Text>
                        <Text style={[styles.textoResumen, { color: colores.secundario }]}>
                            Finalizados
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.seccionListaTitulo}>
                <View>
                    <Text style={[styles.tituloSeccion, { color: colores.texto }]}>
                        Registro de alquileres
                    </Text>
                    <Text style={[styles.subtituloSeccion, { color: colores.secundario }]}>
                        Consulta y administra cada operación
                    </Text>
                </View>

                <View style={[
                    styles.contadorLista,
                    { backgroundColor: colores.fondoRojo },
                ]}>
                    <Text style={styles.contadorListaTexto}>
                        {alquileresFiltrados.length}
                    </Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtros}
            >
                {['Todos', 'Pendientes', 'En curso', 'Completados'].map((item) => {
                    const activo = filtro === item;

                    return (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.filtroBoton,
                                {
                                    backgroundColor: activo ? ROJO : colores.tarjeta,
                                    borderColor: activo ? ROJO : colores.borde,
                                },
                            ]}
                            onPress={() => setFiltro(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.filtroTexto,
                                { color: activo ? '#FFFFFF' : colores.secundario },
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {error ? (
                <View style={[
                    styles.errorContenedor,
                    { backgroundColor: isDark ? '#3A1C20' : '#FDECEC' },
                ]}>
                    <Ionicons name="alert-circle-outline" size={19} color="#B42318" />
                    <Text style={styles.errorTexto}>{error}</Text>
                </View>
            ) : null}
        </View>
    );

    if (loading && alquileres.length === 0) {
        return (
            <View style={[
                styles.centrado,
                { backgroundColor: colores.fondo },
            ]}>
                <ActivityIndicator size="large" color={ROJO} />
                <Text style={[styles.cargandoTexto, { color: colores.secundario }]}>
                    Cargando alquileres...
                </Text>
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            { backgroundColor: colores.fondo },
        ]}>
            <FlatList
                data={alquileresFiltrados}
                keyExtractor={(item, index) =>
                    String(
                        item.id ||
                        item.id_alquiler ||
                        item.id_reserva ||
                        index
                    )
                }
                renderItem={renderAlquiler}
                ListHeaderComponent={encabezadoLista}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refrescar}
                        colors={[ROJO]}
                        tintColor={ROJO}
                    />
                }
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={[
                        styles.vacio,
                        {
                            backgroundColor: colores.tarjeta,
                            borderColor: colores.borde,
                        },
                    ]}>
                        <View style={[
                            styles.iconoVacio,
                            { backgroundColor: colores.superficie },
                        ]}>
                            <Ionicons name="car-outline" size={42} color="#AAAAAA" />
                        </View>

                        <Text style={[styles.vacioTitulo, { color: colores.texto }]}>
                            No hay alquileres para mostrar
                        </Text>

                        <Text style={[styles.vacioTexto, { color: colores.secundario }]}>
                            Cuando existan alquileres registrados, aparecerán aquí.
                        </Text>

                        {filtro !== 'Todos' ? (
                            <TouchableOpacity
                                style={styles.botonLimpiar}
                                onPress={() => setFiltro('Todos')}
                            >
                                <Text style={styles.botonLimpiarTexto}>
                                    Ver todos
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                }
            />

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    if (!guardandoDevolucion) {
                        setModalVisible(false);
                    }
                }}
            >
                <KeyboardAvoidingView
                    style={styles.modalFondo}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[
                        styles.modalContenido,
                        { backgroundColor: colores.fondoModal },
                    ]}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalEncabezado}>
                                <View style={[
                                    styles.modalIcono,
                                    { backgroundColor: colores.fondoRojo },
                                ]}>
                                    <Ionicons name="car-outline" size={23} color={ROJO} />
                                </View>

                                <View style={styles.modalTituloContenido}>
                                    <Text style={[
                                        styles.modalTitulo,
                                        { color: colores.texto },
                                    ]}>
                                        Registrar devolución
                                    </Text>
                                    <Text style={[
                                        styles.modalSubtitulo,
                                        { color: colores.secundario },
                                    ]}>
                                        Inspección del vehículo recibido
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    disabled={guardandoDevolucion}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={27}
                                        color={colores.secundario}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[
                                styles.avisoModal,
                                { backgroundColor: colores.fondoAmarillo },
                            ]}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={19}
                                    color="#B7791F"
                                />
                                <Text style={styles.avisoModalTexto}>
                                    Completa la información para registrar la devolución.
                                </Text>
                            </View>

                            <Text style={[styles.label, { color: colores.texto }]}>
                                Estado general del vehículo *
                            </Text>

                            <View style={[
                                styles.inputContenedor,
                                {
                                    backgroundColor: colores.input,
                                    borderColor: colores.borde,
                                },
                            ]}>
                                <Ionicons
                                    name="clipboard-outline"
                                    size={18}
                                    color={colores.secundario}
                                />
                                <TextInput
                                    style={[styles.input, { color: colores.texto }]}
                                    placeholder="Ej. Buen estado, con daños..."
                                    placeholderTextColor={colores.secundario}
                                    value={estadoGeneral}
                                    onChangeText={setEstadoGeneral}
                                    editable={!guardandoDevolucion}
                                />
                            </View>

                            <Text style={[styles.label, { color: colores.texto }]}>
                                Kilometraje de devolución
                            </Text>

                            <View style={[
                                styles.inputContenedor,
                                {
                                    backgroundColor: colores.input,
                                    borderColor: colores.borde,
                                },
                            ]}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={18}
                                    color={colores.secundario}
                                />
                                <TextInput
                                    style={[styles.input, { color: colores.texto }]}
                                    placeholder="Ej. 45000"
                                    placeholderTextColor={colores.secundario}
                                    keyboardType="numeric"
                                    value={kilometraje}
                                    onChangeText={setKilometraje}
                                    editable={!guardandoDevolucion}
                                />
                            </View>

                            <Text style={[styles.label, { color: colores.texto }]}>
                                Nivel de combustible *
                            </Text>

                            <View style={[
                                styles.inputContenedor,
                                {
                                    backgroundColor: colores.input,
                                    borderColor: colores.borde,
                                },
                            ]}>
                                <Ionicons
                                    name="water-outline"
                                    size={18}
                                    color={colores.secundario}
                                />
                                <TextInput
                                    style={[styles.input, { color: colores.texto }]}
                                    placeholder="Ej. Lleno, medio tanque, bajo..."
                                    placeholderTextColor={colores.secundario}
                                    value={combustible}
                                    onChangeText={setCombustible}
                                    editable={!guardandoDevolucion}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.botonAccion,
                                    styles.botonGuardar,
                                    guardandoDevolucion && styles.botonDeshabilitado,
                                ]}
                                onPress={guardarDevolucion}
                                disabled={guardandoDevolucion}
                                activeOpacity={0.8}
                            >
                                {guardandoDevolucion ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={19} color="#FFFFFF" />
                                        <Text style={styles.textoBoton}>
                                            Guardar devolución
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.botonCancelar}
                                onPress={() => setModalVisible(false)}
                                disabled={guardandoDevolucion}
                            >
                                <Text style={[
                                    styles.textoCancelar,
                                    { color: colores.secundario },
                                ]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6F8',
    },

    lista: {
        paddingBottom: 30,
        flexGrow: 1,
    },

    encabezado: {
        backgroundColor: '#151515',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 18,
        borderBottomLeftRadius: 23,
        borderBottomRightRadius: 23,
    },

    etiquetaAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: ROJO,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        gap: 5,
        marginBottom: 12,
    },

    etiquetaAdminTexto: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.8,
    },

    encabezadoFila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    encabezadoInfo: {
        flex: 1,
        paddingRight: 10,
    },

    titulo: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: 'bold',
    },

    subtitulo: {
        color: '#C5C5C5',
        fontSize: 12,
        marginTop: 5,
    },

    iconoEncabezado: {
        width: 55,
        height: 55,
        borderRadius: 16,
        backgroundColor: '#302020',
        borderWidth: 1,
        borderColor: '#633033',
        alignItems: 'center',
        justifyContent: 'center',
    },

    indicador: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 17,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#343434',
        gap: 8,
    },

    puntoIndicador: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#53C982',
    },

    textoIndicador: {
        color: '#C5C5C5',
        fontSize: 11,
    },

    seccionResumen: {
        paddingHorizontal: 15,
        paddingTop: 21,
    },

    tituloSeccion: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    subtituloSeccion: {
        fontSize: 11,
        marginTop: 4,
    },

    resumen: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 13,
    },

    tarjetaResumen: {
        flex: 1,
        minWidth: 0,
        borderRadius: 13,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    iconoResumen: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },

    numeroResumen: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    textoResumen: {
        fontSize: 9,
        marginTop: 4,
        textAlign: 'center',
    },

    seccionListaTitulo: {
        paddingHorizontal: 16,
        paddingTop: 25,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    contadorLista: {
        minWidth: 32,
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    contadorListaTexto: {
        color: ROJO,
        fontSize: 13,
        fontWeight: 'bold',
    },

    filtros: {
        paddingHorizontal: 16,
        paddingBottom: 15,
        gap: 8,
    },

    filtroBoton: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
    },

    filtroTexto: {
        fontSize: 11,
        fontWeight: '600',
    },

    tarjeta: {
        borderRadius: 16,
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 14,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },

    tarjetaSuperior: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconoVehiculo: {
        width: 47,
        height: 47,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoVehiculo: {
        flex: 1,
        marginLeft: 11,
        paddingRight: 6,
    },

    nombreVehiculo: {
        fontSize: 15,
        fontWeight: 'bold',
    },

    placaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 5,
    },

    placa: {
        fontSize: 11,
    },

    estadoEtiqueta: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 5,
    },

    puntoEstado: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    estadoTexto: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    separador: {
        height: 1,
        marginVertical: 14,
    },

    idAlquiler: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 14,
    },

    idTexto: {
        fontSize: 11,
    },

    datosGrid: {
        gap: 13,
    },

    dato: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    datoIcono: {
        width: 31,
        height: 31,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },

    datoContenido: {
        flex: 1,
    },

    datoEtiqueta: {
        fontSize: 10,
        marginBottom: 2,
    },

    datoValor: {
        fontSize: 12,
        fontWeight: '600',
    },

    totalContenedor: {
        borderTopWidth: 1,
        marginTop: 16,
        paddingTop: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalEtiqueta: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.7,
    },

    totalDescripcion: {
        fontSize: 10,
        marginTop: 3,
    },

    totalMonto: {
        fontSize: 19,
        color: ROJO,
        fontWeight: 'bold',
    },

    botonAccion: {
        backgroundColor: ROJO,
        borderRadius: 11,
        paddingVertical: 13,
        paddingHorizontal: 13,
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },

    botonDevolucion: {
        backgroundColor: '#202020',
    },

    botonGuardar: {
        marginTop: 24,
    },

    botonDeshabilitado: {
        opacity: 0.6,
    },

    textoBoton: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },

    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cargandoTexto: {
        marginTop: 12,
        fontSize: 12,
    },

    vacio: {
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 35,
        marginHorizontal: 15,
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
    },

    iconoVacio: {
        width: 72,
        height: 72,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },

    vacioTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 14,
    },

    vacioTexto: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 17,
    },

    botonLimpiar: {
        marginTop: 15,
        backgroundColor: ROJO,
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 9,
    },

    botonLimpiarTexto: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },

    errorContenedor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        marginHorizontal: 15,
        marginBottom: 12,
        borderRadius: 10,
    },

    errorTexto: {
        flex: 1,
        color: '#B42318',
        fontSize: 11,
    },

    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.58)',
        justifyContent: 'center',
        padding: 18,
    },

    modalContenido: {
        borderRadius: 19,
        padding: 20,
        maxHeight: '88%',
    },

    modalEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    modalIcono: {
        width: 43,
        height: 43,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    modalTituloContenido: {
        flex: 1,
    },

    modalTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    modalSubtitulo: {
        fontSize: 11,
        marginTop: 4,
    },

    avisoModal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 10,
        padding: 11,
        marginBottom: 13,
    },

    avisoModalTexto: {
        flex: 1,
        color: '#B7791F',
        fontSize: 11,
        lineHeight: 16,
    },

    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 13,
    },

    inputContenedor: {
        minHeight: 47,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        paddingVertical: 11,
        paddingHorizontal: 9,
        fontSize: 12,
    },

    botonCancelar: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
    },

    textoCancelar: {
        fontSize: 13,
        fontWeight: '600',
    },
});