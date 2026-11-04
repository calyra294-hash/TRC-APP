import React, { useCallback, useMemo, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useVehiculos } from '../../hooks/useVehiculos';

import {
    getDisponibilidadVehiculos,
    getAlquileres,
} from '../../services/alquileres.service';

import { useTheme } from '../../context/ThemeContext';

const COLOR_ROJO = '#D31A24';

const normalizarEstado = (estado) =>
    String(estado || '').trim().toLowerCase();

const obtenerIdCoche = (item) =>
    String(
        item?.id_coche ??
        item?.vehiculo?.id_coche ??
        item?.vehiculo?.id_vehiculo ??
        item?.id_vehiculo ??
        ''
    );

const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const valor = String(fecha).slice(0, 10);
    const partes = valor.split('-');

    if (partes.length !== 3) return valor;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const VehiculosAdminScreen = () => {
    const { theme, isDark } = useTheme();

    const {
        vehiculos,
        loading,
        error,
        refrescar,
    } = useVehiculos();

    const [disponibilidad, setDisponibilidad] = useState([]);
    const [alquileres, setAlquileres] = useState([]);
    const [cargandoEstados, setCargandoEstados] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [errorEstados, setErrorEstados] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('Todos');

    const cargarEstados = useCallback(async () => {
        try {
            setErrorEstados('');

            const [datosDisponibilidad, datosAlquileres] = await Promise.all([
                getDisponibilidadVehiculos(),
                getAlquileres(),
            ]);

            setDisponibilidad(
                Array.isArray(datosDisponibilidad)
                    ? datosDisponibilidad
                    : []
            );

            setAlquileres(
                Array.isArray(datosAlquileres)
                    ? datosAlquileres
                    : []
            );
        } catch (err) {
            console.error(
                'Error consultando estados de vehículos:',
                err
            );

            setErrorEstados(
                err.message ||
                'No se pudo consultar la disponibilidad.'
            );
        } finally {
            setCargandoEstados(false);
        }
    }, []);

    const cargarTodo = useCallback(async () => {
        setActualizando(true);

        try {
            await Promise.all([
                refrescar(),
                cargarEstados(),
            ]);
        } finally {
            setActualizando(false);
        }
    }, [refrescar, cargarEstados]);

    useFocusEffect(
        useCallback(() => {
            cargarTodo();
        }, [cargarTodo])
    );

    const obtenerEstadoVehiculo = (vehiculo) => {
        const id = String(
            vehiculo.id_coche ?? vehiculo.id
        );

        const alquilerActivo = alquileres.find((alquiler) => {
            const mismoVehiculo = obtenerIdCoche(alquiler) === id;

            const estado = normalizarEstado(
                alquiler.estado_alquiler || alquiler.estado
            );

            return (
                mismoVehiculo &&
                [
                    'activo',
                    'alquilado',
                    'en curso',
                    'en_curso',
                    'vigente',
                ].includes(estado)
            );
        });

        if (alquilerActivo) {
            return {
                nombre: 'Alquilado',
                color: '#C62828',
                fondo: isDark ? '#482323' : '#FDECEC',
                icono: 'car-sport',
                detalle: alquilerActivo.fecha_fin
                    ? `Devolución prevista: ${formatearFecha(
                        alquilerActivo.fecha_fin
                    )}`
                    : 'Vehículo actualmente en alquiler',
            };
        }

        const estadoDisponibilidad = disponibilidad.find(
            (item) => String(item.id_coche) === id
        );

        if (estadoDisponibilidad?.ocupado_actualmente) {
            const alquilerPendiente = alquileres.find((alquiler) => {
                const estado = normalizarEstado(
                    alquiler.estado_alquiler || alquiler.estado
                );

                return (
                    obtenerIdCoche(alquiler) === id &&
                    estado === 'pendiente_entrega'
                );
            });

            return {
                nombre: 'Reservado',
                color: isDark ? '#F2BD59' : '#B7791F',
                fondo: isDark ? '#44351D' : '#FFF5DF',
                icono: 'calendar',
                detalle: alquilerPendiente
                    ? `Entrega pendiente. Hasta: ${formatearFecha(
                        alquilerPendiente.fecha_fin
                    )}`
                    : `Ocupado hasta: ${formatearFecha(
                        estadoDisponibilidad.reservado_hasta
                    )}`,
            };
        }

        if (estadoDisponibilidad?.proxima_reserva_inicio) {
            return {
                nombre: 'Disponible',
                color: isDark ? '#65C98B' : '#247A48',
                fondo: isDark ? '#1D3B2A' : '#E8F5EC',
                icono: 'checkmark-circle',
                detalle: `Disponible hasta: ${formatearFecha(
                    estadoDisponibilidad.disponible_hasta
                )}`,
            };
        }

        return {
            nombre: 'Disponible',
            color: isDark ? '#65C98B' : '#247A48',
            fondo: isDark ? '#1D3B2A' : '#E8F5EC',
            icono: 'checkmark-circle',
            detalle: 'Sin reservas ni alquileres vigentes',
        };
    };

    const vehiculosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        return vehiculos.filter((vehiculo) => {
            const coincideBusqueda =
                !texto ||
                `${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.placa || ''}`
                    .toLowerCase()
                    .includes(texto);

            if (!coincideBusqueda) return false;

            if (filtro === 'Todos') return true;

            return obtenerEstadoVehiculo(vehiculo).nombre === filtro;
        });
    }, [
        vehiculos,
        busqueda,
        filtro,
        disponibilidad,
        alquileres,
        isDark,
    ]);

    const contarEstado = (estado) =>
        vehiculos.filter(
            (vehiculo) =>
                obtenerEstadoVehiculo(vehiculo).nombre === estado
        ).length;

    const filtros = [
        { nombre: 'Todos', icono: 'apps-outline' },
        { nombre: 'Disponible', icono: 'checkmark-circle-outline' },
        { nombre: 'Reservado', icono: 'calendar-outline' },
        { nombre: 'Alquilado', icono: 'car-sport-outline' },
    ];

    const mostrarCargando = loading || cargandoEstados;

    const fondoIconos = isDark ? '#3A2426' : '#FDEBEC';
    const fondoGris = isDark ? '#292929' : '#F1F1F1';

    return (
        <View
            style={[
                styles.contenedor,
                { backgroundColor: theme.background },
            ]}
        >
            {/* ENCABEZADO */}

            <View style={styles.encabezado}>
                <View style={styles.encabezadoSuperior}>
                    <View>
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

                        <Text style={styles.tituloEncabezado}>
                            Control de vehículos
                        </Text>

                        <Text style={styles.subtituloEncabezado}>
                            Consulta y supervisa tu flota
                        </Text>
                    </View>

                    <View style={styles.iconoEncabezado}>
                        <Ionicons
                            name="car-sport"
                            size={29}
                            color="#FFFFFF"
                        />
                    </View>
                </View>

                <View style={styles.indicadorEncabezado}>
                    <View style={styles.puntoActivo} />

                    <Text style={styles.textoIndicador}>
                        Información de disponibilidad
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.contenidoPrincipal}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={actualizando}
                        onRefresh={cargarTodo}
                        colors={[COLOR_ROJO]}
                        tintColor={COLOR_ROJO}
                    />
                }
            >
                {/* RESUMEN DE LA FLOTA */}

                <View style={styles.seccionResumen}>
                    <View style={styles.tituloSeccion}>
                        <View>
                            <Text
                                style={[
                                    styles.tituloBloque,
                                    { color: theme.text },
                                ]}
                            >
                                Resumen de la flota
                            </Text>

                            <Text style={styles.subtituloBloque}>
                                Estado actual de los vehículos
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.iconoResumen,
                                { backgroundColor: fondoIconos },
                            ]}
                        >
                            <Ionicons
                                name="stats-chart"
                                size={18}
                                color={COLOR_ROJO}
                            />
                        </View>
                    </View>

                    <View style={styles.resumen}>
                        <View
                            style={[
                                styles.tarjetaResumen,
                                { backgroundColor: theme.card },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconoResumenTarjeta,
                                    { backgroundColor: fondoGris },
                                ]}
                            >
                                <Ionicons
                                    name="car-outline"
                                    size={19}
                                    color={theme.text}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.numeroTotal,
                                    { color: theme.text },
                                ]}
                            >
                                {vehiculos.length}
                            </Text>

                            <Text
                                style={[
                                    styles.textoResumen,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                Total
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.tarjetaResumen,
                                { backgroundColor: theme.card },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconoResumenTarjeta,
                                    { backgroundColor: isDark ? '#1D3B2A' : '#E8F5EC' },
                                ]}
                            >
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={19}
                                    color={isDark ? '#65C98B' : '#247A48'}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.numeroResumen,
                                    { color: isDark ? '#65C98B' : '#247A48' },
                                ]}
                            >
                                {contarEstado('Disponible')}
                            </Text>

                            <Text
                                style={[
                                    styles.textoResumen,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                Disponibles
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.tarjetaResumen,
                                { backgroundColor: theme.card },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconoResumenTarjeta,
                                    { backgroundColor: isDark ? '#44351D' : '#FFF5DF' },
                                ]}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={19}
                                    color={isDark ? '#F2BD59' : '#B7791F'}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.numeroResumen,
                                    { color: isDark ? '#F2BD59' : '#B7791F' },
                                ]}
                            >
                                {contarEstado('Reservado')}
                            </Text>

                            <Text
                                style={[
                                    styles.textoResumen,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                Reservados
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.tarjetaResumen,
                                { backgroundColor: theme.card },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconoResumenTarjeta,
                                    { backgroundColor: isDark ? '#482323' : '#FDECEC' },
                                ]}
                            >
                                <Ionicons
                                    name="car-sport-outline"
                                    size={19}
                                    color={COLOR_ROJO}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.numeroResumen,
                                    { color: isDark ? '#F17A7A' : COLOR_ROJO },
                                ]}
                            >
                                {contarEstado('Alquilado')}
                            </Text>

                            <Text
                                style={[
                                    styles.textoResumen,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                Alquilados
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CATÁLOGO */}

                <View style={styles.seccionVehiculos}>
                    <View style={styles.tituloSeccion}>
                        <View>
                            <Text
                                style={[
                                    styles.tituloBloque,
                                    { color: theme.text },
                                ]}
                            >
                                Catálogo de vehículos
                            </Text>

                            <Text style={styles.subtituloBloque}>
                                Consulta los vehículos registrados
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.contadorResultados,
                                { backgroundColor: fondoIconos },
                            ]}
                        >
                            <Text style={styles.contadorResultadosTexto}>
                                {vehiculosFiltrados.length}
                            </Text>
                        </View>
                    </View>

                    {/* BUSCADOR */}

                    <View
                        style={[
                            styles.buscador,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={21}
                            color={COLOR_ROJO}
                        />

                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text },
                            ]}
                            placeholder="Buscar marca, modelo o placa"
                            placeholderTextColor={theme.secondaryText}
                            value={busqueda}
                            onChangeText={setBusqueda}
                        />

                        {busqueda.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setBusqueda('')}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color={theme.secondaryText}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text
                        style={[
                            styles.textoFiltros,
                            { color: theme.text },
                        ]}
                    >
                        Filtrar por estado
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtrosContenido}
                    >
                        {filtros.map((item) => {
                            const activo = filtro === item.nombre;

                            return (
                                <TouchableOpacity
                                    key={item.nombre}
                                    style={[
                                        styles.filtroBoton,
                                        {
                                            backgroundColor: theme.card,
                                            borderColor: theme.border,
                                        },
                                        activo && styles.filtroActivo,
                                    ]}
                                    onPress={() => setFiltro(item.nombre)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={item.icono}
                                        size={15}
                                        color={
                                            activo
                                                ? '#FFFFFF'
                                                : theme.secondaryText
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.filtroTexto,
                                            { color: theme.secondaryText },
                                            activo && styles.filtroTextoActivo,
                                        ]}
                                    >
                                        {item.nombre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* ERRORES */}

                    {error && (
                        <View style={styles.errorContenedor}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={19}
                                color="#B42318"
                            />

                            <Text style={styles.errorTexto}>
                                {error}
                            </Text>
                        </View>
                    )}

                    {errorEstados !== '' && (
                        <View style={styles.errorContenedor}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={19}
                                color="#B42318"
                            />

                            <View style={styles.errorContenido}>
                                <Text style={styles.errorTexto}>
                                    {errorEstados}
                                </Text>

                                <TouchableOpacity
                                    onPress={cargarTodo}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.reintentar}>
                                        Reintentar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* CARGANDO */}

                    {mostrarCargando && vehiculos.length === 0 ? (
                        <View style={styles.cargando}>
                            <ActivityIndicator
                                size="large"
                                color={COLOR_ROJO}
                            />

                            <Text
                                style={[
                                    styles.textoCargando,
                                    { color: theme.secondaryText },
                                ]}
                            >
                                Cargando información de vehículos...
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* SIN RESULTADOS */}

                            {vehiculosFiltrados.length === 0 ? (
                                <View
                                    style={[
                                        styles.vacio,
                                        { backgroundColor: theme.card },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.iconoVacio,
                                            { backgroundColor: fondoGris },
                                        ]}
                                    >
                                        <Ionicons
                                            name="car-outline"
                                            size={42}
                                            color={theme.secondaryText}
                                        />
                                    </View>

                                    <Text
                                        style={[
                                            styles.vacioTitulo,
                                            { color: theme.text },
                                        ]}
                                    >
                                        No hay vehículos para mostrar
                                    </Text>

                                    <Text
                                        style={[
                                            styles.vacioTexto,
                                            { color: theme.secondaryText },
                                        ]}
                                    >
                                        Prueba con otro filtro o término de búsqueda.
                                    </Text>

                                    {(busqueda !== '' || filtro !== 'Todos') && (
                                        <TouchableOpacity
                                            style={styles.limpiarFiltros}
                                            onPress={() => {
                                                setBusqueda('');
                                                setFiltro('Todos');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.limpiarFiltrosTexto}>
                                                Limpiar filtros
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                /* TARJETAS DE VEHÍCULOS */

                                vehiculosFiltrados.map((vehiculo) => {
                                    const estado = obtenerEstadoVehiculo(vehiculo);

                                    const imagen =
                                        vehiculo.imagen ||
                                        vehiculo.url_imagen;

                                    const precio = Number(
                                        vehiculo.precio ||
                                        vehiculo.valor_dia ||
                                        0
                                    );

                                    return (
                                        <View
                                            key={String(
                                                vehiculo.id_coche ?? vehiculo.id
                                            )}
                                            style={[
                                                styles.tarjetaVehiculo,
                                                {
                                                    backgroundColor: theme.card,
                                                    borderColor: theme.border,
                                                },
                                            ]}
                                        >
                                            <View style={styles.contenedorImagen}>
                                                {imagen ? (
                                                    <Image
                                                        source={{ uri: imagen }}
                                                        style={styles.imagen}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View
                                                        style={[
                                                            styles.imagenVacia,
                                                            {
                                                                backgroundColor: fondoGris,
                                                            },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="car-sport-outline"
                                                            size={55}
                                                            color={theme.secondaryText}
                                                        />

                                                        <Text
                                                            style={[
                                                                styles.textoImagenVacia,
                                                                { color: theme.secondaryText },
                                                            ]}
                                                        >
                                                            Sin imagen disponible
                                                        </Text>
                                                    </View>
                                                )}

                                                <View
                                                    style={[
                                                        styles.estadoEtiqueta,
                                                        { backgroundColor: estado.fondo },
                                                    ]}
                                                >
                                                    <View
                                                        style={[
                                                            styles.puntoEstado,
                                                            { backgroundColor: estado.color },
                                                        ]}
                                                    />

                                                    <Text
                                                        style={[
                                                            styles.estadoTexto,
                                                            { color: estado.color },
                                                        ]}
                                                    >
                                                        {estado.nombre}
                                                    </Text>
                                                </View>

                                                <View style={styles.etiquetaPrecio}>
                                                    <Text style={styles.precioEtiquetaTexto}>
                                                        C$ {precio.toLocaleString('es-NI')}
                                                    </Text>

                                                    <Text style={styles.precioEtiquetaUnidad}>
                                                        / día
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.contenidoTarjeta}>
                                                <View style={styles.filaTitulo}>
                                                    <View style={styles.datosVehiculo}>
                                                        <Text
                                                            style={[
                                                                styles.nombreVehiculo,
                                                                { color: theme.text },
                                                            ]}
                                                        >
                                                            {vehiculo.marca} {vehiculo.modelo}
                                                        </Text>

                                                        <Text
                                                            style={[
                                                                styles.anio,
                                                                { color: theme.secondaryText },
                                                            ]}
                                                        >
                                                            {vehiculo.anio || 'Año no especificado'}
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.iconoVehiculo,
                                                            { backgroundColor: fondoIconos },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="car-outline"
                                                            size={21}
                                                            color={COLOR_ROJO}
                                                        />
                                                    </View>
                                                </View>

                                                <View
                                                    style={[
                                                        styles.placaContenedor,
                                                        { backgroundColor: fondoGris },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name="card-outline"
                                                        size={16}
                                                        color={theme.secondaryText}
                                                    />

                                                    <Text
                                                        style={[
                                                            styles.placaTexto,
                                                            { color: theme.secondaryText },
                                                        ]}
                                                    >
                                                        PLACA
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            styles.placaValor,
                                                            { color: theme.text },
                                                        ]}
                                                    >
                                                        {vehiculo.placa || 'No registrada'}
                                                    </Text>
                                                </View>

                                                <View
                                                    style={[
                                                        styles.detalleEstado,
                                                        { backgroundColor: estado.fondo },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name="information-circle-outline"
                                                        size={18}
                                                        color={estado.color}
                                                    />

                                                    <Text
                                                        style={[
                                                            styles.detalleEstadoTexto,
                                                            { color: estado.color },
                                                        ]}
                                                    >
                                                        {estado.detalle}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
    },

    encabezado: {
        backgroundColor: '#121111',
        paddingHorizontal: 21,
        paddingTop: 40,
        paddingBottom: 19,
        borderBottomLeftRadius: 23,
        borderBottomRightRadius: 23,
    },

    encabezadoSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    etiquetaAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLOR_ROJO,
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

    tituloEncabezado: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 0.2,
    },

    subtituloEncabezado: {
        color: '#BDBDBD',
        fontSize: 12,
        marginTop: 5,
    },

    iconoEncabezado: {
        width: 57,
        height: 57,
        borderRadius: 17,
        backgroundColor: '#302020',
        borderWidth: 1,
        borderColor: '#633033',
        alignItems: 'center',
        justifyContent: 'center',
    },

    indicadorEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        paddingTop: 13,
        borderTopWidth: 1,
        borderTopColor: '#2F2C2C',
        gap: 8,
    },

    puntoActivo: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#53C982',
    },

    textoIndicador: {
        color: '#C5C5C5',
        fontSize: 11,
    },

    contenidoPrincipal: {
        flex: 1,
    },

    seccionResumen: {
        paddingHorizontal: 15,
        paddingTop: 21,
    },

    tituloSeccion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 13,
    },

    tituloBloque: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    subtituloBloque: {
        color: '#888888',
        fontSize: 11,
        marginTop: 4,
    },

    iconoResumen: {
        width: 35,
        height: 35,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    resumen: {
        flexDirection: 'row',
        gap: 8,
    },

    tarjetaResumen: {
        flex: 1,
        minWidth: 0,
        borderRadius: 13,
        paddingVertical: 12,
        paddingHorizontal: 5,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    iconoResumenTarjeta: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },

    numeroTotal: {
        fontSize: 21,
        fontWeight: 'bold',
    },

    numeroResumen: {
        fontSize: 21,
        fontWeight: 'bold',
    },

    textoResumen: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },

    seccionVehiculos: {
        paddingHorizontal: 15,
        paddingTop: 25,
        paddingBottom: 30,
    },

    contadorResultados: {
        minWidth: 32,
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    contadorResultadosTexto: {
        color: COLOR_ROJO,
        fontSize: 13,
        fontWeight: 'bold',
    },

    buscador: {
        height: 49,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 13,
        marginTop: 4,
        elevation: 1,
    },

    input: {
        flex: 1,
        marginLeft: 9,
        fontSize: 12,
        height: '100%',
    },

    textoFiltros: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 17,
        marginBottom: 9,
    },

    filtrosContenido: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 17,
    },

    filtroBoton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
    },

    filtroActivo: {
        backgroundColor: COLOR_ROJO,
        borderColor: COLOR_ROJO,
    },

    filtroTexto: {
        fontSize: 11,
        fontWeight: '600',
    },

    filtroTextoActivo: {
        color: '#FFFFFF',
    },

    tarjetaVehiculo: {
        borderRadius: 17,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
    },

    contenedorImagen: {
        height: 175,
        backgroundColor: '#E9E9E9',
        position: 'relative',
    },

    imagen: {
        width: '100%',
        height: '100%',
    },

    imagenVacia: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoImagenVacia: {
        fontSize: 11,
        marginTop: 7,
    },

    estadoEtiqueta: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
        elevation: 2,
    },

    puntoEstado: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },

    estadoTexto: {
        fontSize: 10,
        fontWeight: 'bold',
    },

    etiquetaPrecio: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        backgroundColor: '#151515',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    precioEtiquetaTexto: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

    precioEtiquetaUnidad: {
        color: '#D0D0D0',
        fontSize: 10,
        marginLeft: 3,
    },

    contenidoTarjeta: {
        padding: 15,
    },

    filaTitulo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 13,
    },

    datosVehiculo: {
        flex: 1,
        paddingRight: 8,
    },

    nombreVehiculo: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    anio: {
        fontSize: 11,
        marginTop: 4,
    },

    iconoVehiculo: {
        width: 37,
        height: 37,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    placaContenedor: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 7,
        marginBottom: 13,
    },

    placaTexto: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    placaValor: {
        fontSize: 11,
        fontWeight: 'bold',
    },

    detalleEstado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
        paddingVertical: 10,
        borderRadius: 9,
        gap: 8,
    },

    detalleEstadoTexto: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 16,
    },

    cargando: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 55,
    },

    textoCargando: {
        fontSize: 12,
        marginTop: 12,
    },

    vacio: {
        borderRadius: 16,
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 35,
        marginTop: 5,
    },

    iconoVacio: {
        width: 75,
        height: 75,
        borderRadius: 25,
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
        marginTop: 7,
        textAlign: 'center',
        lineHeight: 17,
    },

    limpiarFiltros: {
        marginTop: 15,
        backgroundColor: COLOR_ROJO,
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 9,
    },

    limpiarFiltrosTexto: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },

    errorContenedor: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FDECEC',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },

    errorContenido: {
        flex: 1,
    },

    errorTexto: {
        flex: 1,
        color: '#B42318',
        fontSize: 11,
        lineHeight: 16,
    },

    reintentar: {
        color: COLOR_ROJO,
        fontWeight: 'bold',
        fontSize: 11,
        marginTop: 7,
    },
});

export default VehiculosAdminScreen;