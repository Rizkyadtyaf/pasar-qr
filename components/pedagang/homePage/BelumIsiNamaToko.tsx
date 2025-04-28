import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Store, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Color';

interface BelumIsiNamaTokoProps {
  visible: boolean;
  onClose: () => void;
}

const BelumIsiNamaToko: React.FC<BelumIsiNamaTokoProps> = ({ visible, onClose }) => {
  const router = useRouter();

  const handleNavigateToProfile = () => {
    onClose();
    router.push('/pedagang/profile');
  };

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
            <Store size={40} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Toko Kamu Belum Lengkap</Text>
          
          <Text style={styles.description}>
            Kamu belum mengisi nama toko. Lengkapi profil toko kamu untuk pengalaman yang lebih baik.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={onClose}
            >
              <Text style={styles.laterButtonText}>Nanti Saja</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={handleNavigateToProfile}
            >
              <Text style={styles.profileButtonText}>Isi Sekarang</Text>
              <ArrowRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  laterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  laterButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default BelumIsiNamaToko;