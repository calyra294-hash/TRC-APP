import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F8',
    },

    container: {
        flex: 1,
        backgroundColor: '#F7F7F8',
    },

    // ENCABEZADO
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 18,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerEyebrow: {
        fontSize: 9,
        fontWeight: '800',
        color: '#D31A24',
        letterSpacing: 1.8,
        marginBottom: 5,
    },

    title: {
        fontSize: 25,
        fontWeight: '800',
        color: '#171717',
        letterSpacing: -0.6,
    },

    subtitle: {
        fontSize: 12,
        color: '#777777',
        marginTop: 7,
        lineHeight: 18,
    },

    headerIcon: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // LISTA
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    // TARJETA
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        marginBottom: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEEE',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.07,
        shadowRadius: 10,

        elevation: 3,
    },

    // IMAGEN
    imageContainer: {
        width: '100%',
        height: 185,
        position: 'relative',
        backgroundColor: '#E9E9E9',
    },

    vehicleImage: {
        width: '100%',
        height: '100%',
    },

    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEEEEE',
    },

    imageDarkOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 95,
        backgroundColor: 'rgba(0, 0, 0, 0.34)',
    },

    statusBadge: {
        position: 'absolute',
        top: 13,
        right: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },

    imageOverlay: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 14,
    },

    vehicleBrand: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 4,
        opacity: 0.9,
    },

    vehicleName: {
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    // CUERPO
    cardBody: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 13,
    },

    // MONTO E ID
    mainInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    rentalIdContainer: {
        flex: 1,
        paddingRight: 10,
    },

    priceContainer: {
        alignItems: 'flex-end',
    },

    label: {
        fontSize: 9,
        fontWeight: '800',
        color: '#929292',
        letterSpacing: 1,
        marginBottom: 5,
    },

    rentalId: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282828',
    },

    price: {
        fontSize: 22,
        fontWeight: '900',
        color: '#D31A24',
        letterSpacing: -0.5,
    },

    // PLACA Y DURACIÓN
    featuresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 25,
        paddingVertical: 15,
    },

    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },

    featureIcon: {
        width: 35,
        height: 35,
        borderRadius: 11,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
    },

    featureLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#999999',
        letterSpacing: 0.7,
        marginBottom: 3,
    },

    featureValue: {
        fontSize: 12,
        fontWeight: '800',
        color: '#262626',
    },

    // FECHAS
    datesContainer: {
        backgroundColor: '#F8F8F9',
        borderRadius: 13,
        paddingHorizontal: 11,
        paddingVertical: 13,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },

    dateItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    dateIconContainer: {
        width: 31,
        height: 31,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    dateTextContainer: {
        flex: 1,
    },

    dateLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#999999',
        letterSpacing: 0.6,
        marginBottom: 4,
    },

    dateValue: {
        fontSize: 11,
        fontWeight: '800',
        color: '#292929',
    },

    dateDivider: {
        width: 1,
        height: 34,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 9,
    },

    // BOTÓN DETALLES
    detailButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 3,
    },

    detailText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#D31A24',
    },

    // CARGANDO
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: '600',
        color: '#777777',
    },

    // SIN ALQUILERES
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyIconContainer: {
        width: 105,
        height: 105,
        borderRadius: 35,
        backgroundColor: '#FCEBEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 19,
    },

    emptyTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#202020',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptySubtitle: {
        fontSize: 13,
        color: '#777777',
        textAlign: 'center',
        lineHeight: 21,
    },

    emptyDecoration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 18,
    },

    emptyDecorationText: {
        fontSize: 11,
        color: '#98A2B3',
        fontWeight: '600',
    },
});