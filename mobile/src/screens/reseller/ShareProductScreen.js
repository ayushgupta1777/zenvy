// ============================================
// mobile/src/screens/reseller/ShareProductScreen.js
// THIS IS THE KEY SCREEN FOR RESELLING FEATURE
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Clipboard,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { generateShareLink } from '../../redux/slices/resellerSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { Slider } from 'react-native';
import { styles } from '../../styling/screens/reseller/ShareProductPremiumStyles';

const ShareProductScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [margin, setMargin] = useState(15); // Default margin

  const dispatch = useDispatch();
  const { shareData, isLoading } = useSelector((state) => state.reseller);

  const MIN_MARGIN = parseFloat(process.env.MIN_RESELLER_MARGIN || 5);
  const MAX_MARGIN = parseFloat(process.env.MAX_RESELLER_MARGIN || 30);

  // Calculate reseller price and profit
  const resellerPrice = Math.round(product.price * (1 + margin / 100));
  const yourProfit = resellerPrice - product.price;
  const customerSavings = product.mrp - resellerPrice;

  const handleGenerateLink = () => {
    dispatch(generateShareLink({ productId: product._id, margin })).then((result) => {
      if (result.payload) {
        Alert.alert('Success', 'Share link generated!');
      }
    });
  };

  const handleShareWhatsApp = () => {
    if (!shareData) {
      handleGenerateLink();
      return;
    }

    Share.share({
      message: shareData.shareMessage,
      url: shareData.links.webLink
    });
  };

  const handleCopyLink = () => {
    if (shareData) {
      Clipboard.setString(shareData.links.webLink);
      Alert.alert('Copied!', 'Link copied to clipboard');
    }
  };

  return (
    <ScrollView 
      style={styles['share-premium-container']}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles['share-premium-header']}>
        <TouchableOpacity 
          style={styles['share-premium-back-btn']}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles['share-premium-header-title']}>Share & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Product Preview Card */}
      <View style={styles['share-premium-product-card']}>
        <Image 
          source={{ uri: product.images[0] }} 
          style={styles['share-premium-product-image']} 
        />
        <View style={styles['share-premium-product-info']}>
          <Text style={styles['share-premium-product-title']} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles['share-premium-product-prices']}>
            <Text style={styles['share-premium-original-price']}>₹{product.price}</Text>
            <View style={styles['share-premium-mrp-badge']}>
              <Text style={styles['share-premium-mrp-text']}>MRP ₹{product.mrp}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Margin Selector Section */}
      <View style={styles['share-premium-margin-section']}>
        <View style={styles['share-premium-margin-header']}>
          <Text style={styles['share-premium-margin-title']}>Set Your Profit Margin</Text>
          <View style={styles['share-premium-margin-badge']}>
            <Text style={styles['share-premium-margin-value']}>{margin}%</Text>
          </View>
        </View>

        {/* Slider */}
        <View style={styles['share-premium-slider-container']}>
          <Slider
            style={styles['share-premium-slider']}
            minimumValue={MIN_MARGIN}
            maximumValue={MAX_MARGIN}
            step={1}
            value={margin}
            onValueChange={setMargin}
            minimumTrackTintColor="#0A84FF"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#0A84FF"
          />
        </View>

        <View style={styles['share-premium-margin-range']}>
          <Text style={styles['share-premium-range-text']}>Min {MIN_MARGIN}%</Text>
          <Text style={styles['share-premium-range-text']}>Max {MAX_MARGIN}%</Text>
        </View>
      </View>

      {/* Price Breakdown Card */}
      <View style={styles['share-premium-breakdown-card']}>
        <Text style={styles['share-premium-breakdown-title']}>Price Breakdown</Text>

        {/* Your Selling Price */}
        <View style={[styles['share-premium-breakdown-row'], styles['share-premium-breakdown-highlight']]}>
          <View style={styles['share-premium-breakdown-label-container']}>
            <Icon name="pricetag" size={20} color="#0A84FF" />
            <Text style={styles['share-premium-breakdown-label']}>Your Selling Price</Text>
          </View>
          <Text style={styles['share-premium-breakdown-value-primary']}>₹{resellerPrice}</Text>
        </View>

        {/* Your Profit */}
        <View style={styles['share-premium-breakdown-row']}>
          <View style={styles['share-premium-breakdown-label-container']}>
            <Icon name="trophy" size={20} color="#34C759" />
            <Text style={styles['share-premium-breakdown-label']}>Your Profit</Text>
          </View>
          <Text style={styles['share-premium-breakdown-value-success']}>₹{yourProfit}</Text>
        </View>

        {/* Customer Saves */}
        <View style={styles['share-premium-breakdown-row']}>
          <View style={styles['share-premium-breakdown-label-container']}>
            <Icon name="happy" size={20} color="#FF9500" />
            <Text style={styles['share-premium-breakdown-label']}>Customer Saves</Text>
          </View>
          <Text style={styles['share-premium-breakdown-value']}>₹{customerSavings}</Text>
        </View>

        <View style={styles['share-premium-divider']} />

        {/* Small Details */}
        <View style={styles['share-premium-breakdown-row-small']}>
          <Text style={styles['share-premium-breakdown-label-small']}>Product Cost:</Text>
          <Text style={styles['share-premium-breakdown-value-small']}>₹{product.price}</Text>
        </View>
        <View style={styles['share-premium-breakdown-row-small']}>
          <Text style={styles['share-premium-breakdown-label-small']}>MRP:</Text>
          <Text style={styles['share-premium-breakdown-value-small']}>₹{product.mrp}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles['share-premium-actions']}>
        <TouchableOpacity
          style={styles['share-premium-generate-btn']}
          onPress={handleGenerateLink}
          disabled={isLoading}
        >
          <Icon name="link" size={22} color="#fff" />
          <Text style={styles['share-premium-generate-text']}>Generate Link</Text>
        </TouchableOpacity>

        {shareData && (
          <>
            <TouchableOpacity 
              style={styles['share-premium-whatsapp-btn']} 
              onPress={handleShareWhatsApp}
            >
              <Icon name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles['share-premium-whatsapp-text']}>Share on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles['share-premium-copy-btn']} 
              onPress={handleCopyLink}
            >
              <Icon name="copy-outline" size={22} color="#0A84FF" />
              <Text style={styles['share-premium-copy-text']}>Copy Link</Text>
            </TouchableOpacity>

            {/* Link Preview */}
            <View style={styles['share-premium-link-preview']}>
              <Text style={styles['share-premium-link-label']}>Your Share Link:</Text>
              <Text style={styles['share-premium-link-text']} numberOfLines={1}>
                {shareData.links.webLink}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Info Card */}
      <View style={styles['share-premium-info-card']}>
        <View style={styles['share-premium-info-icon']}>
          <Icon name="information-circle" size={28} color="#0A84FF" />
        </View>
        <Text style={styles['share-premium-info-text']}>
          When someone buys through your link, you'll earn <Text style={styles['share-premium-info-highlight']}>₹{yourProfit}</Text> commission directly to your wallet
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default ShareProductScreen;