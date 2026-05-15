import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import api, { getImageUrl } from '../../services/api';
import FABIcon from '../../components/common/FABIcon';
import styles from './CategoryManagementScreen.Styles';
import useCategoryManagement from '../../hooks/useCategoryManagement';
import CategoryTreeItem from '../../components/screens/admin/CategoryManagement/CategoryTreeItem';

const CategoryManagementScreen = ({ navigation }) => {
  const { categories, isLoading, isSaving, deleteCategory, saveCategory } = useCategoryManagement();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parentCategory, setParentCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: null
  });

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '', parentId: null });
    setParentCategory(null);
  };

  const pickImage = async () => {
    const options = { mediaType: 'photo', maxWidth: 2000, maxHeight: 2000 };
    launchImageLibrary(options, async (response) => {
      if (response.assets && response.assets.length > 0) {
        setIsUploading(true);
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('image', {
            uri: response.assets[0].uri,
            type: 'image/jpeg',
            name: 'category.jpg'
          });
          const res = await api.post('/upload/image', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setFormData(prev => ({ ...prev, image: res.data.data.url }));
          Alert.alert('Success', 'Image uploaded!');
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const handleNameChange = (text) => {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData({ ...formData, name: text, slug: !editingCategory ? slug : formData.slug });
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
    setFormData(prev => ({ ...prev, parentId: parentCat._id }));
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
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    
    const payload = { ...formData, parent: formData.parentId };
    const success = await saveCategory(payload, editingCategory?._id);
    if (success) setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="chevron-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity onPress={openAddRootCategoryModal}><Icon name="add-circle" size={28} color="#4F46E5" /></TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No categories yet</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddRootCategoryModal}><Text style={styles.addBtnText}>Add First Category</Text></TouchableOpacity>
          </View>
        ) : (
          categories.map(category => (
            <CategoryTreeItem 
              key={category._id} 
              category={category} 
              onEdit={openEditModal} 
              onDelete={(id, name) => {
                Alert.alert('Delete', `Delete "${name}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) }
                ]);
              }} 
              onAddSub={openAddSubcategoryModal}
              styles={styles} 
            />
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCategory ? 'Edit' : 'Add'} Category</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Icon name="close" size={24} color="#6B7280" /></TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image</Text>
                <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage} disabled={isUploading}>
                  {isUploading ? <ActivityIndicator /> : formData.image ? <Image source={{ uri: getImageUrl(formData.image) }} style={styles.uploadedImage} /> : <Icon name="cloud-upload-outline" size={40} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={handleNameChange} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Slug *</Text>
                <TextInput style={styles.input} value={formData.slug} onChangeText={(t) => setFormData({ ...formData, slug: t })} />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <FABIcon iconName="add" onPress={openAddRootCategoryModal} />
    </View>
  );
};

export default CategoryManagementScreen;