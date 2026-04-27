import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getImageUrl } from '../../../services/api';

const CategoryTreeItem = ({ category, level = 0, onEdit, onDelete, onAddSub, styles }) => {
  const isSubcategory = level > 0;

  return (
    <View key={category._id}>
      <View style={[styles.categoryCard, isSubcategory && { marginLeft: 40, marginRight: 16 }]}>
        {category.image ? (
          <Image source={{ uri: getImageUrl(category.image) }} style={styles.categoryImage} />
        ) : (
          <View style={styles.categoryImagePlaceholder}>
            <Icon name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.categoryInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.categoryName}>{category.name}</Text>
            {isSubcategory && (
              <View style={styles.subcategoryBadge}>
                <Text style={styles.subcategoryBadgeText}>SUB</Text>
              </View>
            )}
          </View>
          <Text style={styles.categorySlug}>/{category.slug}</Text>
          {category.description && (
            <Text style={styles.categoryDesc} numberOfLines={2}>
              {category.description}
            </Text>
          )}
        </View>

        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(category)}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onDelete(category._id, category.name)}
            activeOpacity={0.7}
          >
            <Icon name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {!isSubcategory && (
        <TouchableOpacity
          style={styles.addSubcategoryBtn}
          onPress={() => onAddSub(category)}
        >
          <Icon name="add-circle-outline" size={18} color="#4F46E5" />
          <Text style={styles.addSubcategoryText}>+ Add Subcategory</Text>
        </TouchableOpacity>
      )}

      {category.children && category.children.length > 0 && (
        <View>
          {category.children.map(child => (
            <CategoryTreeItem 
                key={child._id} 
                category={child} 
                level={level + 1} 
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSub={onAddSub}
                styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default CategoryTreeItem;
