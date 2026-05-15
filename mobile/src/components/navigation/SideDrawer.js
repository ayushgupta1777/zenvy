import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getImageUrl } from '../../services/api';

const SideDrawer = ({ 
  visible, 
  drawerAnim, 
  user, 
  menuItems, 
  categories, 
  onClose, 
  onMenuPress, 
  onCategoryPress,
  onLogout,
  styles 
}) => {
  if (!visible && drawerAnim._value === -300) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerAnim }] }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerProfileSection}>
              <View style={styles.drawerProfileImage}>
                <Icon name="person" size={32} color="#fff" />
              </View>
              <View style={styles.drawerProfileInfo}>
                <Text style={styles.drawerProfileName}>
                  {user?.name || 'Guest User'}
                </Text>
                <Text style={styles.drawerProfileEmail}>
                  {user?.email || 'Login to continue'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.drawerSection}>
            <Text style={styles.drawerSectionTitle}>MENU</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.drawerMenuItem}
                onPress={() => onMenuPress(item.route)}
                activeOpacity={0.7}
              >
                <Icon name={item.icon} size={22} color="#333" />
                <Text style={styles.drawerMenuText}>{item.name}</Text>
                <Icon name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.drawerSection}>
            <Text style={styles.drawerSectionTitle}>CATEGORIES</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={styles.drawerCategoryItem}
                onPress={() => onCategoryPress(category)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: getImageUrl(category.image) }}
                  style={styles.drawerCategoryImage}
                />
                <Text style={styles.drawerCategoryText}>{category.name}</Text>
                <Icon name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          {user && (
            <TouchableOpacity
              style={styles.drawerLogoutBtn}
              onPress={onLogout}
            >
              <Icon name="log-out-outline" size={22} color="#FF4444" />
              <Text style={styles.drawerLogoutText}>Logout</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default SideDrawer;
