import React from 'react';
import {
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { getSystemVersion } from 'react-native-device-info';
import { Image } from 'react-native-compressor';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const FILE_MAX_SIZE = 2 * 1024 * 1024; // 2MB

const requestDocumentWithPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const deviceVersion = getSystemVersion();
      let granted = PermissionsAndroid.RESULTS.DENIED;
      if (deviceVersion >= 13) {
        granted = PermissionsAndroid.RESULTS.GRANTED;
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      }
      if (granted) {
        return pickDocument();
      }
    } else {
      return pickDocument(); // Handle iOS permissions if needed
    }
  } catch (error) {
    console.log('Error checking/requesting permissions:', error);
    return null;
  }
};

const pickDocument = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    });

    if (result && result[0]) {
      const { name, size, type, uri } = result[0];

      if (size > FILE_MAX_SIZE) {
        Alert.alert('File Size Limit Exceeded', 'Please select a file up to 2 MB.');
      } else {
        return { name, type, uri, size };
      }
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('Document picker cancelled by user');
    } else {
      console.log('Error picking document:', err);
    }
    return null;
  }
};

const requestCameraWithPermission = async () => {
  try {
    const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);

    if (cameraPermission === RESULTS.GRANTED) {
      return pickImageFromCamera();
    }
    const cameraPermissionResult = await request(PERMISSIONS.ANDROID.CAMERA);

    if (cameraPermissionResult === RESULTS.GRANTED) {
      return pickImageFromCamera();
    }
    console.log('Camera permission denied');
  } catch (error) {
    console.log('Error checking/requesting camera permission:', error);
    return null;
  }
};

const requestGalleryWithPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const deviceVersion = getSystemVersion();
      let granted = PermissionsAndroid.RESULTS.DENIED;
      if (deviceVersion >= 13) {
        granted = PermissionsAndroid.RESULTS.GRANTED;
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      }
      if (granted) {
        return pickImageFromGallery();
      }
    } else {
      console.log('iOS platform: No specific permissions required for media library');
      return pickImageFromGallery();
    }
  } catch (error) {
    console.log('Error checking/requesting storage permission:', error);
    return null;
  }
};

const pickImageFromCamera = async () => {
  return pickImageCommon(ImageCropPicker.openCamera);
};

const pickImageFromGallery = async () => {
  return pickImageCommon(ImageCropPicker.openPicker);
};

const pickImageCommon = async (imagePickerFn) => {
  try {
    const image = await imagePickerFn({
      cropping: true,
      multiple: false,
      mediaType: 'photo',
    });

    if (image) {
      const pathCompressed = await Image.compress(image.path, {
        maxWidth: 1500,
        maxHeight: 1000,
      });
      const imageCompressed = await RNFS.stat(pathCompressed);

      if (imageCompressed.size > FILE_MAX_SIZE) {
        Alert.alert('File Size Limit Exceeded', 'Please select a file up to 2 MB.');
      } else {
        return {
          name: image.filename || `image_${Date.now()}.${getFileExtension(imageCompressed.path)}`,
          type: image.mime,
          uri: imageCompressed.path,
          size: imageCompressed.size,
        };
      }
    }
  } catch (error) {
    console.log('Error picking image:', error);
    return null;
  }
};

const getFileExtension = (uri) => {
  const lastDotIndex = uri.lastIndexOf('.');
  return lastDotIndex !== -1 ? uri.slice(lastDotIndex + 1) : null;
};

const uploadFileImageOrPdf = async (fileBlob, isFromImagePicker = true) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: isFromImagePicker ? fileBlob.path : fileBlob[0].uri,
      type: isFromImagePicker ? fileBlob.mime : fileBlob[0].type,
      name: isFromImagePicker ? fileBlob.filename : fileBlob[0].name,
    });

    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const responseData = await response.json();
    console.log('File upload response:', responseData);
  } catch (error) {
    console.log('File upload error:', error);
  }
};

export {
  requestDocumentWithPermission,
  requestCameraWithPermission,
  requestGalleryWithPermission,
};
