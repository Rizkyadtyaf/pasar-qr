import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Color';

interface BerhasilTambahProdukProps {
  visible: boolean;
  onClose: () => void;
  productName?: string;
}

const BerhasilTambahProduk: React.FC<BerhasilTambahProdukProps> = ({ 
  visible, 
  onClose,
  productName = 'Produk' 
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
            <CheckCircle size={40} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Berhasil!</Text>
          
          <Text style={styles.description}>
            <Text style={styles.productName}>{productName}</Text> telah berhasil ditambahkan ke daftar produk Kamu.
          </Text>
          
          <TouchableOpacity 
            style={styles.okButton} 
            onPress={onClose}
          >
            <Text style={styles.okButtonText}>Oke</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  productName: {
    fontWeight: 'bold',
    color: Colors.primary,
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

export default BerhasilTambahProduk;