import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/Color';

interface BerhasilVerifikasiOtpProps {
  visible: boolean;
  onClose: () => void;
  onLanjutkan: () => void;
}

const BerhasilVerifikasiOtp: React.FC<BerhasilVerifikasiOtpProps> = ({
  visible,
  onClose,
  onLanjutkan
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.iconContainer}>
            <CheckCircle size={50} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Verifikasi Berhasil!</Text>
          
          <Text style={styles.message}>
            Email kamu berhasil diverifikasi. Sekarang kamu bisa masuk ke akun kamu.
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={onLanjutkan}>
            <Text style={styles.buttonText}>Masuk ke Akun</Text>
            <ArrowRight size={20} color="#FFFFFF" style={{marginLeft: 8}} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.85,
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
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BerhasilVerifikasiOtp;