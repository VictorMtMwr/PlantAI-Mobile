import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({ type, placeholder, value, onChange }) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      keyboardType={type === 'email' ? 'email-address' : 'default'}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
});

export default Input;