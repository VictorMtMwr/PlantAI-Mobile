import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CameraButton = () => {
  const handleTakePhoto = () => {
    // Placeholder: Implementar con expo-image-picker
    alert('Funcionalidad de cámara próximamente');
  };

  return (
    <TouchableOpacity onPress={handleTakePhoto} style={styles.button}>
      <Text style={styles.buttonText}>Tomar Foto</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3B82F6', // blue-600
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CameraButton;