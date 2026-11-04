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

import { useTheme } from "../../context/ThemeContext";

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
    const { theme, isDark } = useTheme();

    const estilos = crearEstilosTema(theme, isDark);

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
            <View style={estilos.centrado}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={estilos.textoSecundario}>
                    Comprobando permisos de cámara...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={estilos.centrado}>
                <View style={estilos.iconoPermiso}>
                    <Ionicons name="camera-outline" size={48} color="#D31A24" />
                </View>

                <Text style={estilos.tituloPermiso}>
                    Acceso a la cámara
                </Text>

                <Text style={estilos.textoSecundario}>
                    Necesitamos utilizar la cámara para escanear el código QR del cliente.
                </Text>

                <TouchableOpacity
                    style={estilos.botonPrincipal}
                    onPress={requestPermission}
                >
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                    <Text style={estilos.textoBoton}>
                        Permitir cámara
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={estilos.container}
            contentContainerStyle={estilos.contenido}
            keyboardShouldPersistTaps="handled"
        >
            {/* ENCABEZADO */}
            <View style={estilos.encabezado}>
                <View style={estilos.etiqueta}>
                    <View style={estilos.puntoEtiqueta} />
                    <Text style={estilos.textoEtiqueta}>
                        PANEL ADMINISTRATIVO
                    </Text>
                </View>

                <Text style={estilos.titulo}>
                    Escáner QR
                </Text>

                <Text style={estilos.subtitulo}>
                    Gestiona la entrega y devolución de vehículos de forma rápida y segura.
                </Text>
            </View>

            {/* CÁMARA */}
            {!qrToken && (
                <>
                    <View style={estilos.seccionCamara}>
                        <View style={estilos.camaraTitulo}>
                            <View style={estilos.iconoSeccion}>
                                <Ionicons
                                    name="scan-outline"
                                    size={22}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={estilos.camaraTituloTexto}>
                                <Text style={estilos.tituloSeccion}>
                                    Escanear código
                                </Text>
                                <Text style={estilos.descripcionSeccion}>
                                    Enfoca el QR del cliente
                                </Text>
                            </View>

                            <View style={estilos.estadoCamara}>
                                <View style={estilos.puntoVerde} />
                                <Text style={estilos.textoCamaraActiva}>
                                    Activa
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.camaraContenedor}>
                            {isFocused ? (
                                <CameraView
                                    style={estilos.camara}
                                    facing="back"
                                    barcodeScannerSettings={{
                                        barcodeTypes: ["qr"],
                                    }}
                                    onBarcodeScanned={
                                        procesando ? undefined : procesarQR
                                    }
                                />
                            ) : (
                                <View style={estilos.camaraInactiva}>
                                    <Ionicons
                                        name="camera-outline"
                                        size={48}
                                        color="#FFFFFF"
                                    />
                                </View>
                            )}

                            <View
                                pointerEvents="none"
                                style={estilos.marco}
                            >
                                <View style={estilos.esquinaSuperiorIzquierda} />
                                <View style={estilos.esquinaSuperiorDerecha} />
                                <View style={estilos.esquinaInferiorIzquierda} />
                                <View style={estilos.esquinaInferiorDerecha} />
                            </View>

                            <View style={estilos.etiquetaCamara}>
                                <Ionicons
                                    name="scan"
                                    size={15}
                                    color="#FFFFFF"
                                />
                                <Text style={estilos.textoEtiquetaCamara}>
                                    ÁREA DE ESCANEO
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.instruccion}>
                            <View style={estilos.iconoInstruccion}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={23}
                                    color="#D31A24"
                                />
                            </View>

                            <Text style={estilos.textoInstruccion}>
                                Coloca el código QR dentro del recuadro y mantenlo visible hasta que sea reconocido.
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.pasos}>
                        <Text style={estilos.pasosTitulo}>
                            ¿Cómo funciona?
                        </Text>

                        <View style={estilos.paso}>
                            <View style={estilos.numeroPaso}>
                                <Text style={estilos.numeroPasoTexto}>1</Text>
                            </View>
                            <View style={estilos.pasoContenido}>
                                <Text style={estilos.pasoTitulo}>
                                    Escanea el código
                                </Text>
                                <Text style={estilos.pasoDescripcion}>
                                    Lee el QR generado desde la cuenta del cliente.
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.paso}>
                            <View style={estilos.numeroPaso}>
                                <Text style={estilos.numeroPasoTexto}>2</Text>
                            </View>
                            <View style={estilos.pasoContenido}>
                                <Text style={estilos.pasoTitulo}>
                                    Verifica la información
                                </Text>
                                <Text style={estilos.pasoDescripcion}>
                                    Comprueba los datos del cliente y del vehículo.
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.paso}>
                            <View style={estilos.numeroPaso}>
                                <Text style={estilos.numeroPasoTexto}>3</Text>
                            </View>
                            <View style={estilos.pasoContenido}>
                                <Text style={estilos.pasoTitulo}>
                                    Confirma la operación
                                </Text>
                                <Text style={estilos.pasoDescripcion}>
                                    Registra la entrega o devolución del vehículo.
                                </Text>
                            </View>
                        </View>
                    </View>
                </>
            )}

            {/* VALIDANDO QR */}
            {procesando && (
                <View style={estilos.estadoCarga}>
                    <ActivityIndicator size="large" color="#D31A24" />
                    <Text style={estilos.textoCarga}>
                        Validando código QR...
                    </Text>
                    <Text style={estilos.descripcionCarga}>
                        Estamos consultando la información del alquiler.
                    </Text>
                </View>
            )}

            {/* ERROR */}
            {!!error && (
                <View style={estilos.errorCaja}>
                    <View style={estilos.errorIcono}>
                        <Ionicons
                            name="alert-circle"
                            size={23}
                            color="#D31A24"
                        />
                    </View>

                    <View style={estilos.errorContenido}>
                        <Text style={estilos.errorTitulo}>
                            Atención
                        </Text>
                        <Text style={estilos.errorTexto}>
                            {error}
                        </Text>
                    </View>
                </View>
            )}

            {/* INFORMACIÓN DEL ALQUILER */}
            {alquiler && (
                <View style={estilos.card}>
                    <View style={estilos.cardEncabezado}>
                        <View style={estilos.iconoValido}>
                            <Ionicons
                                name="checkmark"
                                size={22}
                                color="#16834A"
                            />
                        </View>

                        <View style={estilos.cardEncabezadoTexto}>
                            <Text style={estilos.cardTitulo}>
                                Código QR válido
                            </Text>
                            <Text style={estilos.cardSubtitulo}>
                                Información del alquiler encontrada
                            </Text>
                        </View>
                    </View>

                    <View style={[
                        estilos.estadoOperacion,
                        esDevolucion
                            ? estilos.estadoActivo
                            : estilos.estadoPendiente,
                    ]}>
                        <Ionicons
                            name={esDevolucion ? "car" : "time-outline"}
                            size={18}
                            color={esDevolucion ? "#16834A" : "#9A6500"}
                        />

                        <Text style={[
                            estilos.estadoOperacionTexto,
                            esDevolucion
                                ? estilos.textoActivo
                                : estilos.textoPendiente,
                        ]}>
                            {esDevolucion
                                ? "ALQUILER ACTIVO - REGISTRAR DEVOLUCIÓN"
                                : "PENDIENTE DE ENTREGA"}
                        </Text>
                    </View>

                    {/* CLIENTE */}
                    <View style={estilos.seccionDatos}>
                        <Text style={estilos.seccionTitulo}>
                            CLIENTE
                        </Text>

                        <View style={estilos.fila}>
                            <View style={estilos.iconoDato}>
                                <Ionicons
                                    name="person-outline"
                                    size={19}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={estilos.datoContenido}>
                                <Text style={estilos.datoEtiqueta}>
                                    Correo electrónico
                                </Text>
                                <Text style={estilos.dato}>
                                    {alquiler.email_usuario || "No disponible"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={estilos.divisor} />

                    {/* VEHÍCULO */}
                    <View style={estilos.seccionDatos}>
                        <Text style={estilos.seccionTitulo}>
                            VEHÍCULO
                        </Text>

                        <View style={estilos.vehiculoCaja}>
                            <View style={estilos.iconoVehiculo}>
                                <Ionicons
                                    name="car-sport-outline"
                                    size={32}
                                    color="#D31A24"
                                />
                            </View>

                            <View style={estilos.vehiculoContenido}>
                                <Text style={estilos.vehiculo}>
                                    {vehiculo.marca || "Vehículo"} {vehiculo.modelo || ""}
                                </Text>
                                <Text style={estilos.placa}>
                                    Placa: {vehiculo.placa || "No disponible"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={estilos.divisor} />

                    {/* DETALLES DEL ALQUILER */}
                    <View style={estilos.seccionDatos}>
                        <Text style={estilos.seccionTitulo}>
                            DETALLES DEL ALQUILER
                        </Text>

                        <View style={estilos.detallesGrid}>
                            <View style={estilos.detalleItem}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={19}
                                    color="#D31A24"
                                />
                                <Text style={estilos.detalleEtiqueta}>
                                    Fecha de inicio
                                </Text>
                                <Text style={estilos.detalleValor}>
                                    {formatearFecha(alquiler.fecha_inicio)}
                                </Text>
                            </View>

                            <View style={estilos.detalleItem}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={19}
                                    color="#D31A24"
                                />
                                <Text style={estilos.detalleEtiqueta}>
                                    Fecha de finalización
                                </Text>
                                <Text style={estilos.detalleValor}>
                                    {formatearFecha(alquiler.fecha_fin)}
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.totalCaja}>
                            <View>
                                <Text style={estilos.totalEtiqueta}>
                                    TOTAL DEL ALQUILER
                                </Text>
                                <Text style={estilos.totalMonto}>
                                    C$ {Number(
                                        alquiler.monto_final || 0
                                    ).toLocaleString("es-NI")}
                                </Text>
                            </View>

                            <View style={estilos.totalIcono}>
                                <Ionicons
                                    name="wallet-outline"
                                    size={25}
                                    color="#D31A24"
                                />
                            </View>
                        </View>
                    </View>

                    {/* FORMULARIO DE DEVOLUCIÓN */}
                    {esDevolucion && !operacionConfirmada && (
                        <>
                            <View style={estilos.divisor} />

                            <View style={estilos.formularioEncabezado}>
                                <View style={estilos.formularioIcono}>
                                    <Ionicons
                                        name="clipboard-outline"
                                        size={23}
                                        color="#D31A24"
                                    />
                                </View>

                                <View style={estilos.formularioTituloContenido}>
                                    <Text style={estilos.tituloFormulario}>
                                        Registrar devolución
                                    </Text>
                                    <Text style={estilos.descripcionFormulario}>
                                        Completa la revisión del vehículo.
                                    </Text>
                                </View>
                            </View>

                            <Text style={estilos.label}>
                                Estado general del vehículo *
                            </Text>

                            <TextInput
                                style={[estilos.input, estilos.inputMultilinea]}
                                placeholder="Ej. Buen estado, sin daños"
                                placeholderTextColor={theme.secondaryText}
                                value={estadoGeneral}
                                onChangeText={setEstadoGeneral}
                                multiline
                            />

                            <Text style={estilos.label}>
                                Kilometraje de devolución *
                            </Text>

                            <View style={estilos.inputConIcono}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={20}
                                    color={theme.secondaryText}
                                />
                                <TextInput
                                    style={estilos.inputInterno}
                                    placeholder="Ej. 45000"
                                    placeholderTextColor={theme.secondaryText}
                                    value={kilometraje}
                                    onChangeText={setKilometraje}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <Text style={estilos.label}>
                                Nivel de combustible *
                            </Text>

                            <View style={estilos.inputConIcono}>
                                <Ionicons
                                    name="water-outline"
                                    size={20}
                                    color={theme.secondaryText}
                                />
                                <TextInput
                                    style={estilos.inputInterno}
                                    placeholder="Ej. Lleno, medio tanque o 1/4"
                                    placeholderTextColor={theme.secondaryText}
                                    value={combustible}
                                    onChangeText={setCombustible}
                                />
                            </View>
                        </>
                    )}

                    {/* BOTÓN DE CONFIRMACIÓN */}
                    {!operacionConfirmada ? (
                        <TouchableOpacity
                            style={[
                                estilos.botonPrincipal,
                                confirmando && estilos.botonDeshabilitado,
                            ]}
                            onPress={confirmarOperacion}
                            disabled={confirmando}
                            activeOpacity={0.85}
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

                                    <Text style={estilos.textoBoton}>
                                        {esDevolucion
                                            ? "Confirmar devolución"
                                            : "Confirmar entrega del vehículo"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={estilos.confirmacion}>
                            <Ionicons
                                name="checkmark-done-circle"
                                size={27}
                                color="#16834A"
                            />

                            <View style={estilos.confirmacionContenido}>
                                <Text style={estilos.confirmacionTitulo}>
                                    ¡Operación completada!
                                </Text>
                                <Text style={estilos.confirmacionTexto}>
                                    {esDevolucion
                                        ? "Devolución registrada correctamente."
                                        : "Entrega registrada correctamente."}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* ESCANEAR OTRO */}
            {(qrToken || error || operacionConfirmada) && (
                <TouchableOpacity
                    style={estilos.botonSecundario}
                    onPress={escanearOtro}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="scan-outline"
                        size={21}
                        color="#D31A24"
                    />
                    <Text style={estilos.textoBotonSecundario}>
                        Escanear otro código
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const crearEstilosTema = (theme, isDark) => {
    const estilosBase = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F4F4F5",
        },
        contenido: {
            paddingHorizontal: 17,
            paddingTop: 48,
            paddingBottom: 35,
        },
        centrado: {
            flex: 1,
            backgroundColor: "#F4F4F5",
            justifyContent: "center",
            alignItems: "center",
            padding: 25,
        },

        encabezado: {
            marginBottom: 23,
        },
        etiqueta: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: "#FCE8E8",
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 20,
            marginBottom: 12,
        },
        puntoEtiqueta: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#D31A24",
            marginRight: 7,
        },
        textoEtiqueta: {
            color: "#D31A24",
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: 1,
        },
        titulo: {
            fontSize: 29,
            fontWeight: "900",
            color: "#121212",
            letterSpacing: -0.7,
        },
        subtitulo: {
            fontSize: 14,
            color: "#777777",
            lineHeight: 21,
            marginTop: 7,
        },

        seccionCamara: {
            backgroundColor: "#FFFFFF",
            padding: 15,
            borderRadius: 19,
            elevation: 3,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 7,
        },
        camaraTitulo: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
        },
        iconoSeccion: {
            width: 43,
            height: 43,
            backgroundColor: "#FCE8E8",
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
        },
        camaraTituloTexto: {
            flex: 1,
            marginLeft: 11,
        },
        tituloSeccion: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#121212",
        },
        descripcionSeccion: {
            color: "#888888",
            fontSize: 12,
            marginTop: 3,
        },
        estadoCamara: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#E8F5EC",
            paddingHorizontal: 9,
            paddingVertical: 6,
            borderRadius: 20,
        },
        puntoVerde: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#16834A",
            marginRight: 5,
        },
        textoCamaraActiva: {
            color: "#16834A",
            fontSize: 11,
            fontWeight: "bold",
        },
        camaraContenedor: {
            height: 310,
            borderRadius: 15,
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
        etiquetaCamara: {
            position: "absolute",
            bottom: 13,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.65)",
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 20,
            gap: 6,
        },
        textoEtiquetaCamara: {
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: 0.7,
        },
        instruccion: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFF5F5",
            padding: 12,
            borderRadius: 12,
            marginTop: 14,
            gap: 10,
        },
        iconoInstruccion: {
            width: 32,
            alignItems: "center",
        },
        textoInstruccion: {
            flex: 1,
            fontSize: 12,
            color: "#555555",
            lineHeight: 18,
        },

        pasos: {
            backgroundColor: "#FFFFFF",
            borderRadius: 17,
            padding: 16,
            marginTop: 17,
            elevation: 2,
            shadowColor: "#000000",
            shadowOpacity: 0.04,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
        },
        pasosTitulo: {
            color: "#121212",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 16,
        },
        paso: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 15,
        },
        numeroPaso: {
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: "#FCE8E8",
            alignItems: "center",
            justifyContent: "center",
        },
        numeroPasoTexto: {
            color: "#D31A24",
            fontWeight: "bold",
            fontSize: 13,
        },
        pasoContenido: {
            flex: 1,
            marginLeft: 11,
        },
        pasoTitulo: {
            color: "#222222",
            fontWeight: "bold",
            fontSize: 13,
        },
        pasoDescripcion: {
            color: "#888888",
            fontSize: 12,
            marginTop: 3,
            lineHeight: 17,
        },

        estadoCarga: {
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 15,
            padding: 25,
            marginTop: 20,
        },
        textoCarga: {
            color: "#222222",
            fontSize: 15,
            fontWeight: "bold",
            marginTop: 12,
        },
        descripcionCarga: {
            color: "#888888",
            fontSize: 12,
            marginTop: 5,
            textAlign: "center",
        },
        errorCaja: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FCE8E8",
            padding: 14,
            borderRadius: 13,
            marginTop: 17,
            borderWidth: 1,
            borderColor: "#F4CCCC",
        },
        errorIcono: {
            marginRight: 10,
        },
        errorContenido: {
            flex: 1,
        },
        errorTitulo: {
            color: "#B51C25",
            fontSize: 13,
            fontWeight: "bold",
            marginBottom: 3,
        },
        errorTexto: {
            flex: 1,
            color: "#B51C25",
            fontSize: 12,
            lineHeight: 18,
        },

        card: {
            backgroundColor: "#FFFFFF",
            borderRadius: 19,
            padding: 17,
            marginTop: 20,
            elevation: 3,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 7,
        },
        cardEncabezado: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
        },
        iconoValido: {
            width: 43,
            height: 43,
            backgroundColor: "#E8F5EC",
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
        },
        cardEncabezadoTexto: {
            flex: 1,
            marginLeft: 11,
        },
        cardTitulo: {
            fontSize: 17,
            fontWeight: "bold",
            color: "#16834A",
        },
        cardSubtitulo: {
            color: "#888888",
            fontSize: 11,
            marginTop: 3,
        },
        estadoOperacion: {
            borderRadius: 10,
            padding: 12,
            marginBottom: 17,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
        },
        estadoPendiente: {
            backgroundColor: "#FFF2D8",
        },
        estadoActivo: {
            backgroundColor: "#E8F5EC",
        },
        estadoOperacionTexto: {
            fontWeight: "bold",
            fontSize: 11,
            textAlign: "center",
            flexShrink: 1,
        },
        textoPendiente: {
            color: "#8A5A00",
        },
        textoActivo: {
            color: "#16834A",
        },
        seccionDatos: {
            marginTop: 4,
        },
        seccionTitulo: {
            fontSize: 11,
            fontWeight: "bold",
            color: "#999999",
            letterSpacing: 1,
            marginBottom: 12,
        },
        fila: {
            flexDirection: "row",
            alignItems: "center",
        },
        iconoDato: {
            width: 37,
            height: 37,
            borderRadius: 11,
            backgroundColor: "#FFF1F1",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
        },
        datoContenido: {
            flex: 1,
        },
        datoEtiqueta: {
            color: "#999999",
            fontSize: 11,
            marginBottom: 3,
        },
        dato: {
            color: "#333333",
            fontSize: 13,
            fontWeight: "500",
        },
        divisor: {
            height: 1,
            backgroundColor: "#EEEEEE",
            marginVertical: 17,
        },

        vehiculoCaja: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
            borderRadius: 13,
            padding: 12,
        },
        iconoVehiculo: {
            width: 52,
            height: 52,
            backgroundColor: "#FCE8E8",
            borderRadius: 13,
            justifyContent: "center",
            alignItems: "center",
        },
        vehiculoContenido: {
            flex: 1,
            marginLeft: 12,
        },
        vehiculo: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#121212",
        },
        placa: {
            fontSize: 12,
            color: "#777777",
            marginTop: 5,
        },

        detallesGrid: {
            flexDirection: "row",
            gap: 10,
        },
        detalleItem: {
            flex: 1,
            backgroundColor: "#F8F8F8",
            borderRadius: 12,
            padding: 11,
        },
        detalleEtiqueta: {
            fontSize: 10,
            color: "#888888",
            marginTop: 8,
        },
        detalleValor: {
            color: "#222222",
            fontSize: 12,
            fontWeight: "bold",
            marginTop: 4,
        },
        totalCaja: {
            backgroundColor: "#FFF1F1",
            borderRadius: 13,
            padding: 14,
            marginTop: 13,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        totalEtiqueta: {
            color: "#A65A5F",
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: 0.7,
        },
        totalMonto: {
            fontSize: 21,
            fontWeight: "900",
            color: "#D31A24",
            marginTop: 5,
        },
        totalIcono: {
            width: 43,
            height: 43,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
        },

        formularioEncabezado: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        formularioIcono: {
            width: 43,
            height: 43,
            backgroundColor: "#FCE8E8",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
        },
        formularioTituloContenido: {
            flex: 1,
            marginLeft: 11,
        },
        tituloFormulario: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#121212",
        },
        descripcionFormulario: {
            color: "#888888",
            fontSize: 11,
            marginTop: 4,
        },
        label: {
            fontSize: 12,
            fontWeight: "bold",
            color: "#333333",
            marginTop: 15,
            marginBottom: 7,
        },
        input: {
            backgroundColor: "#F8F8F8",
            borderWidth: 1,
            borderColor: "#E5E5E5",
            borderRadius: 11,
            padding: 13,
            color: "#222222",
            fontSize: 13,
            minHeight: 48,
        },
        inputMultilinea: {
            minHeight: 85,
            textAlignVertical: "top",
        },
        inputConIcono: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
            borderWidth: 1,
            borderColor: "#E5E5E5",
            borderRadius: 11,
            paddingHorizontal: 12,
            minHeight: 49,
            gap: 9,
        },
        inputInterno: {
            flex: 1,
            color: "#222222",
            fontSize: 13,
            paddingVertical: 11,
        },

        botonPrincipal: {
            backgroundColor: "#D31A24",
            padding: 15,
            borderRadius: 12,
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            elevation: 2,
            shadowColor: "#D31A24",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
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
            gap: 11,
            marginTop: 20,
            backgroundColor: "#E8F5EC",
            padding: 14,
            borderRadius: 12,
        },
        confirmacionContenido: {
            flex: 1,
        },
        confirmacionTitulo: {
            color: "#16834A",
            fontWeight: "bold",
            fontSize: 14,
        },
        confirmacionTexto: {
            color: "#38845B",
            fontSize: 12,
            marginTop: 4,
            lineHeight: 17,
        },
        botonSecundario: {
            borderWidth: 1.5,
            borderColor: "#D31A24",
            padding: 14,
            borderRadius: 12,
            marginTop: 17,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 9,
            backgroundColor: "#FFFFFF",
        },
        textoBotonSecundario: {
            color: "#D31A24",
            fontWeight: "bold",
            fontSize: 14,
        },

        iconoPermiso: {
            backgroundColor: "#FCE8E8",
            padding: 22,
            borderRadius: 50,
            marginBottom: 18,
        },
        tituloPermiso: {
            fontSize: 22,
            fontWeight: "bold",
            color: "#121212",
            marginBottom: 8,
        },
        textoSecundario: {
            textAlign: "center",
            color: "#666666",
            lineHeight: 21,
            marginTop: 10,
            marginBottom: 18,
        },
    });

    const fondosClaros = {
        etiqueta: "#FCE8E8",
        iconoSeccion: "#FCE8E8",
        instruccion: "#FFF5F5",
        numeroPaso: "#FCE8E8",
        iconoDato: "#FFF1F1",
        iconoVehiculo: "#FCE8E8",
        formularioIcono: "#FCE8E8",
        iconoPermiso: "#FCE8E8",
    };

    const fondosOscuros = {
        etiqueta: "#35191B",
        iconoSeccion: "#35191B",
        instruccion: "#2A1A1B",
        numeroPaso: "#35191B",
        iconoDato: "#35191B",
        iconoVehiculo: "#35191B",
        formularioIcono: "#35191B",
        iconoPermiso: "#35191B",
    };

    const fondos = isDark ? fondosOscuros : fondosClaros;

    const resultado = {
        ...estilosBase,

        container: {
            ...estilosBase.container,
            backgroundColor: theme.background,
        },
        centrado: {
            ...estilosBase.centrado,
            backgroundColor: theme.background,
        },

        seccionCamara: {
            ...estilosBase.seccionCamara,
            backgroundColor: theme.card,
        },
        pasos: {
            ...estilosBase.pasos,
            backgroundColor: theme.card,
        },
        estadoCarga: {
            ...estilosBase.estadoCarga,
            backgroundColor: theme.card,
        },
        card: {
            ...estilosBase.card,
            backgroundColor: theme.card,
        },

        titulo: {
            ...estilosBase.titulo,
            color: theme.text,
        },
        tituloSeccion: {
            ...estilosBase.tituloSeccion,
            color: theme.text,
        },
        pasosTitulo: {
            ...estilosBase.pasosTitulo,
            color: theme.text,
        },
        pasoTitulo: {
            ...estilosBase.pasoTitulo,
            color: theme.text,
        },
        textoCarga: {
            ...estilosBase.textoCarga,
            color: theme.text,
        },
        dato: {
            ...estilosBase.dato,
            color: theme.text,
        },
        vehiculo: {
            ...estilosBase.vehiculo,
            color: theme.text,
        },
        detalleValor: {
            ...estilosBase.detalleValor,
            color: theme.text,
        },
        tituloFormulario: {
            ...estilosBase.tituloFormulario,
            color: theme.text,
        },
        label: {
            ...estilosBase.label,
            color: theme.text,
        },
        input: {
            ...estilosBase.input,
            backgroundColor: theme.input,
            borderColor: theme.border,
            color: theme.text,
        },
        inputConIcono: {
            ...estilosBase.inputConIcono,
            backgroundColor: theme.input,
            borderColor: theme.border,
        },
        inputInterno: {
            ...estilosBase.inputInterno,
            color: theme.text,
        },
        textoSecundario: {
            ...estilosBase.textoSecundario,
            color: theme.secondaryText,
        },

        subtitulo: {
            ...estilosBase.subtitulo,
            color: theme.secondaryText,
        },
        descripcionSeccion: {
            ...estilosBase.descripcionSeccion,
            color: theme.secondaryText,
        },
        textoInstruccion: {
            ...estilosBase.textoInstruccion,
            color: theme.secondaryText,
        },
        pasoDescripcion: {
            ...estilosBase.pasoDescripcion,
            color: theme.secondaryText,
        },
        descripcionCarga: {
            ...estilosBase.descripcionCarga,
            color: theme.secondaryText,
        },
        cardSubtitulo: {
            ...estilosBase.cardSubtitulo,
            color: theme.secondaryText,
        },
        seccionTitulo: {
            ...estilosBase.seccionTitulo,
            color: theme.secondaryText,
        },
        datoEtiqueta: {
            ...estilosBase.datoEtiqueta,
            color: theme.secondaryText,
        },
        placa: {
            ...estilosBase.placa,
            color: theme.secondaryText,
        },
        detalleEtiqueta: {
            ...estilosBase.detalleEtiqueta,
            color: theme.secondaryText,
        },
        descripcionFormulario: {
            ...estilosBase.descripcionFormulario,
            color: theme.secondaryText,
        },

        divisor: {
            ...estilosBase.divisor,
            backgroundColor: theme.border,
        },
        vehiculoCaja: {
            ...estilosBase.vehiculoCaja,
            backgroundColor: theme.input,
        },
        detalleItem: {
            ...estilosBase.detalleItem,
            backgroundColor: theme.input,
        },
        totalCaja: {
            ...estilosBase.totalCaja,
            backgroundColor: isDark ? "#35191B" : "#FFF1F1",
        },
        totalIcono: {
            ...estilosBase.totalIcono,
            backgroundColor: theme.surface,
        },
        botonSecundario: {
            ...estilosBase.botonSecundario,
            backgroundColor: theme.card,
        },

        errorCaja: {
            ...estilosBase.errorCaja,
            backgroundColor: isDark ? "#35191B" : "#FCE8E8",
            borderColor: isDark ? "#713035" : "#F4CCCC",
        },
        estadoActivo: {
            ...estilosBase.estadoActivo,
            backgroundColor: isDark ? "#173626" : "#E8F5EC",
        },
        estadoPendiente: {
            ...estilosBase.estadoPendiente,
            backgroundColor: isDark ? "#3A2D18" : "#FFF2D8",
        },
        confirmacion: {
            ...estilosBase.confirmacion,
            backgroundColor: isDark ? "#173626" : "#E8F5EC",
        },
        estadoCamara: {
            ...estilosBase.estadoCamara,
            backgroundColor: isDark ? "#173626" : "#E8F5EC",
        },
    };

    Object.keys(fondos).forEach((nombre) => {
        resultado[nombre] = {
            ...estilosBase[nombre],
            backgroundColor: fondos[nombre],
        };
    });

    return StyleSheet.create(resultado);
};