
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

    if (
        valor.includes('completado') ||
        valor.includes('finalizado')
    ) {
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
    const {
        alquileres,
        loading,
        error,
        refrescar,
    } = useAlquileres();

    const [procesandoId, setProcesandoId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [alquilerSeleccionado, setAlquilerSeleccionado] = useState(null);

    const [estadoGeneral, setEstadoGeneral] = useState('');
    const [kilometraje, setKilometraje] = useState('');
    const [combustible, setCombustible] = useState('');

    const [guardandoDevolucion, setGuardandoDevolucion] = useState(false);
    const [filtro, setFiltro] = useState('Todos');

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
            completados: alquileres.filter(
                (item) => {
                    const estado = normalizarEstado(item.estado_alquiler);
                    return estado.includes('completado') || estado.includes('finalizado');
                }
            ).length,
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

    // REGISTRAR ENTREGA
    const confirmarEntrega = (item) => {
        const id = obtenerId(item);

        if (!id) {
            Alert.alert(
                'Error',
                'No se encontró el identificador del alquiler.'
            );
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

    // ABRIR FORMULARIO DE DEVOLUCIÓN
    const abrirDevolucion = (item) => {
        setAlquilerSeleccionado(item);
        setEstadoGeneral('');
        setKilometraje('');
        setCombustible('');
        setModalVisible(true);
    };

    // VALIDAR Y CONFIRMAR DEVOLUCIÓN
    const guardarDevolucion = () => {
        if (!estadoGeneral.trim()) {
            Alert.alert(
                'Campo requerido',
                'Indica el estado general del vehículo.'
            );
            return;
        }

        if (!combustible.trim()) {
            Alert.alert(
                'Campo requerido',
                'Indica el nivel de combustible.'
            );
            return;
        }

        if (
            kilometraje.trim() &&
            !/^\d+$/.test(kilometraje.trim())
        ) {
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

    // GUARDAR DEVOLUCIÓN
    const ejecutarDevolucion = async () => {
        const id = obtenerId(alquilerSeleccionado);

        if (!id) {
            Alert.alert(
                'Error',
                'No se encontró el identificador del alquiler.'
            );
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
            <View style={styles.tarjeta}>
                <View style={styles.tarjetaSuperior}>
                    <View style={styles.iconoVehiculo}>
                        <Ionicons
                            name="car-sport"
                            size={26}
                            color={ROJO}
                        />
                    </View>

                    <View style={styles.infoVehiculo}>
                        <Text style={styles.nombreVehiculo} numberOfLines={1}>
                            {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                        </Text>

                        <View style={styles.placaFila}>
                            <Ionicons
                                name="card-outline"
                                size={13}
                                color="#888888"
                            />
                            <Text style={styles.placa}>
                                {vehiculo.placa || 'Placa no disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.estadoEtiqueta, { backgroundColor: estado.fondo }]}>
                        <View style={[styles.puntoEstado, { backgroundColor: estado.color }]} />
                        <Text style={[styles.estadoTexto, { color: estado.color }]}>
                            {estado.texto}
                        </Text>
                    </View>
                </View>

                <View style={styles.separador} />

                <View style={styles.idAlquiler}>
                    <Ionicons
                        name="document-text-outline"
                        size={15}
                        color="#888888"
                    />
                    <Text style={styles.idTexto}>
                        Alquiler: {id || 'Sin ID'}
                    </Text>
                </View>

                <View style={styles.datosGrid}>
                    <View style={styles.dato}>
                        <View style={styles.datoIcono}>
                            <Ionicons
                                name="calendar-outline"
                                size={16}
                                color="#777777"
                            />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={styles.datoEtiqueta}>Fecha de inicio</Text>
                            <Text style={styles.datoValor}>
                                {formatearFecha(item.fecha_inicio)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dato}>
                        <View style={styles.datoIcono}>
                            <Ionicons
                                name="calendar"
                                size={16}
                                color="#777777"
                            />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={styles.datoEtiqueta}>Fecha de finalización</Text>
                            <Text style={styles.datoValor}>
                                {formatearFecha(item.fecha_fin)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dato}>
                        <View style={styles.datoIcono}>
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color="#777777"
                            />
                        </View>
                        <View style={styles.datoContenido}>
                            <Text style={styles.datoEtiqueta}>Duración</Text>
                            <Text style={styles.datoValor}>
                                {item.cantidad_dias || 'No disponible'} días
                            </Text>
                        </View>
                    </View>

                    {item.fecha_entrega ? (
                        <View style={styles.dato}>
                            <View style={styles.datoIcono}>
                                <Ionicons
                                    name="key-outline"
                                    size={16}
                                    color="#247A48"
                                />
                            </View>
                            <View style={styles.datoContenido}>
                                <Text style={styles.datoEtiqueta}>Vehículo entregado</Text>
                                <Text style={styles.datoValor}>
                                    {formatearFecha(item.fecha_entrega)}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {item.fecha_devolucion ? (
                        <View style={styles.dato}>
                            <View style={styles.datoIcono}>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={16}
                                    color="#247A48"
                                />
                            </View>
                            <View style={styles.datoContenido}>
                                <Text style={styles.datoEtiqueta}>Vehículo devuelto</Text>
                                <Text style={styles.datoValor}>
                                    {formatearFecha(item.fecha_devolucion)}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                <View style={styles.totalContenedor}>
                    <View>
                        <Text style={styles.totalEtiqueta}>MONTO FINAL</Text>
                        <Text style={styles.totalDescripcion}>
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
                                <Ionicons
                                    name="key-outline"
                                    size={19}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.textoBoton}>
                                    Registrar entrega del vehículo
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={17}
                                    color="#FFFFFF"
                                />
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
                        <Ionicons
                            name="arrow-forward"
                            size={17}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    };

    const encabezadoLista = (
        <View>
            <View style={styles.encabezado}>
                <View style={styles.etiquetaAdmin}>
                    <Ionicons
                        name="shield-checkmark"
                        size={12}
                        color="#FFFFFF"
                    />
                    <Text style={styles.etiquetaAdminTexto}>
                        PANEL ADMINISTRATIVO
                    </Text>
                </View>

                <View style={styles.encabezadoFila}>
                    <View style={styles.encabezadoInfo}>
                        <Text style={styles.titulo}>
                            Gestión de alquileres
                        </Text>
                        <Text style={styles.subtitulo}>
                            Supervisa entregas y devoluciones
                        </Text>
                    </View>

                    <View style={styles.iconoEncabezado}>
                        <Ionicons
                            name="document-text"
                            size={27}
                            color="#FFFFFF"
                        />
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
                <Text style={styles.tituloSeccion}>Resumen general</Text>
                <Text style={styles.subtituloSeccion}>
                    Estado de los alquileres registrados
                </Text>

                <View style={styles.resumen}>
                    <View style={styles.tarjetaResumen}>
                        <View style={[styles.iconoResumen, { backgroundColor: '#F1F1F1' }]}>
                            <Ionicons name="documents-outline" size={18} color="#333333" />
                        </View>
                        <Text style={styles.numeroResumen}>{conteos.total}</Text>
                        <Text style={styles.textoResumen}>Total</Text>
                    </View>

                    <View style={styles.tarjetaResumen}>
                        <View style={[styles.iconoResumen, { backgroundColor: '#FFF5DF' }]}>
                            <Ionicons name="time-outline" size={18} color="#B7791F" />
                        </View>
                        <Text style={[styles.numeroResumen, { color: '#B7791F' }]}>
                            {conteos.pendientes}
                        </Text>
                        <Text style={styles.textoResumen}>Pendientes</Text>
                    </View>

                    <View style={styles.tarjetaResumen}>
                        <View style={[styles.iconoResumen, { backgroundColor: '#FDECEC' }]}>
                            <Ionicons name="car-sport-outline" size={18} color={ROJO} />
                        </View>
                        <Text style={[styles.numeroResumen, { color: ROJO }]}>
                            {conteos.activos}
                        </Text>
                        <Text style={styles.textoResumen}>En curso</Text>
                    </View>

                    <View style={styles.tarjetaResumen}>
                        <View style={[styles.iconoResumen, { backgroundColor: '#E8F5EC' }]}>
                            <Ionicons name="checkmark-circle-outline" size={18} color="#247A48" />
                        </View>
                        <Text style={[styles.numeroResumen, { color: '#247A48' }]}>
                            {conteos.completados}
                        </Text>
                        <Text style={styles.textoResumen}>Finalizados</Text>
                    </View>
                </View>
            </View>

            <View style={styles.seccionListaTitulo}>
                <View>
                    <Text style={styles.tituloSeccion}>Registro de alquileres</Text>
                    <Text style={styles.subtituloSeccion}>
                        Consulta y administra cada operación
                    </Text>
                </View>

                <View style={styles.contadorLista}>
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
                                activo && styles.filtroActivo,
                            ]}
                            onPress={() => setFiltro(item)}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.filtroTexto,
                                    activo && styles.filtroTextoActivo,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {error ? (
                <View style={styles.errorContenedor}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={19}
                        color="#B42318"
                    />
                    <Text style={styles.errorTexto}>{error}</Text>
                </View>
            ) : null}
        </View>
    );

    if (loading && alquileres.length === 0) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color={ROJO} />
                <Text style={styles.cargandoTexto}>
                    Cargando alquileres...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <View style={styles.vacio}>
                        <View style={styles.iconoVacio}>
                            <Ionicons
                                name="car-outline"
                                size={42}
                                color="#AAAAAA"
                            />
                        </View>

                        <Text style={styles.vacioTitulo}>
                            No hay alquileres para mostrar
                        </Text>

                        <Text style={styles.vacioTexto}>
                            Cuando existan alquileres registrados,
                            aparecerán aquí.
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
                    <View style={styles.modalContenido}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalEncabezado}>
                                <View style={styles.modalIcono}>
                                    <Ionicons
                                        name="car-outline"
                                        size={23}
                                        color={ROJO}
                                    />
                                </View>

                                <View style={styles.modalTituloContenido}>
                                    <Text style={styles.modalTitulo}>
                                        Registrar devolución
                                    </Text>
                                    <Text style={styles.modalSubtitulo}>
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
                                        color="#888888"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.avisoModal}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={19}
                                    color="#8A641D"
                                />
                                <Text style={styles.avisoModalTexto}>
                                    Completa la información para registrar la devolución.
                                </Text>
                            </View>

                            <Text style={styles.label}>
                                Estado general del vehículo *
                            </Text>

                            <View style={styles.inputContenedor}>
                                <Ionicons
                                    name="clipboard-outline"
                                    size={18}
                                    color="#888888"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Buen estado, con daños..."
                                    placeholderTextColor="#999999"
                                    value={estadoGeneral}
                                    onChangeText={setEstadoGeneral}
                                    editable={!guardandoDevolucion}
                                />
                            </View>

                            <Text style={styles.label}>
                                Kilometraje de devolución
                            </Text>

                            <View style={styles.inputContenedor}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={18}
                                    color="#888888"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. 45000"
                                    placeholderTextColor="#999999"
                                    keyboardType="numeric"
                                    value={kilometraje}
                                    onChangeText={setKilometraje}
                                    editable={!guardandoDevolucion}
                                />
                            </View>

                            <Text style={styles.label}>
                                Nivel de combustible *
                            </Text>

                            <View style={styles.inputContenedor}>
                                <Ionicons
                                    name="water-outline"
                                    size={18}
                                    color="#888888"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Lleno, medio tanque, bajo..."
                                    placeholderTextColor="#999999"
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
                                        <Ionicons
                                            name="save-outline"
                                            size={19}
                                            color="#FFFFFF"
                                        />
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
                                <Text style={styles.textoCancelar}>
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
        paddingTop: 20,
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
        color: '#202020',
        fontSize: 17,
        fontWeight: 'bold',
    },

    subtituloSeccion: {
        color: '#888888',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 13,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
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
        color: '#222222',
        fontSize: 20,
        fontWeight: 'bold',
    },

    textoResumen: {
        color: '#777777',
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
        backgroundColor: '#FDEBEC',
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
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },

    filtroActivo: {
        backgroundColor: ROJO,
        borderColor: ROJO,
    },

    filtroTexto: {
        color: '#666666',
        fontSize: 11,
        fontWeight: '600',
    },

    filtroTextoActivo: {
        color: '#FFFFFF',
    },

    tarjeta: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#EEEEEE',
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
        backgroundColor: '#FDEBEC',
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
        color: '#222222',
    },

    placaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 5,
    },

    placa: {
        fontSize: 11,
        color: '#777777',
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
        backgroundColor: '#EEEEEE',
        marginVertical: 14,
    },

    idAlquiler: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 14,
    },

    idTexto: {
        color: '#777777',
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
        backgroundColor: '#F4F4F4',
        alignItems: 'center',
        justifyContent: 'center',
    },

    datoContenido: {
        flex: 1,
    },

    datoEtiqueta: {
        fontSize: 10,
        color: '#999999',
        marginBottom: 2,
    },

    datoValor: {
        fontSize: 12,
        color: '#444444',
        fontWeight: '600',
    },

    totalContenedor: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        marginTop: 16,
        paddingTop: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalEtiqueta: {
        fontSize: 10,
        color: '#999999',
        fontWeight: 'bold',
        letterSpacing: 0.7,
    },

    totalDescripcion: {
        color: '#888888',
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
        backgroundColor: '#F5F6F8',
    },

    cargandoTexto: {
        color: '#777777',
        marginTop: 12,
        fontSize: 12,
    },

    vacio: {
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 35,
        marginHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
    },

    iconoVacio: {
        width: 72,
        height: 72,
        borderRadius: 23,
        backgroundColor: '#F2F2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    vacioTitulo: {
        color: '#333333',
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 14,
    },

    vacioTexto: {
        color: '#888888',
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
        backgroundColor: '#FDECEC',
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
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#FDEBEC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    modalTituloContenido: {
        flex: 1,
    },

    modalTitulo: {
        color: '#171717',
        fontSize: 17,
        fontWeight: 'bold',
    },

    modalSubtitulo: {
        color: '#888888',
        fontSize: 11,
        marginTop: 4,
    },

    avisoModal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF5DF',
        borderRadius: 10,
        padding: 11,
        marginBottom: 13,
    },

    avisoModalTexto: {
        flex: 1,
        color: '#8A641D',
        fontSize: 11,
        lineHeight: 16,
    },

    label: {
        color: '#333333',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 13,
    },

    inputContenedor: {
        minHeight: 47,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 10,
        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        paddingVertical: 11,
        paddingHorizontal: 9,
        fontSize: 12,
        color: '#222222',
    },

    botonCancelar: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
    },

    textoCancelar: {
        color: '#777777',
        fontSize: 13,
        fontWeight: '600',
    },
});
