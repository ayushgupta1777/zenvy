import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({
  title,
  subtitle,
  showBack = true,
  showCart = false,
  showSearch = false,
  cartCount = 0,
  rightComponent,
  backgroundColor = '#fff',
  textColor = '#1A1A1A'
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.headerSubtitle, { color: textColor + '99' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.headerRight}>
        {showSearch && (
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Icon name="search-outline" size={24} color={textColor} />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Cart', { screen: 'CartMain' })}
            activeOpacity={0.7}
          >
            <Icon name="cart-outline" size={24} color={textColor} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4F46E5',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 4,
  },
});

export default CustomHeader;