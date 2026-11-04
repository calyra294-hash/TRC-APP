
import React, { useCallback, useState } from 'react';

import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAlquileres } from '../../../hooks/useAlquileres';
import { crearResena } from '../../../services/resenas.service';
import { useTheme } from '../../../context/ThemeContext';
import { crearEstilos } from './AlquileresScreen.styles';

const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    try {
        let fechaObj;

        if (fecha._seconds) {
            fechaObj = new Date(fecha._seconds * 1000);
        } else if (fecha.seconds) {
            fechaObj = new Date(fecha.seconds * 1000);
        } else {
            fechaObj = new Date(fecha);
        }

        if (isNaN(fechaObj.getTime())) {
            return 'Sin fecha';
        }

        return fechaObj.toLocaleDateString('es-NI', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (error) {
        return 'Sin fecha';
    }
};

const obtenerColorEstado = (estado, isDark) => {
    const estadoNormalizado = String(estado || '').toLowerCase();

    if (
        estadoNormalizado.includes('completado') ||
        estadoNormalizado.includes('finalizado')
    ) {
        return {
            fondo: isDark ? '#173D2A' : '#E8F5EC',
            texto: isDark ? '#75D99A' : '#23834D',
            icono: 'checkmark-circle',
        };
    }

    if (
        estadoNormalizado.includes('cancelado') ||
        estadoNormalizado.includes('cancelada')
    ) {
        return {
            fondo: isDark ? '#333333' : '#F1F2F4',
            texto: isDark ? '#B8B8B8' : '#667085',
            icono: 'close-circle',
        };
    }

    if (
        estadoNormalizado.includes('alquilado') ||
        estadoNormalizado.includes('en curso') ||
        estadoNormalizado.includes('activo')
    ) {
        return {
            fondo: isDark ? '#49351A' : '#FFF3E0',
            texto: isDark ? '#FFC66D' : '#C77700',
            icono: 'time',
        };
    }

    return {
        fondo: isDark ? '#4A2020' : '#FEE4E2',
        texto: isDark ? '#FF9993' : '#D92D20',
        icono: 'alert-circle',
    };
};

const formatearEstado = (estado) => {
    if (!estado) return 'Sin estado';

    const texto = String(estado).toLowerCase();

    if (
        texto === 'alquilado' ||
        texto === 'activo' ||
        texto === 'en curso'
    ) {
        return 'En curso';
    }

    if (
        texto === 'completado' ||
        texto === 'finalizado'
    ) {
        return 'Completado';
    }

    if (
        texto === 'cancelado' ||
        texto === 'cancelada'
    ) {
        return 'Cancelado';
    }

    return estado;
};

const crearModalStyles = (theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: theme.card,
        borderRadius: 22,
        padding: 22,
        maxHeight: '90%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 4,
    },
    title: {
        fontSize: 21,
        fontWeight: '900',
        color: theme.text,
        textAlign: 'center',
        marginTop: 5,
    },
    subtitle: {
        fontSize: 13,
        color: theme.secondaryText,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    vehicleName: {
        color: '#D31A24',
        fontWeight: '800',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
        gap: 9,
    },
    ratingText: {
        textAlign: 'center',
        color: theme.secondaryText,
        fontSize: 13,
        fontWeight: '700',
        marginTop: 10,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.text,
        marginTop: 25,
        marginBottom: 9,
    },
    input: {
        minHeight: 115,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 13,
        padding: 13,
        color: theme.text,
        fontSize: 13,
        textAlignVertical: 'top',
        backgroundColor: theme.input,
    },
    submitButton: {
        backgroundColor: '#D31A24',
        borderRadius: 13,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        flexDirection: 'row',
        gap: 9,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 13,
        marginTop: 5,
    },
    cancelText: {
        color: theme.secondaryText,
        fontWeight: '700',
        fontSize: 13,
    },
});

export default function AlquileresScreen({ navigation }) {
    const { theme, isDark } = useTheme();

    const styles = crearEstilos(theme, isDark);
    const modalStyles = crearModalStyles(theme);

    const {
        alquileres,
        resenas,
        loading,
        error,
        refrescar,
    } = useAlquileres();

    const [modalVisible, setModalVisible] = useState(false);
    const [alquilerSeleccionado, setAlquilerSeleccionado] = useState(null);
    const [calificacion, setCalificacion] = useState(5);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refrescar();
        }, [refrescar])
    );

    const obtenerIdAlquiler = (item) => {
        return String(item.id_alquiler || item.id || '').trim();
    };

    const yaCalificado = (item) => {
        const idAlquiler = obtenerIdAlquiler(item);

        return resenas.some(
            (resena) =>
                String(resena.id_alquiler || '').trim() === idAlquiler
        );
    };

    const abrirFormulario = (item) => {
        setAlquilerSeleccionado(item);
        setCalificacion(5);
        setComentario('');
        setModalVisible(true);
    };

    const cerrarFormulario = () => {
        if (enviando) return;

        setModalVisible(false);
        setAlquilerSeleccionado(null);
        setComentario('');
        setCalificacion(5);
    };

    const enviarResena = async () => {
        if (!alquilerSeleccionado) return;

        if (calificacion < 1 || calificacion > 5) {
            Alert.alert('Atención', 'Selecciona una calificación.');
            return;
        }

        if (!comentario.trim()) {
            Alert.alert(
                'Comentario requerido',
                'Escribe un comentario sobre tu experiencia.'
            );
            return;
        }

        if (comentario.trim().length > 1000) {
            Alert.alert(
                'Comentario demasiado largo',
                'El comentario no puede superar los 1000 caracteres.'
            );
            return;
        }

        try {
            setEnviando(true);

            await crearResena({
                id_alquiler: obtenerIdAlquiler(alquilerSeleccionado),
                calificacion,
                comentario: comentario.trim(),
            });

            setModalVisible(false);
            setAlquilerSeleccionado(null);
            setComentario('');
            setCalificacion(5);

            await refrescar();

            Alert.alert(
                '¡Reseña publicada!',
                'Gracias por compartir tu experiencia con Tito\'s Rent a Car.'
            );
        } catch (error) {
            Alert.alert(
                'No se pudo publicar',
                error.message || 'Ocurrió un error al registrar tu reseña.'
            );
        } finally {
            setEnviando(false);
        }
    };

    const renderAlquiler = ({ item }) => {
        const estado = formatearEstado(item.estado_alquiler);
        const coloresEstado = obtenerColorEstado(estado, isDark);

        const nombreVehiculo =
            `${item.vehiculo?.marca || ''} ${item.vehiculo?.modelo || ''}`.trim();

        const completado = estado === 'Completado';
        const calificado = yaCalificado(item);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() =>
                        navigation.navigate('DetalleAlquiler', {
                            alquiler: item,
                        })
                    }
                >
                    <View style={styles.imageContainer}>
                        {item.vehiculo?.foto_principal ? (
                            <Image
                                source={{
                                    uri: item.vehiculo.foto_principal,
                                }}
                                style={styles.vehicleImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons
                                    name="car-sport-outline"
                                    size={58}
                                    color={isDark ? '#777777' : '#C7C7C7'}
                                />
                            </View>
                        )}

                        <View style={styles.imageDarkOverlay} />

                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: coloresEstado.fondo,
                                },
                            ]}
                        >
                            <Ionicons
                                name={coloresEstado.icono}
                                size={13}
                                color={coloresEstado.texto}
                            />

                            <Text
                                style={[
                                    styles.statusText,
                                    {
                                        color: coloresEstado.texto,
                                    },
                                ]}
                            >
                                {estado}
                            </Text>
                        </View>

                        <View style={styles.imageOverlay}>
                            <Text style={styles.vehicleBrand}>
                                TITO'S RENT A CAR
                            </Text>

                            <Text
                                style={styles.vehicleName}
                                numberOfLines={1}
                            >
                                {nombreVehiculo || 'Vehículo'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.mainInfoRow}>
                            <View style={styles.rentalIdContainer}>
                                <Text style={styles.label}>
                                    ALQUILER
                                </Text>

                                <Text
                                    style={styles.rentalId}
                                    numberOfLines={1}
                                >
                                    #{String(item.id || '').slice(-10)}
                                </Text>
                            </View>

                            <View style={styles.priceContainer}>
                                <Text style={styles.label}>
                                    MONTO FINAL
                                </Text>

                                <Text style={styles.price}>
                                    ${Number(
                                        item.monto_final || 0
                                    ).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featuresRow}>
                            {item.vehiculo?.placa ? (
                                <View style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <Ionicons
                                            name="car-outline"
                                            size={17}
                                            color="#D31A24"
                                        />
                                    </View>

                                    <View>
                                        <Text style={styles.featureLabel}>
                                            PLACA
                                        </Text>

                                        <Text style={styles.featureValue}>
                                            {item.vehiculo.placa}
                                        </Text>
                                    </View>
                                </View>
                            ) : null}

                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={17}
                                        color="#D31A24"
                                    />
                                </View>

                                <View>
                                    <Text style={styles.featureLabel}>
                                        DURACIÓN
                                    </Text>

                                    <Text style={styles.featureValue}>
                                        {item.cantidad_dias || 0} días
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.datesContainer}>
                            <View style={styles.dateItem}>
                                <View style={styles.dateIconContainer}>
                                    <Ionicons
                                        name="log-in-outline"
                                        size={17}
                                        color="#23834D"
                                    />
                                </View>

                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>
                                        ENTREGA
                                    </Text>

                                    <Text style={styles.dateValue}>
                                        {formatearFecha(item.fecha_entrega)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.dateDivider} />

                            <View style={styles.dateItem}>
                                <View style={styles.dateIconContainer}>
                                    <Ionicons
                                        name="log-out-outline"
                                        size={17}
                                        color="#D31A24"
                                    />
                                </View>

                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>
                                        DEVOLUCIÓN
                                    </Text>

                                    <Text style={styles.dateValue}>
                                        {formatearFecha(item.fecha_devolucion)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.detailButton}>
                            <Text style={styles.detailText}>
                                Ver detalles del alquiler
                            </Text>

                            <Ionicons
                                name="arrow-forward-circle"
                                size={21}
                                color="#D31A24"
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {completado && !calificado ? (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        activeOpacity={0.85}
                        onPress={() => abrirFormulario(item)}
                    >
                        <Ionicons
                            name="star"
                            size={18}
                            color="#FFFFFF"
                        />

                        <Text style={styles.reviewButtonText}>
                            Calificar vehículo
                        </Text>
                    </TouchableOpacity>
                ) : null}

                {completado && calificado ? (
                    <View style={styles.reviewedContainer}>
                        <Ionicons
                            name="checkmark-circle"
                            size={19}
                            color="#D31A24"
                        />

                        <Text style={styles.reviewedText}>
                            Ya calificaste este alquiler
                        </Text>
                    </View>
                ) : null}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons
                    name="car-sport-outline"
                    size={55}
                    color="#D31A24"
                />
            </View>

            <Text style={styles.emptyTitle}>
                {error
                    ? 'Error de conexión'
                    : 'Aún no tienes alquileres'}
            </Text>

            <Text style={styles.emptySubtitle}>
                {error
                    ? error
                    : 'Cuando alquiles un vehículo, aquí podrás consultar su información e historial.'}
            </Text>

            {!error ? (
                <View style={styles.emptyDecoration}>
                    <Ionicons
                        name="time-outline"
                        size={15}
                        color={theme.secondaryText}
                    />

                    <Text style={styles.emptyDecorationText}>
                        Tu historial aparecerá aquí
                    </Text>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerEyebrow}>
                                TITO'S RENT A CAR
                            </Text>

                            <Text style={styles.title}>
                                Mis alquileres
                            </Text>
                        </View>

                        <View style={styles.headerIcon}>
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color="#D31A24"
                            />
                        </View>
                    </View>

                    <Text style={styles.subtitle}>
                        Consulta tus vehículos alquilados y revisa su historial.
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#D31A24"
                        />

                        <Text style={styles.loadingText}>
                            Cargando tus alquileres...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={alquileres}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderAlquiler}
                        contentContainerStyle={[
                            styles.listContent,
                            alquileres.length === 0 &&
                            styles.emptyListContent,
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        onRefresh={refrescar}
                        refreshing={loading}
                    />
                )}
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={cerrarFormulario}
                statusBarTranslucent
            >
                <KeyboardAvoidingView
                    style={modalStyles.overlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={modalStyles.container}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <TouchableOpacity
                                style={modalStyles.closeButton}
                                onPress={cerrarFormulario}
                                disabled={enviando}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={27}
                                    color={theme.secondaryText}
                                />
                            </TouchableOpacity>

                            <Ionicons
                                name="star"
                                size={38}
                                color="#D31A24"
                                style={{ alignSelf: 'center', marginTop: 5 }}
                            />

                            <Text style={modalStyles.title}>
                                Califica tu experiencia
                            </Text>

                            <Text style={modalStyles.subtitle}>
                                Cuéntanos cómo fue tu experiencia con
                                {' '}
                                <Text style={modalStyles.vehicleName}>
                                    {alquilerSeleccionado
                                        ? `${alquilerSeleccionado.vehiculo?.marca || ''} ${alquilerSeleccionado.vehiculo?.modelo || ''}`
                                        : 'tu vehículo'}
                                </Text>
                            </Text>

                            <View style={modalStyles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((estrella) => (
                                    <TouchableOpacity
                                        key={estrella}
                                        onPress={() => setCalificacion(estrella)}
                                        disabled={enviando}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={
                                                estrella <= calificacion
                                                    ? 'star'
                                                    : 'star-outline'
                                            }
                                            size={37}
                                            color="#F5A623"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={modalStyles.ratingText}>
                                {calificacion === 5
                                    ? '¡Excelente!'
                                    : calificacion === 4
                                        ? '¡Muy buena experiencia!'
                                        : calificacion === 3
                                            ? 'Experiencia regular'
                                            : calificacion === 2
                                                ? 'Puede mejorar'
                                                : 'No fue una buena experiencia'}
                            </Text>

                            <Text style={modalStyles.inputLabel}>
                                TU COMENTARIO
                            </Text>

                            <TextInput
                                style={modalStyles.input}
                                placeholder="Escribe aquí tu experiencia con el vehículo..."
                                placeholderTextColor={theme.secondaryText}
                                multiline
                                maxLength={1000}
                                value={comentario}
                                onChangeText={setComentario}
                                editable={!enviando}
                            />

                            <Text
                                style={{
                                    textAlign: 'right',
                                    color: theme.secondaryText,
                                    fontSize: 11,
                                    marginTop: 6,
                                }}
                            >
                                {comentario.length}/1000
                            </Text>

                            <TouchableOpacity
                                style={[
                                    modalStyles.submitButton,
                                    enviando && { opacity: 0.7 },
                                ]}
                                onPress={enviarResena}
                                disabled={enviando}
                                activeOpacity={0.85}
                            >
                                {enviando ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="send"
                                            size={17}
                                            color="#FFFFFF"
                                        />

                                        <Text style={modalStyles.submitText}>
                                            Publicar reseña
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={modalStyles.cancelButton}
                                onPress={cerrarFormulario}
                                disabled={enviando}
                            >
                                <Text style={modalStyles.cancelText}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
