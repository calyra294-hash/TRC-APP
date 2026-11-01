
import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
    obtenerNotificaciones,
    marcarNotificacionLeida,
    marcarTodasLeidas,
} from "../../../services/notificaciones.service.js";

export default function NotificacionesScreen({ navigation }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [marcando, setMarcando] = useState(false);

    const cargarNotificaciones = useCallback(async () => {
        try {
            const resultado = await obtenerNotificaciones();

            setNotificaciones(
                Array.isArray(resultado?.notificaciones)
                    ? resultado.notificaciones
                    : []
            );
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
            Alert.alert(
                "Error",
                error.message || "No se pudieron cargar las notificaciones."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            cargarNotificaciones();
        });

        return unsubscribe;
    }, [navigation, cargarNotificaciones]);

    const noLeidas = notificaciones.filter(
        item => item.leido === false
    ).length;

    const formatearFecha = fecha => {
        if (!fecha) return "Fecha no disponible";

        let date;

        if (fecha?.seconds) {
            date = new Date(fecha.seconds * 1000);
        } else if (fecha?._seconds) {
            date = new Date(fecha._seconds * 1000);
        } else {
            date = new Date(fecha);
        }

        if (Number.isNaN(date.getTime())) {
            return "Fecha no disponible";
        }

        return date.toLocaleString("es-NI", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const obtenerIcono = tipo => {
        const valor = String(tipo || "").toLowerCase();

        if (valor.includes("reserva")) return "calendar-outline";
        if (valor.includes("alquiler")) return "car-sport-outline";
        if (valor.includes("entrega")) return "key-outline";

        if (
            valor.includes("devolucion") ||
            valor.includes("devolución")
        ) {
            return "checkmark-done-outline";
        }

        if (
            valor.includes("resena") ||
            valor.includes("reseña")
        ) {
            return "star-outline";
        }

        return "notifications-outline";
    };

    const obtenerEtiqueta = tipo => {
        const valor = String(tipo || "").toLowerCase();

        if (valor.includes("reserva")) return "RESERVA";
        if (valor.includes("alquiler")) return "ALQUILER";
        if (valor.includes("entrega")) return "ENTREGA";

        if (
            valor.includes("devolucion") ||
            valor.includes("devolución")
        ) {
            return "DEVOLUCIÓN";
        }

        if (
            valor.includes("resena") ||
            valor.includes("reseña")
        ) {
            return "RESEÑA";
        }

        return "TRC APP";
    };

    const handleMarcarLeida = async item => {
        if (item.leido) return;

        try {
            setMarcando(true);

            await marcarNotificacionLeida(item.id);

            setNotificaciones(actuales =>
                actuales.map(notificacion =>
                    notificacion.id === item.id
                        ? { ...notificacion, leido: true }
                        : notificacion
                )
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error.message || "No se pudo actualizar la notificación."
            );
        } finally {
            setMarcando(false);
        }
    };

    const handleMarcarTodas = async () => {
        if (noLeidas === 0 || marcando) return;

        try {
            setMarcando(true);

            await marcarTodasLeidas();

            setNotificaciones(actuales =>
                actuales.map(item => ({
                    ...item,
                    leido: true,
                }))
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error.message || "No se pudieron marcar todas como leídas."
            );
        } finally {
            setMarcando(false);
        }
    };

    const renderNotificacion = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.notificacion,
                !item.leido && styles.notificacionNoLeida,
            ]}
            activeOpacity={0.85}
            onPress={() => handleMarcarLeida(item)}
            disabled={marcando}
        >
            <View style={[
                styles.iconoContainer,
                !item.leido && styles.iconoNoLeido,
            ]}>
                <Ionicons
                    name={obtenerIcono(item.tipo)}
                    size={24}
                    color={item.leido ? "#929292" : "#D31A24"}
                />
            </View>

            <View style={styles.contenido}>
                <View style={styles.filaSuperior}>
                    <Text style={[
                        styles.etiquetaTipo,
                        !item.leido && styles.etiquetaTipoNueva,
                    ]}>
                        {obtenerEtiqueta(item.tipo)}
                    </Text>

                    {!item.leido && (
                        <View style={styles.estadoNuevo}>
                            <View style={styles.puntoNoLeido} />
                            <Text style={styles.textoNuevo}>NUEVA</Text>
                        </View>
                    )}
                </View>

                <Text style={[
                    styles.titulo,
                    !item.leido && styles.tituloNoLeido,
                ]}>
                    {item.titulo || "Notificación"}
                </Text>

                <Text style={styles.mensaje}>
                    {item.mensaje || "Tienes una nueva notificación."}
                </Text>

                <View style={styles.filaFecha}>
                    <Ionicons
                        name="time-outline"
                        size={13}
                        color="#A0A0A0"
                    />

                    <Text style={styles.fecha}>
                        {formatearFecha(item.fecha_creacion)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="#121212"
                />

                <View style={styles.cargando}>
                    <ActivityIndicator size="large" color="#D31A24" />
                    <Text style={styles.textoCargando}>
                        Cargando notificaciones...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#121212"
            />

            {/* ENCABEZADO */}
            <View style={styles.header}>
                <View style={styles.headerSuperior}>
                    <TouchableOpacity
                        style={styles.botonVolver}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>

                    <View style={styles.marca}>
                        <View style={styles.logo}>
                            <Ionicons
                                name="car-sport"
                                size={19}
                                color="#FFFFFF"
                            />
                        </View>

                        <View>
                            <Text style={styles.marcaNombre}>TRC APP</Text>
                            <Text style={styles.marcaSubtitulo}>
                                NOTIFICACIONES
                            </Text>
                        </View>
                    </View>

                    <View style={styles.iconoCampana}>
                        <Ionicons
                            name="notifications"
                            size={23}
                            color="#FFFFFF"
                        />

                        {noLeidas > 0 && (
                            <View style={styles.badgeHeader}>
                                <Text style={styles.badgeHeaderTexto}>
                                    {noLeidas > 99 ? "99+" : noLeidas}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.headerTituloContenedor}>
                    <Text style={styles.headerTitulo}>
                        Tus notificaciones
                    </Text>

                    <Text style={styles.headerSubtitulo}>
                        Mantente al día con las novedades de TRC App.
                    </Text>
                </View>

                <View style={styles.lineaRoja} />
            </View>

            {/* RESUMEN */}
            <View style={styles.resumen}>
                <View style={styles.resumenIcono}>
                    <Ionicons
                        name="notifications-outline"
                        size={22}
                        color="#D31A24"
                    />
                </View>

                <View style={styles.resumenContenido}>
                    <Text style={styles.resumenTitulo}>
                        Centro de notificaciones
                    </Text>

                    <Text style={styles.resumenTexto}>
                        {notificaciones.length} en total
                    </Text>
                </View>

                <View style={styles.resumenContador}>
                    <Text style={styles.contadorNumero}>
                        {noLeidas}
                    </Text>
                    <Text style={styles.contadorEtiqueta}>
                        SIN LEER
                    </Text>
                </View>
            </View>

            {/* TITULO DE LISTA */}
            <View style={styles.listaEncabezado}>
                <View>
                    <Text style={styles.listaTitulo}>
                        Actividad reciente
                    </Text>
                    <Text style={styles.listaSubtitulo}>
                        Aquí aparecen tus novedades
                    </Text>
                </View>

                {noLeidas > 0 && (
                    <TouchableOpacity
                        style={styles.botonLeerTodas}
                        onPress={handleMarcarTodas}
                        disabled={marcando}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="checkmark-done"
                            size={15}
                            color="#D31A24"
                        />

                        <Text style={styles.marcarTodas}>
                            Leer todas
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* LISTA */}
            <FlatList
                data={notificaciones}
                keyExtractor={(item, index) =>
                    String(item.id || index)
                }
                renderItem={renderNotificacion}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            cargarNotificaciones();
                        }}
                        colors={["#D31A24"]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <View style={styles.vacioDecoracion}>
                            <View style={styles.vacioIcono}>
                                <Ionicons
                                    name="notifications-off-outline"
                                    size={43}
                                    color="#D31A24"
                                />
                            </View>
                        </View>

                        <Text style={styles.vacioTitulo}>
                            ¡Todo tranquilo por aquí!
                        </Text>

                        <Text style={styles.vacioTexto}>
                            Cuando tengas novedades sobre tus reservas o
                            alquileres, aparecerán aquí.
                        </Text>

                        <View style={styles.vacioEstado}>
                            <View style={styles.vacioPunto} />
                            <Text style={styles.vacioEstadoTexto}>
                                Estás al día
                            </Text>
                        </View>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F4F5",
    },

    header: {
        backgroundColor: "#121212",
        paddingHorizontal: 19,
        paddingTop: 30,
        paddingBottom: 24,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: "hidden",
    },

    headerSuperior: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    botonVolver: {
        width: 39,
        height: 39,
        borderRadius: 13,
        backgroundColor: "#292929",
        alignItems: "center",
        justifyContent: "center",
    },

    marca: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },

    logo: {
        width: 35,
        height: 35,
        borderRadius: 11,
        backgroundColor: "#D31A24",
        alignItems: "center",
        justifyContent: "center",
    },

    marcaNombre: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1,
    },

    marcaSubtitulo: {
        color: "#AAAAAA",
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 1.1,
        marginTop: 2,
    },

    iconoCampana: {
        width: 39,
        height: 39,
        borderRadius: 13,
        backgroundColor: "#292929",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    badgeHeader: {
        position: "absolute",
        top: -5,
        right: -5,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: "#D31A24",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#121212",
    },

    badgeHeaderTexto: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "bold",
    },

    headerTituloContenedor: {
        marginTop: 25,
    },

    headerTitulo: {
        color: "#FFFFFF",
        fontSize: 23,
        fontWeight: "bold",
    },

    headerSubtitulo: {
        color: "#AAAAAA",
        fontSize: 12,
        marginTop: 7,
    },

    lineaRoja: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "35%",
        height: 4,
        backgroundColor: "#D31A24",
    },

    resumen: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 17,
        marginTop: 19,
        padding: 15,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEEEEE",
        elevation: 2,
    },

    resumenIcono: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: "#FCEBEC",
        alignItems: "center",
        justifyContent: "center",
    },

    resumenContenido: {
        flex: 1,
        marginLeft: 12,
    },

    resumenTitulo: {
        color: "#222222",
        fontSize: 13,
        fontWeight: "bold",
    },

    resumenTexto: {
        color: "#999999",
        fontSize: 11,
        marginTop: 5,
    },

    resumenContador: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF0F0",
        minWidth: 54,
        paddingVertical: 7,
        paddingHorizontal: 9,
        borderRadius: 13,
    },

    contadorNumero: {
        color: "#D31A24",
        fontSize: 20,
        fontWeight: "bold",
    },

    contadorEtiqueta: {
        color: "#D31A24",
        fontSize: 7,
        fontWeight: "bold",
        marginTop: 1,
    },

    listaEncabezado: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 25,
        marginBottom: 14,
    },

    listaTitulo: {
        color: "#191919",
        fontSize: 16,
        fontWeight: "bold",
    },

    listaSubtitulo: {
        color: "#999999",
        fontSize: 11,
        marginTop: 4,
    },

    botonLeerTodas: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FFF0F0",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 11,
    },

    marcarTodas: {
        color: "#D31A24",
        fontSize: 10,
        fontWeight: "bold",
    },

    lista: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        flexGrow: 1,
    },

    notificacion: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        elevation: 2,
        shadowColor: "#000000",
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    notificacionNoLeida: {
        backgroundColor: "#FFFAFA",
        borderColor: "#F2D1D3",
        borderLeftWidth: 4,
        borderLeftColor: "#D31A24",
    },

    iconoContainer: {
        width: 47,
        height: 47,
        borderRadius: 15,
        backgroundColor: "#F1F1F1",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    iconoNoLeido: {
        backgroundColor: "#FFE8E9",
    },

    contenido: {
        flex: 1,
    },

    filaSuperior: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
    },

    etiquetaTipo: {
        color: "#999999",
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: 0.8,
    },

    etiquetaTipoNueva: {
        color: "#D31A24",
    },

    estadoNuevo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    puntoNoLeido: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#D31A24",
    },

    textoNuevo: {
        color: "#D31A24",
        fontSize: 8,
        fontWeight: "bold",
    },

    titulo: {
        color: "#777777",
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
    },

    tituloNoLeido: {
        color: "#191919",
        fontWeight: "bold",
    },

    mensaje: {
        color: "#777777",
        fontSize: 12,
        lineHeight: 19,
        marginTop: 5,
    },

    filaFecha: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 5,
    },

    fecha: {
        color: "#A0A0A0",
        fontSize: 10,
    },

    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    textoCargando: {
        color: "#777777",
        fontSize: 13,
        marginTop: 12,
    },

    vacio: {
        flex: 1,
        minHeight: 340,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 35,
    },

    vacioDecoracion: {
        width: 110,
        height: 110,
        borderRadius: 35,
        backgroundColor: "#FCEBEC",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 22,
    },

    vacioIcono: {
        width: 83,
        height: 83,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    vacioTitulo: {
        color: "#222222",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },

    vacioTexto: {
        color: "#888888",
        fontSize: 12,
        textAlign: "center",
        lineHeight: 21,
        marginTop: 9,
    },

    vacioEstado: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },

    vacioPunto: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#64C58B",
        marginRight: 7,
    },

    vacioEstadoTexto: {
        color: "#777777",
        fontSize: 10,
        fontWeight: "600",
    },
});
