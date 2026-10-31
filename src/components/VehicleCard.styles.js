import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEEEF0',
  },

  imageContainer: {
    height: 205,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F1F1',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
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
    color: '#292929',
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
    color: '#171717',
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
    color: '#858585',
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
    backgroundColor: '#F5F5F6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EEEEEF',
  },

  specText: {
    fontSize: 11,
    color: '#505050',
    fontWeight: '600',
  },

  availabilityReserved: {
    marginTop: 3,
    marginBottom: 15,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#FFF8ED',
    borderWidth: 1,
    borderColor: '#FDE5C3',
  },

  availabilityAvailable: {
    marginTop: 3,
    marginBottom: 15,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F0F9F2',
    borderWidth: 1,
    borderColor: '#D4EED9',
  },

  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  availabilityIconReserved: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FCE8CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  availabilityIconAvailable: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DDF2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  availabilityTitleContainer: {
    flex: 1,
  },

  availabilityTitleReserved: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A45108',
  },

  availabilitySubtitleReserved: {
    fontSize: 11,
    color: '#98632D',
    marginTop: 3,
  },

  availabilityTitleAvailable: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },

  availabilitySubtitleAvailable: {
    fontSize: 11,
    color: '#4B7655',
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 9,
    marginTop: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    gap: 8,
  },

  dateLabelReserved: {
    fontSize: 11,
    color: '#98632D',
    flex: 1,
  },

  dateValueReserved: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'right',
    flex: 1,
  },

  availableDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F3E6',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 9,
  },

  availableDateTextContainer: {
    flex: 1,
  },

  availableDateLabel: {
    fontSize: 10,
    color: '#387449',
  },

  availableDateValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    marginTop: 2,
  },

  nextReservationBox: {
    paddingTop: 3,
  },

  dateLabelAvailable: {
    fontSize: 11,
    color: '#387449',
    flex: 1,
  },

  dateValueAvailable: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'right',
    flex: 1,
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