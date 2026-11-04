import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const crearEstilos = (theme = {}, isDark = false) => {
  const colores = {
    background: theme.background || (isDark ? '#121212' : '#F7F7F7'),
    surface: theme.surface || (isDark ? '#1C1C1E' : '#FFFFFF'),
    text: theme.text || (isDark ? '#FFFFFF' : '#171717'),
    secondaryText: theme.secondaryText || (isDark ? '#A1A1AA' : '#6B7280'),
    primary: theme.primary || '#D31A24',
    border: theme.border || (isDark ? '#333333' : '#E5E7EB'),
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.background,
    },

    scrollContent: {
      paddingBottom: 30,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colores.background,
    },

    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 35,
      paddingBottom: 10,
    },

    logoContainer: {
      justifyContent: 'center',
      height: 36,
    },

    logoImage: {
      width: 110,
      height: 32,
    },

    locationSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    locationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colores.text,
    },

    heroCard: {
      backgroundColor: '#D32F2F',
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 24,
      borderRadius: 24,
      padding: 20,
      shadowColor: '#D32F2F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },

    heroSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 4,
    },

    heroTitle: {
      color: '#FFFFFF',
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 32,
      marginBottom: 6,
    },

    heroDescription: {
      color: '#FFFFFF',
      fontSize: 13,
      opacity: 0.9,
      marginBottom: 18,
    },

    locationInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.surface,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 8,
      marginBottom: 16,
      borderWidth: isDark ? 1 : 0,
      borderColor: colores.border,
    },

    locationInputValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colores.text,
    },

    searchButton: {
      backgroundColor: colores.surface,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: colores.border,
    },

    searchButtonText: {
      color: colores.text,
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 14,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colores.text,
    },

    seeAllText: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.primary,
    },

    carouselContainer: {
      paddingLeft: 20,
      paddingRight: 8,
    },

    cardWrapper: {
      width: width * 0.75,
      marginRight: 16,
    },

    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },

    emptyText: {
      color: colores.secondaryText,
      fontSize: 14,
      textAlign: 'center',
    },

    botonNotificaciones: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: colores.surface,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: colores.border,
    },

    contadorNotificaciones: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 19,
      height: 19,
      borderRadius: 10,
      paddingHorizontal: 4,
      backgroundColor: '#D31A24',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colores.background,
    },

    textoContador: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
};

export const styles = crearEstilos();