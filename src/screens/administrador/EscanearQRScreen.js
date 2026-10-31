
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

import {
    validarQRAlquiler,
    confirmarEntregaQR,
} from "../../services/alquileres.service";

const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";

    if (fecha._seconds) {
        return new Date(fecha._seconds * 1000).toLocaleDateString("es-NI");
    }

    if (fecha.seconds) {
        return new Date(fecha.seconds * 1000).toLocaleDateString("es-NI");
    }

    const fechaConvertida = new Date(fecha);

    if (!Number.isNaN(fechaConvertida.getTime())) {
        return fechaConvertida.toLocaleDateString("es-NI");
    }

    return String(fecha);
};

export default function EscanearQRScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const isFocused = useIsFocused();

    const [qrToken, setQrToken] = useState(null);
    const [alquiler, setAlquiler] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [operacionConfirmada, setOperacionConfirmada] = useState(false);
    const [error, setError] = useState("");

    const [estadoGeneral, setEstadoGeneral] = useState("");
    const [kilometraje, setKilometraje] = useState("");
    const [combustible, setCombustible] = useState("");

    const estadoAlquiler = String(
        alquiler?.estado ||
        alquiler?.estado_alquiler ||
        ""
    ).trim().toLowerCase();

    const esDevolucion = estadoAlquiler === "activo";

    const procesarQR = async ({ data }) => {
        if (!data || procesando || qrToken || operacionConfirmada) {
            return;
        }

        setQrToken(data);
        setProcesando(true);
        setError("");

        try {
            const resultado = await validarQRAlquiler(data);
            setAlquiler(resultado);
        } catch (err) {
            setError(err.message || "No se pudo validar el código QR.");
        } finally {
            setProcesando(false);
        }
    };

    const confirmarOperacion = () => {
        if (!qrToken || !alquiler) return;

        if (esDevolucion) {
            if (!estadoGeneral.trim()) {
                setError("Indica el estado general del vehículo.");
                return;
            }

            if (!kilometraje.trim()) {
                setError("Ingresa el kilometraje de devolución.");
                return;
            }

            if (!/^\d+(\.\d+)?$/.test(kilometraje.trim())) {
                setError("El kilometraje debe ser un número válido.");
                return;
            }

            if (!combustible.trim()) {
                setError("Indica el nivel de combustible.");
                return;
            }
        }

        const titulo = esDevolucion
            ? "Confirmar devolución"
            : "Confirmar entrega";

        const mensaje = esDevolucion
            ? "¿Confirmas que el vehículo ha sido devuelto y revisado?"
            : "¿Confirmas que el vehículo ha sido entregado al cliente?";

        Alert.alert(titulo, mensaje, [
            {
                text: "Cancelar",
                style: "cancel",
            },
            {
                text: "Confirmar",
                onPress: ejecutarConfirmacion,
            },
        ]);
    };

    const ejecutarConfirmacion = async () => {
        try {
            setConfirmando(true);
            setError("");

            const especificaciones = esDevolucion
                ? {
                    estado_general: estadoGeneral.trim(),
                    kilometraje_devolucion: kilometraje.trim(),
                    nivel_combustible: combustible.trim(),
                }
                : {};

            const resultado = await confirmarEntregaQR(
                qrToken,
                especificaciones
            );

            setOperacionConfirmada(true);

            const fueDevolucion = esDevolucion ||
                resultado.operacion === "devolucion";

            Alert.alert(
                fueDevolucion
                    ? "Devolución confirmada"
                    : "Entrega confirmada",
                fueDevolucion
                    ? "La devolución del vehículo fue registrada correctamente. El alquiler ha finalizado."
                    : "Vehículo entregado correctamente. El alquiler ahora está activo."
            );
        } catch (err) {
            setError(err.message || "No se pudo completar la operación.");
        } finally {
            setConfirmando(false);
        }
    };

    const escanearOtro = () => {
        setQrToken(null);
        setAlquiler(null);
        setError("");
        setOperacionConfirmada(false);
        setProcesando(false);

        setEstadoGeneral("");
        setKilometraje("");
        setCombustible("");
    };

    const vehiculo = alquiler?.vehiculo || {};

    if (!permission) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#D31A24" />
                <Text style={styles.textoSecundario}>
                    Comprobando permisos de cámara...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centrado}>
                <View style={styles.iconoPermiso}>
                    <Ionicons name="camera-outline" size={48} color="#D31A24" />
                </View>

                <Text style={styles.tituloPermiso}>
                    Acceso a la cámara
                </Text>

                <Text style={styles.textoSecundario}>
                    Necesitamos utilizar la cámara para escanear el código QR del cliente.
                </Text>

                <TouchableOpacity
                    style={styles.botonPrincipal}
                    onPress={requestPermission}
                >
                    <Text style={styles.textoBoton}>
                        Permitir cámara
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.titulo}>
                Escanear código QR
            </Text>

            <Text style={styles.subtitulo}>
                Escanea el código QR del cliente para registrar la entrega o devolución del vehículo.
            </Text>

            {!qrToken && (
                <>
                    <View style={styles.camaraContenedor}>
                        {isFocused ? (
                            <CameraView
                                style={styles.camara}
                                facing="back"
                                barcodeScannerSettings={{
                                    barcodeTypes: ["qr"],
                                }}
                                onBarcodeScanned={
                                    procesando ? undefined : procesarQR
                                }
                            />
                        ) : (
                            <View style={styles.camaraInactiva}>
                                <Ionicons
                                    name="camera-outline"
                                    size={45}
                                    color="#FFFFFF"
                                />
                            </View>
                        )}

                        <View pointerEvents="none" style={styles.marco}>
                            <View style={styles.esquinaSuperiorIzquierda} />
                            <View style={styles.esquinaSuperiorDerecha} />
                            <View style={styles.esquinaInferiorIzquierda} />
                            <View style={styles.esquinaInferiorDerecha} />
                        </View>
                    </View>

                    <View style={styles.instruccion}>
                        <Ionicons
                            name="scan-outline"
                            size={24}
                            color="#D31A24"
                        />

                        <Text style={styles.textoInstruccion}>
                            Coloca el código QR dentro del recuadro para escanearlo.
                        </Text>
                    </View>
                </>
            )}

            {procesando && (
                <View style={styles.estadoCarga}>
                    <ActivityIndicator size="large" color="#D31A24" />
                    <Text style={styles.textoCarga}>
                        Validando código QR...
                    </Text>
                </View>
            )}

            {!!error && (
                <View style={styles.errorCaja}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={23}
                        color="#D31A24"
                    />

                    <Text style={styles.errorTexto}>
                        {error}
                    </Text>
                </View>
            )}

            {alquiler && (
                <View style={styles.card}>
                    <View style={styles.cardEncabezado}>
                        <Ionicons
                            name="checkmark-circle"
                            size={26}
                            color="#16834A"
                        />

                        <Text style={styles.cardTitulo}>
                            Código QR válido
                        </Text>
                    </View>

                    <View style={[
                        styles.estadoOperacion,
                        esDevolucion
                            ? styles.estadoActivo
                            : styles.estadoPendiente,
                    ]}>
                        <Text style={[
                            styles.estadoOperacionTexto,
                            esDevolucion
                                ? styles.textoActivo
                                : styles.textoPendiente,
                        ]}>
                            {esDevolucion
                                ? "ALQUILER ACTIVO - REGISTRAR DEVOLUCIÓN"
                                : "PENDIENTE DE ENTREGA"}
                        </Text>
                    </View>

                    <Text style={styles.seccionTitulo}>
                        Información del cliente
                    </Text>

                    <View style={styles.fila}>
                        <Ionicons name="person-outline" size={19} color="#D31A24" />
                        <Text style={styles.dato}>
                            {alquiler.email_usuario || "No disponible"}
                        </Text>
                    </View>

                    <Text style={styles.seccionTitulo}>
                        Información del vehículo
                    </Text>

                    <Text style={styles.vehiculo}>
                        {vehiculo.marca || "Vehículo"} {vehiculo.modelo || ""}
                    </Text>

                    <View style={styles.fila}>
                        <Ionicons name="car-outline" size={19} color="#D31A24" />
                        <Text style={styles.dato}>
                            Placa: {vehiculo.placa || "No disponible"}
                        </Text>
                    </View>

                    <Text style={styles.seccionTitulo}>
                        Detalles del alquiler
                    </Text>

                    <View style={styles.fila}>
                        <Ionicons name="calendar-outline" size={19} color="#D31A24" />
                        <Text style={styles.dato}>
                            Inicio: {formatearFecha(alquiler.fecha_inicio)}
                        </Text>
                    </View>

                    <View style={styles.fila}>
                        <Ionicons name="calendar-outline" size={19} color="#D31A24" />
                        <Text style={styles.dato}>
                            Fin: {formatearFecha(alquiler.fecha_fin)}
                        </Text>
                    </View>

                    <View style={styles.fila}>
                        <Ionicons name="cash-outline" size={19} color="#D31A24" />
                        <Text style={styles.dato}>
                            Total: C$ {Number(alquiler.monto_final || 0).toLocaleString("es-NI")}
                        </Text>
                    </View>

                    {esDevolucion && !operacionConfirmada && (
                        <>
                            <View style={styles.separador} />

                            <Text style={styles.tituloFormulario}>
                                Registrar devolución
                            </Text>

                            <Text style={styles.descripcionFormulario}>
                                Revisa el vehículo y completa los siguientes datos.
                            </Text>

                            <Text style={styles.label}>
                                Estado general del vehículo *
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. Buen estado, sin daños"
                                placeholderTextColor="#999999"
                                value={estadoGeneral}
                                onChangeText={setEstadoGeneral}
                                multiline
                            />

                            <Text style={styles.label}>
                                Kilometraje de devolución *
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. 45000"
                                placeholderTextColor="#999999"
                                value={kilometraje}
                                onChangeText={setKilometraje}
                                keyboardType="decimal-pad"
                            />

                            <Text style={styles.label}>
                                Nivel de combustible *
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Ej. Lleno, medio tanque o 1/4"
                                placeholderTextColor="#999999"
                                value={combustible}
                                onChangeText={setCombustible}
                            />
                        </>
                    )}

                    {!operacionConfirmada ? (
                        <TouchableOpacity
                            style={[
                                styles.botonPrincipal,
                                confirmando && styles.botonDeshabilitado,
                            ]}
                            onPress={confirmarOperacion}
                            disabled={confirmando}
                        >
                            {confirmando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={
                                            esDevolucion
                                                ? "car-outline"
                                                : "checkmark-circle-outline"
                                        }
                                        size={21}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.textoBoton}>
                                        {esDevolucion
                                            ? "Confirmar devolución"
                                            : "Confirmar entrega del vehículo"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.confirmacion}>
                            <Ionicons
                                name="checkmark-done-circle"
                                size={25}
                                color="#16834A"
                            />

                            <Text style={styles.confirmacionTexto}>
                                {esDevolucion
                                    ? "Devolución registrada correctamente."
                                    : "Entrega registrada correctamente."}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {(qrToken || error || operacionConfirmada) && (
                <TouchableOpacity
                    style={styles.botonSecundario}
                    onPress={escanearOtro}
                >
                    <Ionicons name="scan-outline" size={20} color="#D31A24" />
                    <Text style={styles.textoBotonSecundario}>
                        Escanear otro código
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    contenido: {
        padding: 18,
        paddingTop: 55,
        paddingBottom: 35,
    },
    centrado: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        padding: 25,
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#121212",
    },
    subtitulo: {
        fontSize: 14,
        color: "#777777",
        lineHeight: 21,
        marginTop: 7,
        marginBottom: 22,
    },
    camaraContenedor: {
        height: 310,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#121212",
        justifyContent: "center",
        alignItems: "center",
    },
    camara: {
        width: "100%",
        height: "100%",
    },
    camaraInactiva: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    marco: {
        position: "absolute",
        width: 220,
        height: 220,
    },
    esquinaSuperiorIzquierda: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 5,
        borderLeftWidth: 5,
        borderColor: "#D31A24",
        borderTopLeftRadius: 12,
    },
    esquinaSuperiorDerecha: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 5,
        borderRightWidth: 5,
        borderColor: "#D31A24",
        borderTopRightRadius: 12,
    },
    esquinaInferiorIzquierda: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 5,
        borderLeftWidth: 5,
        borderColor: "#D31A24",
        borderBottomLeftRadius: 12,
    },
    esquinaInferiorDerecha: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderColor: "#D31A24",
        borderBottomRightRadius: 12,
    },
    instruccion: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginTop: 16,
    },
    textoInstruccion: {
        flex: 1,
        fontSize: 13,
        color: "#555555",
        lineHeight: 19,
    },
    estadoCarga: {
        alignItems: "center",
        marginTop: 25,
        gap: 10,
    },
    textoCarga: {
        color: "#555555",
        fontSize: 14,
    },
    errorCaja: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FCE8E8",
        padding: 14,
        borderRadius: 10,
        marginTop: 18,
    },
    errorTexto: {
        flex: 1,
        color: "#B51C25",
        fontSize: 13,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginTop: 22,
        elevation: 3,
    },
    cardEncabezado: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginBottom: 10,
    },
    cardTitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#16834A",
    },
    seccionTitulo: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#D31A24",
        marginTop: 13,
        marginBottom: 9,
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginBottom: 9,
    },
    dato: {
        flex: 1,
        color: "#444444",
        fontSize: 14,
    },
    vehiculo: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#121212",
    },
    estadoOperacion: {
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        alignItems: "center",
    },
    estadoPendiente: {
        backgroundColor: "#FFF2D8",
    },
    estadoActivo: {
        backgroundColor: "#E8F5EC",
    },
    estadoOperacionTexto: {
        fontWeight: "bold",
        fontSize: 12,
        textAlign: "center",
    },
    textoPendiente: {
        color: "#8A5A00",
    },
    textoActivo: {
        color: "#16834A",
    },
    separador: {
        height: 1,
        backgroundColor: "#EEEEEE",
        marginTop: 22,
        marginBottom: 8,
    },
    tituloFormulario: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#121212",
        marginTop: 10,
    },
    descripcionFormulario: {
        color: "#777777",
        fontSize: 13,
        marginTop: 5,
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#333333",
        marginTop: 13,
        marginBottom: 7,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 9,
        padding: 12,
        color: "#222222",
        fontSize: 14,
        minHeight: 46,
        textAlignVertical: "top",
    },
    botonPrincipal: {
        backgroundColor: "#D31A24",
        padding: 15,
        borderRadius: 10,
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    confirmacion: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        marginTop: 20,
        backgroundColor: "#E8F5EC",
        padding: 13,
        borderRadius: 10,
    },
    confirmacionTexto: {
        color: "#16834A",
        fontWeight: "bold",
        fontSize: 13,
        flex: 1,
    },
    botonSecundario: {
        borderWidth: 1,
        borderColor: "#D31A24",
        padding: 14,
        borderRadius: 10,
        marginTop: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFFFFF",
    },
    textoBotonSecundario: {
        color: "#D31A24",
        fontWeight: "bold",
        fontSize: 14,
    },
    iconoPermiso: {
        backgroundColor: "#FCE8E8",
        padding: 20,
        borderRadius: 50,
        marginBottom: 18,
    },
    tituloPermiso: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#121212",
        marginBottom: 10,
    },
    textoSecundario: {
        textAlign: "center",
        color: "#666666",
        lineHeight: 21,
        marginTop: 10,
        marginBottom: 18,
    },
});
