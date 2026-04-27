import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeHeader = ({ 
  fadeAnim, 
  slideAnim, 
  unreadCount, 
  totalItems, 
  onToggleDrawer, 
  navigation, 
  styles 
}) => (
  <Animated.View
    style={[
      styles.header,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}
  >
    <View style={styles.topStrip}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={onToggleDrawer}
          activeOpacity={0.7}
        >
          <View style={styles.logoCircleBorder}>
            <Image
              source={require('../../assets/Logo_NRF.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.brandName}>Zenvy</Text>
            <Text style={styles.brandTagline}>NRF - Premium Jewelry</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.topRightIcons}>
        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications" size={22} color="#333" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="cart" size={22} color="#333" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);

export default HomeHeader;
