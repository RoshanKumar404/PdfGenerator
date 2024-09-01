import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { requestCameraWithPermission,requestGalleryWithPermission,requestDocumentWithPermission } from './filePemissons';
const YourComponent = () => {
  const onPressItem = async (index) => {
    let response;
    switch (index) {
      case 0:
        response = await requestDocumentWithPermission();
        break;
      case 1:
        response = await requestGalleryWithPermission();
        break;
      case 2:
        response = await requestCameraWithPermission();
        break;
      default:
        return;
    }
    Alert.alert(JSON.stringify(response));
  };

  return (
    <View>
      <TouchableOpacity onPress={() => onPressItem(0)} style={styles.button}>
        <Text style={styles.buttonText}>Open Document</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onPressItem(1)} style={styles.button}>
        <Text style={styles.buttonText}>Open Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onPressItem(2)} style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
};

export default YourComponent;
