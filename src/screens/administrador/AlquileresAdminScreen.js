
import React, { useState } from "react";
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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAlquileres } from "../../hooks/useAlquileres";

import {
    registrarEntregaAlquiler,
    registrarDevolucionAlquiler,
} from "../../services/alquileres.service";

function formatearFecha(fecha) {
    if (!fecha) return "No disponible";

    try {
        let valor = fecha;

        if (typeof valor === "object") {
            if (typeof valor.toDate === "function") {
                valor = valor.toDate();
            } else if (valor._seconds) {
                valor = new Date(valor._seconds * 1000);
            } else if (valor.seconds) {
                valor = new Date(valor.seconds * 1000);
            }
        }

        const date = new Date(valor);

        if (Number.isNaN(date.getTime())) {
            return "No disponible";
        }

        return date.toLocaleDateString("es-NI");
    } catch {
        return "No disponible";
    }
}

function obtenerEstado(estado) {
    const valor = String(estado || "Sin estado").toLowerCase();

    if (valor === "activo" || valor.includes("en curso")) {
        return {
            texto: "EN CURSO",
            color: "#D97706",
            fondo: "#FEF3C7",
        };
    }

    if (valor.includes("pendiente")) {
        return {
            texto: "PENDIENTE",
            color: "#B45309",
            fondo: "#FEF3C7",
        };
    }

    if (
        valor.includes("completado") ||
        valor.includes("finalizado")
    ) {
        return {
            texto: "COMPLETADO",
            color: "#15803D",
            fondo: "#DCFCE7",
        };
    }

    if (valor.includes("cancelado")) {
        return {
            texto: "CANCELADO",
            color: "#B91C1C",
            fondo: "#FEE2E2",
        };
    }

    return {
        texto: valor.toUpperCase(),
        color: "#555555",
        fondo: "#EEEEEE",
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
    const [alquilerSeleccionado, setAlquilerSeleccionado] =
        useState(null);

    const [estadoGeneral, setEstadoGeneral] = useState("");
    const [kilometraje, setKilometraje] = useState("");
    const [combustible, setCombustible] = useState("");

    const [guardandoDevolucion, setGuardandoDevolucion] =
        useState(false);

    const obtenerId = (item) =>
        String(item.id || item.id_alquiler || "");

    // REGISTRAR ENTREGA
    const confirmarEntrega = (item) => {
        const id = obtenerId(item);

        if (!id) {
            Alert.alert("Error", "No se encontró el identificador del alquiler.");
            return;
        }

        Alert.alert(
            "Confirmar entrega",
            "¿Deseas registrar la entrega de este vehículo al cliente?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sí, entregar",
                    onPress: async () => {
                        try {
                            setProcesandoId(id);

                            await registrarEntregaAlquiler(id);

                            Alert.alert(
                                "Entrega registrada",
                                "El vehículo fue entregado correctamente."
                            );

                            await refrescar();
                        } catch (err) {
                            Alert.alert(
                                "Error",
                                err.message || "No se pudo registrar la entrega."
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
        setEstadoGeneral("");
        setKilometraje("");
        setCombustible("");
        setModalVisible(true);
    };

    // GUARDAR DEVOLUCIÓN
    const guardarDevolucion = () => {
        if (!estadoGeneral.trim()) {
            Alert.alert(
                "Campo requerido",
                "Indica el estado general del vehículo."
            );
            return;
        }

        if (!combustible.trim()) {
            Alert.alert(
                "Campo requerido",
                "Indica el nivel de combustible."
            );
            return;
        }

        if (
            kilometraje.trim() &&
            (!/^\d+$/.test(kilometraje.trim()))
        ) {
            Alert.alert(
                "Kilometraje inválido",
                "Ingresa un kilometraje válido usando solo números."
            );
            return;
        }

        Alert.alert(
            "Confirmar devolución",
            "¿Deseas registrar la devolución de este vehículo?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Registrar",
                    onPress: ejecutarDevolucion,
                },
            ]
        );
    };

    const ejecutarDevolucion = async () => {
        const id = obtenerId(alquilerSeleccionado);

        if (!id) {
            Alert.alert("Error", "No se encontró el identificador del alquiler.");
            return;
        }

        try {
            setGuardandoDevolucion(true);
            setProcesandoId(id);

            await registrarDevolucionAlquiler(id, {
                estado_general: estadoGeneral.trim(),
                kilometraje_devolucion: kilometraje.trim()
                    ? Number(kilometraje)
                    : "No especificado",
                nivel_combustible: combustible.trim(),
            });

            setModalVisible(false);
            setAlquilerSeleccionado(null);

            Alert.alert(
                "Devolución registrada",
                "La devolución del vehículo se guardó correctamente."
            );

            await refrescar();
        } catch (err) {
            Alert.alert(
                "Error",
                err.message || "No se pudo registrar la devolución."
            );
        } finally {
            setGuardandoDevolucion(false);
            setProcesandoId(null);
        }
    };

    const renderAlquiler = ({ item }) => {
        const estado = obtenerEstado(item.estado_alquiler);
        const vehiculo = item.vehiculo || {};
        const estadoActual = String(
            item.estado_alquiler || ""
        ).toLowerCase();

        const id = obtenerId(item);
        const ocupado = procesandoId === id;

        const monto = Number(item.monto_final || 0);

        return (
            <View style={styles.card}>
                <View style={styles.encabezado}>
                    <View style={styles.iconoVehiculo}>
                        <Ionicons
                            name="car-sport"
                            size={27}
                            color="#D31A24"
                        />
                    </View>

                    <View style={styles.infoVehiculo}>
                        <Text style={styles.vehiculo}>
                            {vehiculo.marca || "Vehículo"}{" "}
                            {vehiculo.modelo || ""}
                        </Text>

                        <Text style={styles.placa}>
                            Placa: {vehiculo.placa || "No disponible"}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.estado,
                            { backgroundColor: estado.fondo },
                        ]}
                    >
                        <Text
                            style={[
                                styles.estadoTexto,
                                { color: estado.color },
                            ]}
                        >
                            {estado.texto}
                        </Text>
                    </View>
                </View>

                <View style={styles.divisor} />

                <View style={styles.dato}>
                    <Ionicons
                        name="document-text-outline"
                        size={17}
                        color="#777777"
                    />
                    <Text style={styles.datoTexto}>
                        Alquiler: {id || "Sin ID"}
                    </Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons
                        name="calendar-outline"
                        size={17}
                        color="#777777"
                    />
                    <Text style={styles.datoTexto}>
                        Inicio: {formatearFecha(item.fecha_inicio)}
                    </Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons
                        name="calendar"
                        size={17}
                        color="#777777"
                    />
                    <Text style={styles.datoTexto}>
                        Finalización: {formatearFecha(item.fecha_fin)}
                    </Text>
                </View>

                <View style={styles.dato}>
                    <Ionicons
                        name="time-outline"
                        size={17}
                        color="#777777"
                    />
                    <Text style={styles.datoTexto}>
                        Duración: {item.cantidad_dias || "No disponible"} días
                    </Text>
                </View>

                {item.fecha_entrega ? (
                    <View style={styles.dato}>
                        <Ionicons
                            name="key-outline"
                            size={17}
                            color="#777777"
                        />
                        <Text style={styles.datoTexto}>
                            Entregado: {formatearFecha(item.fecha_entrega)}
                        </Text>
                    </View>
                ) : null}

                {item.fecha_devolucion ? (
                    <View style={styles.dato}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={17}
                            color="#15803D"
                        />
                        <Text style={styles.datoTexto}>
                            Devuelto: {formatearFecha(item.fecha_devolucion)}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.total}>
                    <Text style={styles.totalEtiqueta}>
                        Monto final
                    </Text>

                    <Text style={styles.totalMonto}>
                        C$ {monto.toLocaleString("es-NI")}
                    </Text>
                </View>

                {estadoActual === "pendiente_entrega" ? (
                    <TouchableOpacity
                        style={[
                            styles.botonAccion,
                            ocupado && styles.botonDeshabilitado,
                        ]}
                        onPress={() => confirmarEntrega(item)}
                        disabled={ocupado}
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
                                    Entregar vehículo
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : null}

                {estadoActual === "activo" ? (
                    <TouchableOpacity
                        style={[
                            styles.botonAccion,
                            styles.botonDevolucion,
                            ocupado && styles.botonDeshabilitado,
                        ]}
                        onPress={() => abrirDevolucion(item)}
                        disabled={ocupado}
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={19}
                            color="#FFFFFF"
                        />
                        <Text style={styles.textoBoton}>
                            Registrar devolución
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    };

    if (loading && alquileres.length === 0) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#D31A24" />
                <Text style={styles.cargandoTexto}>
                    Cargando alquileres...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.encabezadoPantalla}>
                <View>
                    <Text style={styles.titulo}>
                        Gestión de alquileres
                    </Text>

                    <Text style={styles.subtitulo}>
                        Administra las entregas y devoluciones
                    </Text>
                </View>

                <View style={styles.contador}>
                    <Text style={styles.contadorNumero}>
                        {alquileres.length}
                    </Text>

                    <Text style={styles.contadorTexto}>
                        Total
                    </Text>
                </View>
            </View>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : null}

            <FlatList
                data={alquileres}
                keyExtractor={(item, index) =>
                    String(
                        item.id ||
                        item.id_alquiler ||
                        item.id_reserva ||
                        index
                    )
                }
                renderItem={renderAlquiler}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refrescar}
                        colors={["#D31A24"]}
                    />
                }
                contentContainerStyle={styles.lista}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons
                            name="car-outline"
                            size={55}
                            color="#BBBBBB"
                        />

                        <Text style={styles.vacioTitulo}>
                            No hay alquileres
                        </Text>

                        <Text style={styles.vacioTexto}>
                            Cuando existan alquileres registrados,
                            aparecerán aquí.
                        </Text>
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
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <View style={styles.modalContenido}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalEncabezado}>
                                <View>
                                    <Text style={styles.modalTitulo}>
                                        Registrar devolución
                                    </Text>

                                    <Text style={styles.modalSubtitulo}>
                                        Datos del vehículo recibido
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    disabled={guardandoDevolucion}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={28}
                                        color="#777777"
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>
                                Estado general del vehículo *
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. Buen estado, con daños..."
                                placeholderTextColor="#999999"
                                value={estadoGeneral}
                                onChangeText={setEstadoGeneral}
                                editable={!guardandoDevolucion}
                            />

                            <Text style={styles.label}>
                                Kilometraje de devolución
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. 45000"
                                placeholderTextColor="#999999"
                                keyboardType="numeric"
                                value={kilometraje}
                                onChangeText={setKilometraje}
                                editable={!guardandoDevolucion}
                            />

                            <Text style={styles.label}>
                                Nivel de combustible *
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. Lleno, medio tanque, bajo..."
                                placeholderTextColor="#999999"
                                value={combustible}
                                onChangeText={setCombustible}
                                editable={!guardandoDevolucion}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.botonAccion,
                                    styles.botonGuardar,
                                    guardandoDevolucion && styles.botonDeshabilitado,
                                ]}
                                onPress={guardarDevolucion}
                                disabled={guardandoDevolucion}
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
        backgroundColor: "#F5F5F5",
        paddingTop: 18,
    },
    encabezadoPantalla: {
        paddingHorizontal: 18,
        paddingBottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titulo: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#121212",
    },
    subtitulo: {
        fontSize: 13,
        color: "#777777",
        marginTop: 5,
    },
    contador: {
        backgroundColor: "#FCEBEC",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 8,
        alignItems: "center",
    },
    contadorNumero: {
        color: "#D31A24",
        fontSize: 20,
        fontWeight: "bold",
    },
    contadorTexto: {
        color: "#777777",
        fontSize: 11,
    },
    lista: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        flexGrow: 1,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },
    encabezado: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconoVehiculo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#FCEBEC",
        justifyContent: "center",
        alignItems: "center",
    },
    infoVehiculo: {
        flex: 1,
        marginLeft: 11,
    },
    vehiculo: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#222222",
    },
    placa: {
        fontSize: 12,
        color: "#777777",
        marginTop: 4,
    },
    estado: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8,
    },
    estadoTexto: {
        fontSize: 9,
        fontWeight: "bold",
    },
    divisor: {
        height: 1,
        backgroundColor: "#EEEEEE",
        marginVertical: 14,
    },
    dato: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    datoTexto: {
        fontSize: 13,
        color: "#555555",
        marginLeft: 9,
        flex: 1,
    },
    total: {
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
        marginTop: 5,
        paddingTop: 13,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalEtiqueta: {
        fontSize: 14,
        color: "#555555",
        fontWeight: "600",
    },
    totalMonto: {
        fontSize: 18,
        color: "#D31A24",
        fontWeight: "bold",
    },
    botonAccion: {
        backgroundColor: "#D31A24",
        borderRadius: 11,
        paddingVertical: 13,
        paddingHorizontal: 15,
        marginTop: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
    },
    botonDevolucion: {
        backgroundColor: "#222222",
    },
    botonGuardar: {
        marginTop: 24,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    centrado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    cargandoTexto: {
        color: "#777777",
        marginTop: 12,
    },
    vacio: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 35,
    },
    vacioTitulo: {
        color: "#333333",
        fontSize: 17,
        fontWeight: "bold",
        marginTop: 15,
    },
    vacioTexto: {
        color: "#888888",
        fontSize: 13,
        textAlign: "center",
        marginTop: 7,
        lineHeight: 20,
    },
    error: {
        color: "#B91C1C",
        backgroundColor: "#FEE2E2",
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 9,
    },
    modalFondo: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        padding: 20,
    },
    modalContenido: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 20,
        maxHeight: "85%",
    },
    modalEncabezado: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
    },
    modalTitulo: {
        color: "#121212",
        fontSize: 19,
        fontWeight: "bold",
    },
    modalSubtitulo: {
        color: "#777777",
        fontSize: 12,
        marginTop: 4,
    },
    label: {
        color: "#333333",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: "#F7F7F7",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 10,
        paddingHorizontal: 13,
        paddingVertical: 12,
        fontSize: 14,
        color: "#222222",
    },
    botonCancelar: {
        alignItems: "center",
        paddingVertical: 13,
        marginTop: 5,
    },
    textoCancelar: {
        color: "#777777",
        fontSize: 14,
        fontWeight: "600",
    },
});
