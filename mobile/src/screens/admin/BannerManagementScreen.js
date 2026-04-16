import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import * as launchImageLibrary from 'expo-image-picker';
import { launchImageLibrary } from 'react-native-image-picker';

import api, { getImageUrl } from '../../services/api';

const BannerManagementScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/banners/all');
      setBanners(response.data.data.banners);
    } catch (error) {
      Alert.alert('Error', 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  // const pickImage = async () => {
  //   const { status } = await launchImageLibrary.requestMediaLibraryPermissionsAsync();

  //   if (status !== 'granted') {
  //     Alert.alert('Permission Denied', 'Camera roll permission is required');
  //     return;
  //   }

  //   const result = await launchImageLibrary.launchImageLibraryAsync({
  //     mediaTypes: launchImageLibrary.MediaTypeOptions.Images,
  //     quality: 0.8,
  //     aspect: [16, 9]
  //   });

  //   if (!result.canceled) {
  //     uploadImage(result.assets[0]);
  //   }
  // };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', response.error);
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
        name: 'banner.jpg'
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
    } finally {
      setIsUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      sortOrder: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: banner.image,
      link: banner.link || '',
      sortOrder: banner.sortOrder || 0,
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Banner title is required');
      return;
    }

    if (!formData.image) {
      Alert.alert('Error', 'Banner image is required');
      return;
    }

    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, formData);
        Alert.alert('Success', 'Banner updated successfully');
      } else {
        await api.post('/banners', formData);
        Alert.alert('Success', 'Banner created successfully');
      }

      setShowModal(false);
      fetchBanners();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = (bannerId) => {
    Alert.alert(
      'Delete Banner',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/banners/${bannerId}`);
              Alert.alert('Success', 'Banner deleted');
              fetchBanners();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const toggleStatus = async (banner) => {
    try {
      await api.put(`/banners/${banner._id}`, {
        ...banner,
        isActive: !banner.isActive
      });
      fetchBanners();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Banner Management</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Icon name="add-circle" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : banners.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="images-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No banners yet</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
              <Text style={styles.addBtnText}>Add First Banner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          banners.map((banner, index) => (
            <View key={banner._id} style={styles.bannerCard}>
              <Image source={{ uri: getImageUrl(banner.image) }} style={styles.bannerImage} />

              <View style={styles.bannerOverlay}>
                <View style={styles.bannerInfo}>
                  <View style={styles.bannerHeader}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <View style={styles.bannerBadges}>
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderText}>#{banner.sortOrder}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.statusBadge,
                          banner.isActive ? styles.statusActive : styles.statusInactive
                        ]}
                        onPress={() => toggleStatus(banner)}
                      >
                        <Text style={styles.statusText}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {banner.link && (
                    <Text style={styles.bannerLink} numberOfLines={1}>
                      🔗 {banner.link}
                    </Text>
                  )}
                </View>

                <View style={styles.bannerActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditModal(banner)}
                  >
                    <Icon name="create" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(banner._id)}
                  >
                    <Icon name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Image Upload */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Banner Image * (16:9 ratio recommended)</Text>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={pickImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#4F46E5" />
                  ) : formData.image ? (
                    <Image source={{ uri: getImageUrl(formData.image) }} style={styles.uploadedImage} />
                  ) : (
                    <>
                      <Icon name="cloud-upload-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.uploadHint}>Tap to upload banner</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter banner title"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              {/* Link */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Link (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com or /products/category"
                  value={formData.link}
                  onChangeText={(text) => setFormData({ ...formData, link: text })}
                  autoCapitalize="none"
                />
                <Text style={styles.hint}>
                  Leave empty if banner shouldn't be clickable
                </Text>
              </View>

              {/* Sort Order */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Display Order</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={String(formData.sortOrder)}
                  onChangeText={(text) => setFormData({ ...formData, sortOrder: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={styles.hint}>
                  Lower numbers appear first
                </Text>
              </View>

              {/* Active Status */}
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  <Icon
                    name={formData.isActive ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={formData.isActive ? '#4F46E5' : '#9CA3AF'}
                  />
                  <Text style={styles.checkboxLabel}>Active (visible on homepage)</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Icon name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {editingBanner ? 'Update' : 'Create'} Banner
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
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
  bannerCard: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  bannerInfo: {
    flex: 1
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1
  },
  bannerBadges: {
    flexDirection: 'row',
    gap: 6
  },
  orderBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  orderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  statusActive: {
    backgroundColor: '#10B981'
  },
  statusInactive: {
    backgroundColor: '#EF4444'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff'
  },
  bannerLink: {
    fontSize: 12,
    color: '#E5E7EB'
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteBtn: {
    backgroundColor: '#EF4444'
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
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  imageUploadBox: {
    height: 180,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151'
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

export default BannerManagementScreen;