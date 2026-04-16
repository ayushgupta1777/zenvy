import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/addresses');
      setAddresses(response.data.data.addresses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'home',
      isDefault: false
    });
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert('Error', 'Valid phone number is required');
      return false;
    }
    if (!formData.addressLine1.trim()) {
      Alert.alert('Error', 'Address line 1 is required');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'City is required');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Error', 'State is required');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      Alert.alert('Error', 'Valid 6-digit pincode is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingAddress) {
        await api.put(`/users/addresses/${editingAddress._id}`, formData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await api.post('/users/addresses', formData);
        Alert.alert('Success', 'Address added successfully');
      }
      
      setShowModal(false);
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/addresses/${addressId}`);
              Alert.alert('Success', 'Address deleted');
              fetchAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const getAddressTypeIcon = (type) => {
    const icons = {
      home: 'home',
      work: 'briefcase',
      other: 'location'
    };
    return icons[type] || 'location';
  };

  const getAddressTypeColor = (type) => {
    const colors = {
      home: '#4F46E5',
      work: '#10B981',
      other: '#F59E0B'
    };
    return colors[type] || '#6B7280';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Icon name="add-circle" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="location-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No addresses saved</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
              <Text style={styles.addBtnText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} style={styles.addressCard}>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Icon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}

              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <View
                    style={[
                      styles.typeIcon,
                      { backgroundColor: getAddressTypeColor(address.addressType) + '20' }
                    ]}
                  >
                    <Icon
                      name={getAddressTypeIcon(address.addressType)}
                      size={20}
                      color={getAddressTypeColor(address.addressType)}
                    />
                  </View>
                  <View>
                    <Text style={styles.addressName}>{address.name}</Text>
                    <Text style={styles.addressPhone}>{address.phone}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.addressBody}>
                <Text style={styles.addressText}>{address.addressLine1}</Text>
                {address.addressLine2 && (
                  <Text style={styles.addressText}>{address.addressLine2}</Text>
                )}
                <Text style={styles.addressText}>
                  {address.city}, {address.state} - {address.pincode}
                </Text>
              </View>

              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openEditModal(address)}
                >
                  <Icon name="create-outline" size={20} color="#4F46E5" />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteActionBtn]}
                  onPress={() => handleDelete(address._id)}
                >
                  <Icon name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
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
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="House no., Building name"
                  value={formData.addressLine1}
                  onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 2</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Road name, Area, Colony"
                  value={formData.addressLine2}
                  onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                  />
                </View>

                <View style={{ width: 12 }} />

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6 digits"
                    value={formData.pincode}
                    onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Type</Text>
                <View style={styles.typeButtons}>
                  {['home', 'work', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        formData.addressType === type && styles.typeBtnActive
                      ]}
                      onPress={() => setFormData({ ...formData, addressType: type })}
                    >
                      <Icon
                        name={getAddressTypeIcon(type)}
                        size={18}
                        color={formData.addressType === type ? '#fff' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.typeBtnText,
                          formData.addressType === type && styles.typeBtnTextActive
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                >
                  <Icon
                    name={formData.isDefault ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={formData.isDefault ? '#4F46E5' : '#9CA3AF'}
                  />
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Icon name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      {addresses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1, marginLeft: 16 },
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
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative'
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981'
  },
  addressHeader: {
    marginBottom: 12
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2
  },
  addressPhone: {
    fontSize: 13,
    color: '#6B7280'
  },
  addressBody: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6'
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 2
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  deleteActionBtn: {
    borderColor: '#FEE2E2'
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
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
  row: {
    flexDirection: 'row'
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  typeBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  typeBtnTextActive: {
    color: '#fff'
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

export default AddressesScreen;