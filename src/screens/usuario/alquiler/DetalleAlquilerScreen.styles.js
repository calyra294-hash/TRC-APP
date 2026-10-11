import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EAECF0',
    },

    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 5,
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#101828',
    },

    headerId: {
        fontSize: 10,
        color: '#8C8C8C',
        marginTop: 2,
    },

    headerStatus: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
    },

    headerStatusText: {
        fontSize: 10,
        fontWeight: '700',
    },

    content: {
        padding: 16,
        paddingBottom: 35,
    },

    vehicleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 3,
    },

    vehicleImageContainer: {
        width: '100%',
        height: 210,
        backgroundColor: '#F2F4F7',
    },

    vehicleImage: {
        width: '100%',
        height: '100%',
    },

    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },

    vehicleTextContainer: {
        flex: 1,
        paddingRight: 10,
    },

    vehicleName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#101828',
    },

    vehicleLabel: {
        fontSize: 13,
        color: '#667085',
        marginTop: 4,
    },

    amountContainer: {
        alignItems: 'flex-end',
    },

    amountLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#8C8C8C',
        marginBottom: 3,
    },

    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E53935',
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#667085',
        letterSpacing: 0.6,
        marginBottom: 10,
    },

    dateRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },

    dateBox: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        borderRadius: 12,
        padding: 14,
    },

    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8C8C8C',
        marginTop: 8,
        marginBottom: 5,
    },

    dateValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#101828',
    },

    specificationsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,

        elevation: 2,
    },

    specificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },

    specificationIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FEE4E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    specificationText: {
        flex: 1,
    },

    specificationLabel: {
        fontSize: 12,
        color: '#667085',
        marginBottom: 4,
    },

    specificationValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#101828',
    },

    separator: {
        height: 1,
        backgroundColor: '#EAECF0',
    },

    reservationContainer: {
        backgroundColor: '#F2F4F7',
        borderRadius: 12,
        padding: 14,
    },

    reservationLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8C8C8C',
        marginBottom: 5,
    },

    reservationId: {
        fontSize: 13,
        fontWeight: '600',
        color: '#101828',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#101828',
        marginTop: 15,
        marginBottom: 20,
        textAlign: 'center',
    },

    backButton: {
        backgroundColor: '#E53935',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 10,
    },

    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});