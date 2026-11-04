
import { StyleSheet } from 'react-native';

export const crearEstilos = (theme, isDark) => StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.card,
    borderRadius: 20,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: isDark ? 0.25 : 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },

  imageContainer: {
    height: 205,
    width: '100%',
    position: 'relative',
    backgroundColor: isDark ? '#252525' : '#F1F1F1',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: isDark ? '#252525' : '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  ratingBadge: {
    position: 'absolute',
    bottom: 13,
    left: 14,
    backgroundColor: 'rgba(20,20,20,0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },

  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  reviewsText: {
    color: '#D5D5D5',
    fontSize: 11,
  },

  detailsContainer: {
    padding: 17,
    paddingTop: 16,
    paddingBottom: 18,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.text,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  price: {
    fontSize: 21,
    fontWeight: '900',
    color: '#D31A24',
  },

  pricePeriod: {
    fontSize: 12,
    color: theme.secondaryText,
    fontWeight: '500',
  },

  specsRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 15,
    flexWrap: 'wrap',
  },

  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },

  specText: {
    fontSize: 11,
    color: theme.secondaryText,
    fontWeight: '600',
  },

  availabilityReserved: {
    marginTop: 3,
    marginBottom: 15,
    padding: 14,
    borderRadius: 15,
    backgroundColor: isDark ? '#38291A' : '#FFF8ED',
    borderWidth: 1,
    borderColor: isDark ? '#63431F' : '#FDE5C3',
  },

  availabilityAvailable: {
    marginTop: 3,
    marginBottom: 15,
    padding: 14,
    borderRadius: 15,
    backgroundColor: isDark ? '#1D3025' : '#F0F9F2',
    borderWidth: 1,
    borderColor: isDark ? '#31533B' : '#D4EED9',
  },

  availabilityTitleReserved: {
    fontSize: 13,
    fontWeight: '800',
    color: isDark ? '#FBBF75' : '#A45108',
  },

  availabilitySubtitleReserved: {
    fontSize: 11,
    color: isDark ? '#E7B77F' : '#98632D',
    marginTop: 4,
  },

  availabilityTitleAvailable: {
    fontSize: 13,
    fontWeight: '800',
    color: isDark ? '#86D69B' : '#166534',
  },

  availabilitySubtitleAvailable: {
    fontSize: 11,
    color: isDark ? '#A5D9B1' : '#4B7655',
    marginTop: 4,
  },

  selectButton: {
    backgroundColor: '#D31A24',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#D31A24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },

  selectButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
});
