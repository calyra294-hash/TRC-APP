
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const crearEstilos = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingBottom: 100,
    },

    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 320,
      backgroundColor: theme.background,
    },

    vehicleImage: {
      width: '100%',
      height: '100%',
    },

    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },

    badge4x4: {
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      elevation: 3,
    },

    badge4x4Text: {
      fontWeight: 'bold',
      fontSize: 12,
      color: theme.text,
    },

    infoCard: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -24,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 20,
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },

    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: 2,
    },

    ratingText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.text,
      marginLeft: 6,
    },

    reviewsText: {
      fontWeight: 'normal',
      color: theme.secondaryText,
    },

    priceContainer: {
      alignItems: 'flex-end',
    },

    priceText: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#D31A24',
    },

    perDayText: {
      fontSize: 12,
      color: theme.secondaryText,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 16,
      marginBottom: 12,
    },

    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },

    gridItem: {
      width: (width - 52) / 2,
      backgroundColor: theme.input,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },

    gridTextContainer: {
      marginLeft: 10,
      flex: 1,
    },

    gridLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.secondaryText,
      letterSpacing: 0.5,
    },

    gridValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 2,
    },

    descriptionText: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 22,
    },

    reviewsSection: {
      marginTop: 25,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    reviewsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },

    reviewsHeading: {
      fontSize: 19,
      fontWeight: 'bold',
      color: theme.text,
    },

    reviewsCount: {
      fontSize: 13,
      color: theme.secondaryText,
    },

    reviewsLoading: {
      paddingVertical: 25,
      alignItems: 'center',
    },

    reviewsLoadingText: {
      color: theme.secondaryText,
      marginTop: 10,
      fontSize: 13,
    },

    reviewsError: {
      backgroundColor: isDark ? '#382020' : '#FFF4F4',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
    },

    reviewsErrorText: {
      color: isDark ? '#F2AAAA' : '#8B2525',
      marginTop: 7,
      textAlign: 'center',
      fontSize: 13,
    },

    reviewsEmpty: {
      backgroundColor: theme.input,
      borderRadius: 12,
      padding: 22,
      alignItems: 'center',
    },

    reviewsEmptyTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginTop: 10,
    },

    reviewsEmptyText: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 5,
      textAlign: 'center',
    },

    reviewCard: {
      backgroundColor: theme.input,
      borderRadius: 13,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reviewUserRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    reviewAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? '#482326' : '#FCE8E9',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    reviewUserName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },

    reviewDate: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },

    reviewComment: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 20,
      marginTop: 13,
    },

    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 20,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    footerSubText: {
      fontSize: 12,
      color: theme.secondaryText,
    },

    footerPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#D31A24',
    },

    currencyText: {
      fontSize: 12,
      color: theme.secondaryText,
      fontWeight: 'normal',
    },

    reserveButton: {
      backgroundColor: '#D31A24',
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
    },

    reserveButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },

    errorText: {
      textAlign: 'center',
      marginTop: 50,
      color: '#D31A24',
    },

    // Modal de reserva
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },

    reservationModal: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 25,
      paddingBottom: 35,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },

    modalTitle: {
      fontSize: 23,
      fontWeight: 'bold',
      color: theme.text,
    },

    modalVehicleName: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 20,
    },

    modalLabel: {
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 7,
    },

    dateButton: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.input,
    },

    dateButtonText: {
      fontSize: 16,
      color: theme.text,
    },

    datePlaceholder: {
      fontSize: 16,
      color: theme.secondaryText,
    },

    dateDisabled: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      backgroundColor: theme.input,
    },

    dateDisabledText: {
      fontSize: 16,
      color: theme.secondaryText,
    },

    modalHint: {
      color: theme.secondaryText,
      marginTop: 5,
      marginBottom: 20,
    },

    confirmButton: {
      backgroundColor: '#D31A24',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },

    confirmButtonDisabled: {
      backgroundColor: '#999999',
    },

    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },

    webDateInput: {
      width: '100%',
      boxSizing: 'border-box',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 13,
      fontSize: 16,
      backgroundColor: theme.input,
      color: theme.text,
      outline: 'none',
      marginBottom: 10,
    },
  });
