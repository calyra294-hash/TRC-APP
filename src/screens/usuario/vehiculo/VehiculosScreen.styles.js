
import { StyleSheet } from 'react-native';

export const crearEstilos = (theme, isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },

  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  headerContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: theme.background,
  },

  headerIntro: {
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D31A24',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 3,
    lineHeight: 16,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 11,
    height: 43,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 3,
    height: 42,
    color: theme.text,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderColor: '#D31A24',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    height: 43,
    gap: 5,
  },

  filterButtonActive: {
    backgroundColor: isDark ? '#482126' : '#FCE8E9',
  },

  filterButtonText: {
    color: '#D31A24',
    fontWeight: '700',
    fontSize: 12,
  },

  filterIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D31A24',
    marginLeft: 1,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },

  categorySubtitle: {
    fontSize: 10,
    color: theme.secondaryText,
    fontWeight: '500',
  },

  categoriesScroll: {
    gap: 8,
    paddingBottom: 12,
    paddingTop: 1,
  },

  chip: {
    backgroundColor: theme.card,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
  },

  chipActive: {
    backgroundColor: '#D31A24',
    borderColor: '#D31A24',
    shadowColor: '#D31A24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  chipText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 13,
  },

  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },

  loadingText: {
    marginTop: 10,
    color: theme.secondaryText,
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 65,
    gap: 12,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.text,
  },

  emptySubtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    textAlign: 'center',
    lineHeight: 21,
  },

  clearEmptyButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: isDark ? '#482126' : '#FCE8E9',
  },

  clearEmptyButtonText: {
    color: '#D31A24',
    fontSize: 13,
    fontWeight: '700',
  },

  // MODAL DE FILTROS

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },

  filterModal: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '88%',
    paddingTop: 10,
    paddingBottom: 25,
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginBottom: 17,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
  },

  modalSubtitle: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: theme.input,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    paddingHorizontal: 22,
    paddingTop: 5,
    paddingBottom: 20,
  },

  filterSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 13,
  },

  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.input,
  },

  optionChipActive: {
    backgroundColor: '#D31A24',
    borderColor: '#D31A24',
  },

  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },

  optionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  priceInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  priceInputContainer: {
    flex: 1,
  },

  priceInputLabel: {
    fontSize: 11,
    color: theme.secondaryText,
    marginBottom: 7,
    fontWeight: '600',
  },

  priceInput: {
    height: 45,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 13,
    color: theme.text,
    backgroundColor: theme.input,
  },

  modalFooter: {
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: 22,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },

  clearButton: {
    flex: 0.85,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D31A24',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    color: '#D31A24',
    fontSize: 13,
    fontWeight: '700',
  },

  applyButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D31A24',
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
