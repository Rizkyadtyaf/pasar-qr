import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Mail, CheckCircle, X } from 'lucide-react-native';
import { Colors } from '../../constants/Color';

interface KonfirmasiKodeOtpProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onLanjutkan: () => void;
}

const KonfirmasiKodeOtp: React.FC<KonfirmasiKodeOtpProps> = ({
  visible,
  onClose,
  email,
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#999" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Mail size={40} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Pendaftaran Berhasil!</Text>
          
          <View style={styles.emailContainer}>
            <CheckCircle size={16} color={Colors.primary} style={styles.checkIcon} />
            <Text style={styles.message}>
              Kami telah mengirimkan kode OTP ke email{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>
          
          <Text style={styles.infoText}>
            Silakan cek inbox atau folder spam kamu untuk menemukan kode OTP
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={onLanjutkan}>
            <Text style={styles.buttonText}>Lanjutkan</Text>
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
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
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

export default KonfirmasiKodeOtp;