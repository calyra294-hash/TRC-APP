
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: '#F7F7F9',
  },

  headerIntro: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D31A24',
    letterSpacing: 2,
    marginBottom: 7,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 6,
    lineHeight: 19,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 14,
    height: 52,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEEEF0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 5,
    height: 48,
    color: '#222222',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D31A24',
    borderWidth: 1.3,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 52,
    gap: 7,
  },

  filterButtonText: {
    color: '#D31A24',
    fontWeight: '700',
    fontSize: 13,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#242424',
  },


  headerContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: '#F7F7F9',
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
    color: '#171717',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 12,
    color: '#777777',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 11,
    height: 43,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EEEEF0',
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 3,
    height: 42,
    color: '#222222',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D31A24',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    height: 43,
    gap: 5,
  },

  filterButtonText: {
    color: '#D31A24',
    fontWeight: '700',
    fontSize: 12,
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
    color: '#242424',
  },

  categorySubtitle: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },

  categoriesScroll: {
    gap: 8,
    paddingBottom: 12,
    paddingTop: 1,
  },

  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E9E9EC',
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
    color: '#555555',
    fontWeight: '600',
    fontSize: 13,
  },

  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 8,
  },

  resultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#202020',
  },

  resultsSubtitle: {
    fontSize: 11,
    color: '#999999',
    marginTop: 3,
  },

  resultsCount: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FCE8E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsCountText: {
    color: '#D31A24',
    fontSize: 14,
    fontWeight: '800',
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
    backgroundColor: '#F7F7F9',
  },

  loadingText: {
    marginTop: 10,
    color: '#6B7280',
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
    color: '#292929',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 21,
  },
});
