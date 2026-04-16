import { StyleSheet } from 'react-native';

export const COLORS = {
  // Primary Premium Greens
  emerald: '#10B981',
  mint: '#E8F5E9',
  forest: '#064E3B',
  success: '#34D399',
  
  // Accents & Neutrals
  amber: '#FBBF24',
  danger: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(0, 78, 59, 0.05)',
  textMain: '#1F2937',
  textSub: '#6B7280',
  white: '#FFFFFF',
  surface: '#F9FAFB',
};

export const DEV_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  premiumBackground: {
    flex: 1,
    backgroundColor: COLORS.mint,
  },
  glassCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.emerald,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
