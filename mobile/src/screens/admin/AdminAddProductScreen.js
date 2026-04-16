import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import api, { getImageUrl } from '../../services/api';

const AddProductScreen = ({ navigation, route }) => {
  const { product } = route.params || {};
  const isEditMode = !!product;

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    mrp: '',
    stock: '',
    sku: '',
    isFeatured: false,
    images: []
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        subcategory: product.subcategory?._id || product.subcategory || '',
        price: String(product.price || ''),
        mrp: String(product.mrp || ''),
        stock: String(product.stock || ''),
        sku: product.sku || '',
        isFeatured: product.isFeatured || false,
        images: product.images || []
      });
      // If category exists, fetch subcategories
      if (product.category) {
        const catId = product.category._id || product.category;
        fetchSubcategories(catId);
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      // Filter only root categories (no parent)
      const rootCategories = response.data.data.categories.filter(cat => !cat.parent || cat.parent === null);
      setCategories(rootCategories);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  // Fetch subcategories when category is selected
  const fetchSubcategories = async (categoryId) => {
    try {
      setLoadingSubcategories(true);
      const response = await api.get('/categories', {
        params: { parent: categoryId }
      });
      setSubcategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, category: categoryId, subcategory: '' });
    setShowCategoryModal(false);
    // Fetch subcategories for this category
    fetchSubcategories(categoryId);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      mrp: '',
      stock: '',
      sku: '',
      isFeatured: false,
      images: []
    });
    setSubcategories([]);
  };

  const pickImages = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 2000,
      maxHeight: 2000,
      selectionLimit: 5
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick images');
      } else if (response.assets && response.assets.length > 0) {
        uploadImages(response.assets);
      }
    });
  };

  const uploadImages = async (images) => {
    setIsUploading(true);
    const uploadedUrls = [];

    try {
      for (const image of images) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'upload.jpg'
        });

        const response = await api.post('/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        uploadedUrls.push(response.data.data.url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      Alert.alert('Success', `${uploadedUrls.length} image(s) uploaded!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload images');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateDiscount = () => {
    const mrp = parseFloat(formData.mrp);
    const price = parseFloat(formData.price);
    if (mrp && price && mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Product title is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      Alert.alert('Error', 'Valid MRP is required');
      return false;
    }
    if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
      Alert.alert('Error', 'Price cannot be greater than MRP');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Valid stock quantity is required');
      return false;
    }
    if (formData.images.length === 0) {
      Alert.alert('Error', 'At least one product image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!formData.sku.trim()) {
      Alert.alert(
        'Missing SKU',
        'You haven\'t entered a SKU ID. Would you like to enter one or let the system generate it automatically?',
        [
          { text: 'Enter SKU', style: 'cancel' },
          { text: 'Auto-generate', onPress: () => processSubmit() }
        ]
      );
      return;
    }

    processSubmit();
  };

  const processSubmit = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
        stock: parseInt(formData.stock),
        sku: formData.sku.trim() || undefined,
        discount: calculateDiscount(),
        category: formData.category,
        subcategory: formData.subcategory || null,
        isFeatured: formData.isFeatured
      };

      if (isEditMode) {
        // UPDATE EXISTING PRODUCT
        const response = await api.put(`/admin/products/${product._id}`, productData);
        if (response.data.success) {
          Alert.alert('Success', 'Product updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        // CREATE NEW PRODUCT
        const response = await api.post('/admin/products', productData);
        if (response.data.success) {
          Alert.alert('Success', 'Product added successfully!', [
            { text: 'Add Another', onPress: () => resetForm() },
            { text: 'Go Back', onPress: () => navigation.goBack() }
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c._id === formData.category);
  const selectedSubcategory = subcategories.find(c => c._id === formData.subcategory);

  // Category Selection Modal
  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Icon name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  formData.category === item._id && styles.categoryItemSelected
                ]}
                onPress={() => handleCategorySelect(item._id)}
              >
                <View style={styles.categoryItemContent}>
                  {item.image && (
                    <Image
                      source={{ uri: getImageUrl(item.image) }}
                      style={styles.categoryItemImage}
                    />
                  )}
                  <View style={styles.categoryItemText}>
                    <Text style={styles.categoryItemName}>{item.name}</Text>
                    <Text style={styles.categoryItemSlug}>{item.slug}</Text>
                  </View>
                </View>
                {formData.category === item._id && (
                  <Icon name="checkmark-circle" size={24} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Subcategory Selection Modal
  const SubcategoryModal = () => (
    <Modal
      visible={showSubcategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSubcategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Subcategory</Text>
            <TouchableOpacity onPress={() => setShowSubcategoryModal(false)}>
              <Icon name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loadingSubcategories ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : subcategories.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF' }}>No subcategories available</Text>
            </View>
          ) : (
            <FlatList
              data={subcategories}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    formData.subcategory === item._id && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, subcategory: item._id });
                    setShowSubcategoryModal(false);
                  }}
                >
                  <View style={styles.categoryItemContent}>
                    {item.image && (
                      <Image
                        source={{ uri: getImageUrl(item.image) }}
                        style={styles.categoryItemImage}
                      />
                    )}
                    <View style={styles.categoryItemText}>
                      <Text style={styles.categoryItemName}>{item.name}</Text>
                      <Text style={styles.categoryItemSlug}>{item.slug}</Text>
                    </View>
                  </View>
                  {formData.subcategory === item._id && (
                    <Icon name="checkmark-circle" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Product' : 'Add New Product'}</Text>
        <TouchableOpacity onPress={resetForm}>
          <Icon name="refresh" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Product Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Product Images *</Text>
            {formData.images.length > 0 && (
              <Text style={styles.sectionBadge}>{formData.images.length}/5</Text>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Upload up to 5 images</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {formData.images.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri: getImageUrl(uri) }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {formData.images.length < 5 && (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickImages}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#4F46E5" />
                ) : (
                  <>
                    <Icon name="cloud-upload-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.uploadText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter product description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Step 1: Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category * (Step 1)</Text>
            <TouchableOpacity
              style={styles.pickerWrapper}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerButton}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerText, !formData.category && { color: '#9CA3AF' }]}>
                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Step 2: Subcategory Selection (shows only after category is selected) */}
          {formData.category && (
            <View style={styles.formGroup}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 2</Text>
              </View>
              <Text style={styles.label}>Subcategory (Optional)</Text>
              <TouchableOpacity
                style={styles.pickerWrapper}
                onPress={() => setShowSubcategoryModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerButton}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerText, !formData.subcategory && { color: '#9CA3AF' }]}>
                      {selectedSubcategory ? selectedSubcategory.name : 'Select Subcategory (optional)'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                {subcategories.length} subcategories available for {selectedCategory?.name}
              </Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>MRP *</Text>
              <TextInput
                style={styles.input}
                placeholder="₹0"
                value={formData.mrp}
                onChangeText={(text) => setFormData({ ...formData, mrp: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={{ width: 12 }} />

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Selling Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="₹0"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {calculateDiscount() > 0 && (
            <View style={styles.discountBox}>
              <Icon name="pricetag" size={18} color="#10B981" />
              <Text style={styles.discountText}>
                {calculateDiscount()}% discount
              </Text>
            </View>
          )}
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>SKU ID (Leave empty for auto-generation)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter SKU ID"
              value={formData.sku}
              onChangeText={(text) => setFormData({ ...formData, sku: text })}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.formGroup, styles.switchContainer]}>
            <View>
              <Text style={styles.label}>Mark as Featured Product</Text>
              <Text style={styles.helperText}>Maximum 5 products can be featured on home screen.</Text>
            </View>
            <TouchableOpacity 
              style={[styles.switchTrack, formData.isFeatured && styles.switchTrackActive]}
              onPress={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
              activeOpacity={0.8}
            >
              <View style={[styles.switchThumb, formData.isFeatured && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (isLoading || isUploading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || isUploading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="checkmark" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>{isEditMode ? 'Update Product' : 'Add Product'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <CategoryModal />
      <SubcategoryModal />
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
  content: { flex: 1 },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  uploadBox: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  uploadText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8
  },
  formGroup: { marginBottom: 16 },
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
    height: 100,
    textAlignVertical: 'top'
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden'
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  pickerText: {
    fontSize: 15,
    color: '#111827'
  },
  stepBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7'
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic'
  },
  row: {
    flexDirection: 'row'
  },
  discountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981'
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  categoryItemSelected: {
    backgroundColor: '#F0F4FF'
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6'
  },
  categoryItemText: {
    flex: 1
  },
  categoryItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  categoryItemSlug: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  }
});

export default AddProductScreen;