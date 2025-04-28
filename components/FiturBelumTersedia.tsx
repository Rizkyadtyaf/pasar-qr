import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Color';

interface FiturBelumTersediaProps {
  visible: boolean;
  onClose: () => void;
  fiturName?: string;
}

const FiturBelumTersedia: React.FC<FiturBelumTersediaProps> = ({ 
  visible, 
  onClose,
  fiturName = 'Fitur ini' 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <AlertCircle size={40} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Fitur Belum Tersedia</Text>
          
          <Text style={styles.description}>
            {fiturName} masih dalam tahap pengembangan dan akan segera hadir. 
            Mohon tunggu update selanjutnya ya!
          </Text>
          
          <TouchableOpacity 
            style={styles.okButton} 
            onPress={onClose}
          >
            <Text style={styles.okButtonText}>Oke, Mengerti</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(64, 80, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default FiturBelumTersedia;