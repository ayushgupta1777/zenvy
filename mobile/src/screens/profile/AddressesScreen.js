import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';
import CustomHeader from '../../components/CustomHeader';
import styles from './AddressesScreen.Styles';
import useAddressManager from '../../hooks/useAddressManager';

const AddressesScreen = ({ navigation, route }) => {
  const { fromCheckout } = route.params || {};
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', isDefault: false
  });

  const {
    addresses, isLoading, isLocating, isSearchingPincode,
    getCurrentLocation, lookupPincode, deleteAddress, refresh
  } = useAddressManager((geoData) => {
    setFormData(prev => ({
      ...prev,
      addressLine1: geoData.formattedAddress || prev.addressLine1,
      city: geoData.city || prev.city,
      state: geoData.state || prev.state,
      pincode: geoData.pincode || prev.pincode
    }));
  });

  const handlePincodeChange = async (val) => {
    setFormData({ ...formData, pincode: val });
    if (val.length === 6) {
      const data = await lookupPincode(val);
      if (data) setFormData(prev => ({ ...prev, city: data.city, state: data.state }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.pincode) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields.');
    }
    setIsSubmitting(true);
    try {
      await api.post('/addresses', formData);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
      refresh();
      if (fromCheckout) navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAddressItem = (item) => (
    <View key={item._id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.typeBadge}><Icon name="location" size={14} color="#4F46E5" /><Text style={styles.typeText}>Home</Text></View>
        {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
      </View>
      <Text style={styles.nameText}>{item.name}</Text>
      <Text style={styles.phoneText}>{item.phone}</Text>
      <Text style={styles.addressText}>{item.addressLine1}</Text>
      {item.addressLine2 && <Text style={styles.addressText}>{item.addressLine2}</Text>}
      <Text style={styles.addressText}>{item.city}, {item.state} - {item.pincode}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn}><Icon name="create-outline" size={20} color="#4F46E5" /><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => deleteAddress(item._id)}><Icon name="trash-outline" size={20} color="#EF4444" /><Text style={[styles.actionText, styles.actionTextDelete]}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="My Addresses" showBack />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Icon name="add-circle" size={24} color="#4F46E5" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>

        {isLoading ? <ActivityIndicator size="large" color="#4F46E5" style={styles.loaderMargin} /> : (
          addresses.length === 0 ? (
            <View style={styles.emptyState}><Icon name="location-outline" size={64} color="#D1D5DB" /><Text style={styles.emptyTitle}>No Addresses Saved</Text><Text style={styles.emptySubtitle}>Add an address to speed up your checkout process.</Text></View>
          ) : addresses.map(renderAddressItem)
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>New Address</Text><TouchableOpacity onPress={() => setShowAddModal(false)}><Icon name="close" size={24} color="#6B7280" /></TouchableOpacity></View>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity style={styles.gpsBtn} onPress={getCurrentLocation} disabled={isLocating}>
                {isLocating ? <ActivityIndicator color="#4F46E5" /> : <><Icon name="navigate" size={20} color="#4F46E5" /><Text style={styles.gpsText}>Use Current Location (GPS)</Text></>}
              </TouchableOpacity>
              <View style={styles.inputGroup}><Text style={styles.label}>Full Name *</Text><TextInput style={styles.input} placeholder="John Doe" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Phone Number *</Text><TextInput style={styles.input} placeholder="9876543210" keyboardType="phone-pad" value={formData.phone} onChangeText={(t) => setFormData({ ...formData, phone: t })} /></View>
              <View style={styles.row}><View style={[styles.inputGroup, styles.flex1]}><Text style={styles.label}>Pincode *</Text><View style={styles.pincodeInputWrapper}><TextInput style={styles.input} placeholder="123456" keyboardType="number-pad" maxLength={6} value={formData.pincode} onChangeText={handlePincodeChange} />{isSearchingPincode && <ActivityIndicator size="small" color="#4F46E5" style={styles.pincodeLoader} />}</View></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Address Line 1 *</Text><TextInput style={styles.input} placeholder="House No, Building Name" value={formData.addressLine1} onChangeText={(t) => setFormData({ ...formData, addressLine1: t })} /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Address Line 2</Text><TextInput style={styles.input} placeholder="Road, Area, Landmark" value={formData.addressLine2} onChangeText={(t) => setFormData({ ...formData, addressLine2: t })} /></View>
              <View style={styles.row}><View style={[styles.inputGroup, styles.flex1Margin]}><Text style={styles.label}>City *</Text><TextInput style={styles.input} placeholder="City" value={formData.city} onChangeText={(t) => setFormData({ ...formData, city: t })} /></View><View style={[styles.inputGroup, styles.flex1]}><Text style={styles.label}>State *</Text><TextInput style={styles.input} placeholder="State" value={formData.state} onChangeText={(t) => setFormData({ ...formData, state: t })} /></View></View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSubmitting}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}</TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddressesScreen;