import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';

export const pickImage = (callback, multiple = false) => {
  const options = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    selectionLimit: multiple ? 0 : 1, // 0 = unlimited
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
      callback(response.assets);
    }
  });
};