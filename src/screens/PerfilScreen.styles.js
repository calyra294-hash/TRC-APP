import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // ═════════════════════════════════════
    // CONTENEDOR PRINCIPAL
    // ═════════════════════════════════════

    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    scrollContent: {
        paddingBottom: 110,
    },

    // ═════════════════════════════════════
    // ENCABEZADO
    // ═════════════════════════════════════

    header: {
        backgroundColor: '#D71920',
        paddingTop: 18,
        paddingBottom: 27,
        alignItems: 'center',

        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '700',
        marginBottom: 17,
    },

    avatarContainer: {
        width: 78,
        height: 78,
        borderRadius: 39,

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 10,

        elevation: 2,
    },

    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
    },

    avatarText: {
        color: '#D71920',
        fontSize: 25,
        fontWeight: '700',
    },

    nombre: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',

        paddingHorizontal: 20,
    },

    rol: {
        color: '#FFE9E9',
        fontSize: 12,
        marginTop: 3,

        textTransform: 'capitalize',
    },

    // ═════════════════════════════════════
    // ESTADO
    // ═════════════════════════════════════

    estado: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 9,

        paddingHorizontal: 11,
        paddingVertical: 5,

        borderRadius: 15,

        backgroundColor: 'rgba(255,255,255,0.18)',
    },

    estadoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,

        marginRight: 6,
    },

    estadoAprobado: {
        backgroundColor: '#65D68A',
    },

    estadoPendiente: {
        backgroundColor: '#FFD166',
    },

    estadoText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },

    // ═════════════════════════════════════
    // TARJETAS
    // ═════════════════════════════════════

    card: {
        backgroundColor: '#FFFFFF',

        marginHorizontal: 16,
        marginTop: 10,

        borderRadius: 13,

        paddingHorizontal: 12,
        paddingVertical: 11,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.07,
        shadowRadius: 5,

        elevation: 2,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',

        color: '#252525',

        marginBottom: 5,
    },

    // ═════════════════════════════════════
    // INFORMACIÓN PERSONAL
    // ═════════════════════════════════════

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',

        minHeight: 50,

        paddingVertical: 7,

        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    infoRowLast: {
        borderBottomWidth: 0,
    },

    iconContainer: {
        width: 30,
        height: 30,

        borderRadius: 15,

        backgroundColor: '#FFF1F1',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 10,
    },

    infoContent: {
        flex: 1,
    },

    infoLabel: {
        fontSize: 8.5,

        color: '#9A9A9A',

        marginBottom: 2,

        textTransform: 'uppercase',
    },

    infoValue: {
        fontSize: 11.5,

        color: '#272727',

        fontWeight: '500',
    },

    emptyValue: {
        color: '#A5A5A5',
        fontStyle: 'italic',
        fontWeight: '400',
    },

    // ═════════════════════════════════════
    // OPCIONES DE CUENTA
    // ═════════════════════════════════════

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',

        minHeight: 48,

        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    optionRowLast: {
        borderBottomWidth: 0,
    },

    optionIcon: {
        width: 30,
        height: 30,

        borderRadius: 15,

        backgroundColor: '#FFF1F1',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 10,
    },

    optionText: {
        flex: 1,

        color: '#292929',

        fontSize: 11.5,

        fontWeight: '500',
    },

    // ═════════════════════════════════════
    // CERRAR SESIÓN
    // ═════════════════════════════════════

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',

        marginHorizontal: 16,
        marginTop: 12,

        paddingHorizontal: 12,
        height: 50,

        borderRadius: 13,

        backgroundColor: '#FFF1F1',

        borderWidth: 1,
        borderColor: '#FAD5D5',
    },

    logoutIcon: {
        width: 30,
        height: 30,

        borderRadius: 15,

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 10,
    },

    logoutText: {
        color: '#D71920',

        fontSize: 12,

        fontWeight: '600',
    },

    // ═════════════════════════════════════
    // PIE
    // ═════════════════════════════════════

    footerText: {
        textAlign: 'center',

        color: '#B0B0B0',

        fontSize: 9,

        marginTop: 14,
        marginBottom: 5,
    },

    // ═════════════════════════════════════
    // CARGANDO
    // ═════════════════════════════════════

    loadingContainer: {
        flex: 1,

        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: '#F5F5F5',
    },

    loadingText: {
        marginTop: 10,

        color: '#777777',

        fontSize: 13,

        textAlign: 'center',

        paddingHorizontal: 30,
    },
});
