// ============================================
// mobile/src/screens/vendor/AddProductScreen.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/vendor/AddProductPremiumStyles';

const AddProductScreen = ({ navigation }) => {
  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    category: '',
    images: []
  });

  const updateField = (field, value) => {
    setProduct({ ...product, [field]: value });
  };

  const pickImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5
      },
      (response) => {
        if (response.assets) {
          const images = response.assets.map(asset => asset.uri);
          updateField('images', [...product.images, ...images]);
        }
      }
    );
  };

  const removeImage = (index) => {
    const newImages = product.images.filter((_, i) => i !== index);
    updateField('images', newImages);
  };

  const handleSubmit = () => {
    if (!product.title || !product.price || !product.mrp) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Submit to API
    Alert.alert('Success', 'Product submitted for approval');
    navigation.goBack();
  };

  return (
    <ScrollView 
      style={styles['addproduct-premium-container']}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles['addproduct-premium-header']}>
        <TouchableOpacity 
          style={styles['addproduct-premium-back-btn']}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles['addproduct-premium-header-title']}>Add Product</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image Upload Section */}
      <View style={styles['addproduct-premium-section']}>
        <View style={styles['addproduct-premium-section-header']}>
          <Text style={styles['addproduct-premium-section-title']}>Product Images</Text>
          <Text style={styles['addproduct-premium-section-badge']}>
            {product.images.length}/5
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles['addproduct-premium-image-scroll']}
        >
          {product.images.map((uri, index) => (
            <View key={index} style={styles['addproduct-premium-image-preview']}>
              <Image 
                source={{ uri }} 
                style={styles['addproduct-premium-preview-image']} 
              />
              <TouchableOpacity
                style={styles['addproduct-premium-remove-image']}
                onPress={() => removeImage(index)}
              >
                <Icon name="close-circle" size={28} color="#EF4444" />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles['addproduct-premium-primary-badge']}>
                  <Text style={styles['addproduct-premium-primary-text']}>Primary</Text>
                </View>
              )}
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles['addproduct-premium-add-image-btn']} 
            onPress={pickImages}
          >
            <View style={styles['addproduct-premium-add-image-icon']}>
              <Icon name="camera" size={32} color="#0A84FF" />
            </View>
            <Text style={styles['addproduct-premium-add-image-text']}>Add Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Product Details Section */}
      <View style={styles['addproduct-premium-section']}>
        <Text style={styles['addproduct-premium-section-title']}>Product Details</Text>

        {/* Title */}
        <View style={styles['addproduct-premium-input-group']}>
          <Text style={styles['addproduct-premium-label']}>
            Product Title <Text style={styles['addproduct-premium-required']}>*</Text>
          </Text>
          <View style={styles['addproduct-premium-input-container']}>
            <TextInput
              style={styles['addproduct-premium-input']}
              placeholder="Enter product name"
              placeholderTextColor="#9CA3AF"
              value={product.title}
              onChangeText={(text) => updateField('title', text)}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles['addproduct-premium-input-group']}>
          <Text style={styles['addproduct-premium-label']}>
            Description <Text style={styles['addproduct-premium-required']}>*</Text>
          </Text>
          <View style={styles['addproduct-premium-textarea-container']}>
            <TextInput
              style={styles['addproduct-premium-textarea']}
              placeholder="Describe your product in detail..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={product.description}
              onChangeText={(text) => updateField('description', text)}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Price Row */}
        <View style={styles['addproduct-premium-row']}>
          <View style={styles['addproduct-premium-input-half']}>
            <Text style={styles['addproduct-premium-label']}>
              Selling Price <Text style={styles['addproduct-premium-required']}>*</Text>
            </Text>
            <View style={styles['addproduct-premium-input-container']}>
              <Text style={styles['addproduct-premium-currency']}>₹</Text>
              <TextInput
                style={styles['addproduct-premium-input-price']}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={product.price}
                onChangeText={(text) => updateField('price', text)}
              />
            </View>
          </View>

          <View style={styles['addproduct-premium-input-half']}>
            <Text style={styles['addproduct-premium-label']}>
              MRP <Text style={styles['addproduct-premium-required']}>*</Text>
            </Text>
            <View style={styles['addproduct-premium-input-container']}>
              <Text style={styles['addproduct-premium-currency']}>₹</Text>
              <TextInput
                style={styles['addproduct-premium-input-price']}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={product.mrp}
                onChangeText={(text) => updateField('mrp', text)}
              />
            </View>
          </View>
        </View>

        {/* Stock */}
        <View style={styles['addproduct-premium-input-group']}>
          <Text style={styles['addproduct-premium-label']}>
            Stock Quantity <Text style={styles['addproduct-premium-required']}>*</Text>
          </Text>
          <View style={styles['addproduct-premium-input-container']}>
            <Icon name="cube-outline" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles['addproduct-premium-input']}
              placeholder="Available quantity"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={product.stock}
              onChangeText={(text) => updateField('stock', text)}
            />
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles['addproduct-premium-info-card']}>
        <Icon name="information-circle" size={24} color="#0A84FF" />
        <Text style={styles['addproduct-premium-info-text']}>
          Your product will be reviewed within 24 hours. You'll be notified once it's approved and live.
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles['addproduct-premium-submit-btn']} 
        onPress={handleSubmit}
      >
        <Text style={styles['addproduct-premium-submit-text']}>Submit for Approval</Text>
        <Icon name="checkmark-circle" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default AddProductScreen;