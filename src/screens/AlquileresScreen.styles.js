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
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },

    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#101828',
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 14,
        color: '#667085',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 18,
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 3,
    },

    imageContainer: {
        width: '100%',
        height: 190,
        position: 'relative',
        backgroundColor: '#E5E7EB',
    },

    vehicleImage: {
        width: '100%',
        height: '100%',
    },

    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F4F7',
    },

    statusBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },

    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },

    vehicleName: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '700',
    },

    cardBody: {
        padding: 16,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    infoColumn: {
        flex: 1,
        paddingRight: 10,
    },

    infoColumnRight: {
        flex: 1,
        alignItems: 'flex-end',
    },

    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8C8C8C',
        letterSpacing: 0.5,
        marginBottom: 5,
    },

    value: {
        fontSize: 13,
        fontWeight: '600',
        color: '#101828',
    },

    price: {
        fontSize: 19,
        fontWeight: '700',
        color: '#E53935',
    },

    dateRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },

    dateBox: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        borderRadius: 12,
        padding: 12,
    },

    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8C8C8C',
        marginBottom: 5,
    },

    dateValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#101828',
    },

    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 2,
    },

    detailText: {
        color: '#E53935',
        fontSize: 13,
        fontWeight: '700',
        marginRight: 3,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#667085',
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 35,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#101828',
        marginTop: 14,
        marginBottom: 6,
    },

    emptySubtitle: {
        fontSize: 14,
        color: '#667085',
        textAlign: 'center',
        lineHeight: 21,
    },
});