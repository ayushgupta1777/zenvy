import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const StatCard = ({ icon, label, value, color, styles }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Icon name={icon} size={28} color={color} />
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

export const FilterChip = ({ label, value, count, activeValue, onSelect, styles }) => (
  <TouchableOpacity
    style={[styles.filterChip, activeValue === value && styles.filterChipActive]}
    onPress={() => onSelect(value)}
  >
    <Text style={[
      styles.filterChipText,
      activeValue === value && styles.filterChipTextActive
    ]}>
      {label}
    </Text>
    {count !== undefined && (
      <View style={styles.filterChipBadge}>
        <Text style={styles.filterChipBadgeText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const TimeframeFilter = ({ activeValue, onSelect, styles }) => (
  <View style={styles.timeframeContainer}>
    {['all', 'today', 'week', 'month'].map((t) => (
      <TouchableOpacity
        key={t}
        style={[styles.timeframeBtn, activeValue === t && styles.timeframeBtnActive]}
        onPress={() => onSelect(t)}
      >
        <Text style={[styles.timeframeBtnText, activeValue === t && styles.timeframeBtnTextActive]}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
