import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfeff',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },

  /* --- HEADER / APP BAR --- */
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
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
    color: '#1F2937',
  },

  /* --- HERO / BANNER RESERVA --- */
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

  /* Input de ubicación dentro del Hero */
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 16,
  },
  locationInputValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  /* Botón Principal "BUSCAR AUTOS" */
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  /* --- SECCIÓN VEHÍCULOS DESTACADOS --- */
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
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },

  /* Horizontal Carousel Container */
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
    color: '#6B7280',
    fontSize: 14,
  },
});