import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Color';

interface ModalLoginProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const ModalLogin: React.FC<ModalLoginProps> = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <X size={20} color="#999" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <AlertCircle size={50} color={Colors.primary} />
          </View>
          
          <Text style={styles.modalTitle}>Login Gagal</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(64, 80, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ModalLogin;