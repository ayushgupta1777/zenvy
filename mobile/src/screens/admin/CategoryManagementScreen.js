import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator, TextInput, Modal, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import api, { getImageUrl } from '../../services/api';

const CategoryManagementScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parentCategory, setParentCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories/tree');
      setCategories(response.data.data.categories);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: null
    });
    setParentCategory(null);
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 2000,
      maxHeight: 2000
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        uploadImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async (image) => {
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'category.jpg'
      });

      const response = await api.post('/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({
        ...prev,
        image: response.data.data.url
      }));

      Alert.alert('Success', 'Image uploaded!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (text) => {
    setFormData({
      ...formData,
      name: text,
      slug: !editingCategory ? generateSlug(text) : formData.slug
    });
  };

  const openAddRootCategoryModal = () => {
    setEditingCategory(null);
    setParentCategory(null);
    resetForm();
    setShowModal(true);
  };

  const openAddSubcategoryModal = (parentCat) => {
    setEditingCategory(null);
    setParentCategory(parentCat);
    resetForm();
    setFormData(prev => ({
      ...prev,
      parentId: parentCat._id
    }));
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      parentId: category.parent || null
    });
    if (category.parent) {
      const parent = findCategoryById(category.parent);
      setParentCategory(parent);
    }
    setShowModal(true);
  };

  const findCategoryById = (id, cats = categories) => {
    for (let cat of cats) {
      if (cat._id === id) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(id, cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    if (!formData.slug.trim()) {
      Alert.alert('Error', 'Slug is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
        parent: formData.parentId || null
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        Alert.alert('Success', 'Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        Alert.alert('Success', 'Category created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save category';
      Alert.alert('Error', errorMsg);
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (categoryId, categoryName) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${categoryId}`);
              Alert.alert('Success', 'Category deleted successfully');
              fetchCategories();
            } catch (error) {
              const errorMsg = error.response?.data?.message || error.message || 'Failed to delete category';
              Alert.alert('Error', errorMsg);
            }
          }
        }
      ]
    );
  };

  // Recursive tree component
  const CategoryTreeItem = ({ category, level = 0 }) => {
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
              onPress={() => openEditModal(category)}
              activeOpacity={0.7}
            >
              <Icon name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(category._id, category.name)}
              activeOpacity={0.7}
            >
              <Icon name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Subcategory Button */}
        {!isSubcategory && (
          <TouchableOpacity
            style={styles.addSubcategoryBtn}
            onPress={() => openAddSubcategoryModal(category)}
          >
            <Icon name="add-circle-outline" size={18} color="#4F46E5" />
            <Text style={styles.addSubcategoryText}>+ Add Subcategory</Text>
          </TouchableOpacity>
        )}

        {/* Render children/subcategories */}
        {category.children && category.children.length > 0 && (
          <View>
            {category.children.map(child => (
              <CategoryTreeItem key={child._id} category={child} level={level + 1} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity onPress={openAddRootCategoryModal}>
          <Icon name="add-circle" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No categories yet</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddRootCategoryModal}>
              <Text style={styles.addBtnText}>Add First Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          categories.map(category => (
            <CategoryTreeItem key={category._id} category={category} level={0} />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {parentCategory
                  ? `Add Subcategory to "${parentCategory.name}"`
                  : editingCategory
                    ? 'Edit Category'
                    : 'Add New Category'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              {/* Image Upload */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category Image</Text>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={pickImage}
                  disabled={isUploading}
                  activeOpacity={0.7}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#4F46E5" />
                  ) : formData.image ? (
                    <Image source={{ uri: getImageUrl(formData.image) }} style={styles.uploadedImage} />
                  ) : (
                    <>
                      <Icon name="cloud-upload-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.uploadHint}>Tap to upload image</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category name"
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Slug */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Slug *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="auto-generated-slug"
                  value={formData.slug}
                  onChangeText={(text) => setFormData({ ...formData, slug: text })}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter description (optional)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {!parentCategory && (
                <View style={styles.infoBox}>
                  <Icon name="information-circle-outline" size={18} color="#0284C7" />
                  <Text style={styles.infoText}>
                    Create root categories first, then add subcategories by clicking "+ Add Subcategory" below each category.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={openAddRootCategoryModal} activeOpacity={0.8}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 16 },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  categoryImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subcategoryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  subcategoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7'
  },
  categorySlug: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  categoryDesc: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  categoryActions: {
    justifyContent: 'space-around'
  },
  actionBtn: {
    padding: 8
  },
  addSubcategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    marginLeft: 8
  },
  addSubcategoryText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  modalBody: {
    padding: 20
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  imageUploadBox: {
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  uploadHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10
  },
  infoText: {
    fontSize: 13,
    color: '#0284C7',
    flex: 1,
    lineHeight: 18
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8
  },
  saveBtnDisabled: {
    opacity: 0.6
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  }
});

export default CategoryManagementScreen;