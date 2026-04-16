// ============================================
// SHIPROCKET SETUP & MANAGEMENT - ADMIN
// ============================================

// ============================================
// 1. Shiprocket Settings Screen
// admin/screens/ShiprocketSettingsScreen.js
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator,
  Alert, Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const ShiprocketSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    channelId: '',
    defaultPickupName: '',
    autoCreateShipment: true,
    autoFetchTracking: true,
    trackingUpdateInterval: 60,
    defaultWeight: 0.5,
    defaultLength: 10,
    defaultBreadth: 10,
    defaultHeight: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/shiprocket/settings');
      const data = response.data.data.settings;
      setSettings(data);
      setFormData({
        email: data.email || '',
        password: '',
        channelId: data.channelId || '',
        defaultPickupName: data.defaultPickupName || '',
        autoCreateShipment: data.autoCreateShipment ?? true,
        autoFetchTracking: data.autoFetchTracking ?? true,
        trackingUpdateInterval: data.trackingUpdateInterval || 60,
        defaultWeight: data.defaultWeight || 0.5,
        defaultLength: data.defaultLength || 10,
        defaultBreadth: data.defaultBreadth || 10,
        defaultHeight: data.defaultHeight || 10
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsTesting(true);
      await api.post('/shiprocket/test-connection');
      Alert.alert('Success', 'Connected to Shiprocket successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Please check your credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  const fetchPickupLocations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/shiprocket/pickup-locations');
      Alert.alert(
        'Success',
        `Fetched ${response.data.data.locations.length} pickup locations`
      );
      fetchSettings(); // Refresh to show updated locations
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pickup locations');
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultLocation = async (locationId) => {
    try {
      setIsLoading(true);
      await api.patch(`/shiprocket/pickup-locations/${locationId}/default`);
      Alert.alert('Success', 'Default pickup location updated');
      fetchSettings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update default location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put('/shiprocket/settings', formData);
      Alert.alert('Success', 'Settings saved successfully');
      fetchSettings();
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shiprocket Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Icon
                name={settings?.isActive ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={settings?.isActive ? '#10B981' : '#EF4444'}
              />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {settings?.isActive ? 'Connected' : 'Not Connected'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {settings?.isActive
                  ? 'Shiprocket integration is active'
                  : 'Configure credentials to connect'}
              </Text>
            </View>
          </View>
        </View>

        {/* Credentials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Credentials</Text>
          <Text style={styles.sectionSubtitle}>
            Get your credentials from Shiprocket dashboard → Settings → API
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Shiprocket email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Shiprocket password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
            <Text style={styles.helperText}>
              Leave blank to keep existing password
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Channel ID (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter channel ID"
              value={formData.channelId}
              onChangeText={(text) => setFormData({ ...formData, channelId: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Default Pickup Name (Manual Override)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. PRIMARY WAREHOUSE"
              value={formData.defaultPickupName}
              onChangeText={(text) => setFormData({ ...formData, defaultPickupName: text })}
            />
            <Text style={styles.helperText}>
              IMPORTANT: This must slowly match the 'Pickup Location' name in your Shiprocket dashboard. Use this if the automated 'Fetch' below is not working for you.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.testBtn}
            onPress={testConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator color="#4F46E5" />
            ) : (
              <>
                <Icon name="flash-outline" size={20} color="#4F46E5" />
                <Text style={styles.testBtnText}>Test Connection</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Pickup Locations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pickup Locations</Text>
            <TouchableOpacity
              style={styles.fetchBtn}
              onPress={fetchPickupLocations}
            >
              <Icon name="download-outline" size={16} color="#4F46E5" />
              <Text style={styles.fetchBtnText}>Fetch</Text>
            </TouchableOpacity>
          </View>

          {settings?.pickupLocations?.length > 0 ? (
            settings.pickupLocations.map((location, index) => (
              <View key={index} style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  {location.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationAddress}>
                  {location.address}, {location.city} - {location.pincode}
                </Text>
                <Text style={styles.locationPhone}>
                  📞 {location.phone}
                </Text>

                {!location.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultMiniBtn}
                    onPress={() => setDefaultLocation(location.id)}
                  >
                    <Text style={styles.setDefaultMiniBtnText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="location-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No pickup locations found</Text>
              <Text style={styles.emptySubtext}>
                Click "Fetch" to load from Shiprocket
              </Text>
            </View>
          )}
        </View>

        {/* Automation Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automation</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Auto-create Shipment</Text>
              <Text style={styles.switchSubtext}>
                Automatically create shipment when order is confirmed
              </Text>
            </View>
            <Switch
              value={formData.autoCreateShipment}
              onValueChange={(value) =>
                setFormData({ ...formData, autoCreateShipment: value })
              }
              trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
              thumbColor={formData.autoCreateShipment ? '#4F46E5' : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Auto-fetch Tracking</Text>
              <Text style={styles.switchSubtext}>
                Automatically update tracking information
              </Text>
            </View>
            <Switch
              value={formData.autoFetchTracking}
              onValueChange={(value) =>
                setFormData({ ...formData, autoFetchTracking: value })
              }
              trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
              thumbColor={formData.autoFetchTracking ? '#4F46E5' : '#F3F4F6'}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tracking Update Interval (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              value={String(formData.trackingUpdateInterval)}
              onChangeText={(text) =>
                setFormData({ ...formData, trackingUpdateInterval: parseInt(text) || 60 })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Default Package Dimensions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Package Dimensions</Text>
          <Text style={styles.sectionSubtitle}>
            These values will be used if not specified per product
          </Text>

          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.5"
                value={String(formData.defaultWeight)}
                onChangeText={(text) =>
                  setFormData({ ...formData, defaultWeight: parseFloat(text) || 0.5 })
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Length (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={String(formData.defaultLength)}
                onChangeText={(text) =>
                  setFormData({ ...formData, defaultLength: parseInt(text) || 10 })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Breadth (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={String(formData.defaultBreadth)}
                onChangeText={(text) =>
                  setFormData({ ...formData, defaultBreadth: parseInt(text) || 10 })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.dimensionInput}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={String(formData.defaultHeight)}
                onChangeText={(text) =>
                  setFormData({ ...formData, defaultHeight: parseInt(text) || 10 })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Webhook Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Status Updates (Webhook)</Text>
          <Text style={styles.sectionSubtitle}>
            To enable live status updates from Shiprocket, copy the URL below and paste it into your Shiprocket Dashboard → Settings → Webhooks.
          </Text>
          
          <View style={styles.webhookBox}>
            <Text style={styles.webhookUrlLabel}>WEBHOOK URL:</Text>
            <View style={styles.webhookUrlContainer}>
              <Text style={styles.webhookUrlText}>
                https://newrajfancystore.adsngrow.in/api/webhooks/shiprocket
              </Text>
              <TouchableOpacity 
                onPress={() => {
                   // Optional: Add clipboard support
                   Alert.alert("Webhook URL", "https://newrajfancystore.adsngrow.in/api/webhooks/shiprocket");
                }}
              >
                <Icon name="copy-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.webhookNote}>
            Events to subscribe to: <Text style={{fontWeight: '700'}}>Shipment Status Update</Text>, <Text style={{fontWeight: '700'}}>Delivery Update</Text>.
          </Text>
        </View>

        {/* Documentation Link */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={24} color="#4F46E5" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Need Help?</Text>
              <Text style={styles.infoText}>
                Visit Shiprocket documentation for detailed setup instructions
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="checkmark" size={22} color="#fff" />
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  content: { flex: 1 },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 16
  },
  statusIconContainer: {},
  statusContent: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
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
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
    marginTop: 8
  },
  testBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5'
  },
  fetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6
  },
  fetchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5'
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  defaultText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  locationAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4
  },
  locationPhone: { fontSize: 13, color: '#6B7280' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  switchContent: { flex: 1, marginRight: 16 },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  switchSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4
  },
  dimensionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  dimensionInput: { flex: 1 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 8,
    gap: 12
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4
  },
  infoText: { fontSize: 13, color: '#4F46E5' },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  setDefaultMiniBtn: {
    marginTop: 10,
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  setDefaultMiniBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5'
  },
  webhookBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8
  },
  webhookUrlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  webhookUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  webhookUrlText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  webhookNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 18
  }
});

export default ShiprocketSettingsScreen;