import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const UpgradeModal = ({ visible, version, updateUrl, onDismiss }) => {
  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.headerGradient}
          >
            <Icon name="rocket-outline" size={50} color="#FFF" />
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>New Update Available!</Text>
            <Text style={styles.versionLabel}>Version {version}</Text>
            
            <Text style={styles.description}>
              A new version of the app is ready for you. Update now to enjoy the latest features, improvements, and bug fixes.
            </Text>

            <TouchableOpacity 
              style={styles.updateButton} 
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dismissButton} 
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  headerGradient: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 24,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center'
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  updateButton: {
    backgroundColor: '#4F46E5',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  dismissButton: {
    paddingVertical: 8
  },
  dismissButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default UpgradeModal;
