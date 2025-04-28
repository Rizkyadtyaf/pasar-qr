import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, StatusBar, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../../../constants/Color';
import { supabase } from '../../../lib/supabase';
import FiturBelumTersedia from '../../../components/FiturBelumTersedia';

export default function PengaturanScreen() {
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFiturModal, setShowFiturModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Mengatur StatusBar saat komponen dimount
  useEffect(() => {
    StatusBar.setBackgroundColor(Colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace('/pedagang');
    return;
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleDarkModeToggle = (value: boolean) => {
    // Tampilkan modal fitur belum tersedia
    setShowFiturModal(true);
    // Kembalikan switch ke posisi semula
    setDarkModeEnabled(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.settingsContainer}>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="brightness-4" size={24} color="#555" />
              <Text style={styles.settingText}>Mode Gelap</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#ddd', true: Colors.primary }}
              thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../profile')}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="account-circle" size={24} color="#555" />
              <Text style={styles.settingText}>Profil</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../bantuan')}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="help" size={24} color="#555" />
              <Text style={styles.settingText}>Bantuan</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tombol Keluar yang terpisah dan di bagian bawah */}
      <View style={styles.logoutButtonWrapper}>
        <TouchableOpacity 
          style={styles.logoutButtonContainer} 
          onPress={openLogoutModal}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Konfirmasi Logout */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="warning" size={32} color="#FF6B6B" />
              <Text style={styles.modalTitle}>Konfirmasi Keluar</Text>
            </View>
            
            <Text style={styles.modalText}>
              Kamu yakin mau keluar dari akun kamu?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
              >
                <Text style={styles.confirmButtonText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Fitur Belum Tersedia */}
      <FiturBelumTersedia 
        visible={showFiturModal}
        onClose={() => setShowFiturModal(false)}
        fiturName="Mode Gelap"
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 70, // Tambahkan padding atas lebih besar
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 100, // Tambahkan padding bawah untuk ruang tombol keluar
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  // Style untuk wrapper tombol keluar
  logoutButtonWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  // Style untuk tombol keluar yang terpisah
  logoutButtonContainer: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Style untuk modal konfirmasi
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});