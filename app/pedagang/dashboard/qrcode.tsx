import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../../constants/Color';
import QRCode from 'react-native-qrcode-svg';
import { useData } from './_layout';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import BerhasilSimpanQr from '../../../components/pedagang/BerhasilSimpanQr';
import { Download } from 'lucide-react-native';
import TemplateDownloadQR, { TemplateDownloadQRRef } from '../../../components/TemplateDownloadQR';

// Definisikan tipe untuk QR code ref
type QRCodeRef = {
  toDataURL: (callback: (data: string) => void) => void;
};

export default function QRCodeScreen() {
  const dataContext = useData();
  const qrCodeRef = useRef<QRCodeRef | null>(null);
  const templateQrRef = useRef<TemplateDownloadQRRef>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mengatur StatusBar saat komponen dimount
  useEffect(() => {
    StatusBar.setBackgroundColor(Colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  // Fungsi untuk mengunduh QR code
  const downloadQRCode = async () => {
    try {
      // Meminta izin untuk mengakses media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Izin ditolak', 'Kami membutuhkan izin untuk menyimpan QR code ke galeri kamu');
        return;
      }

      // Menggunakan template QR code untuk download
      if (templateQrRef.current) {
        const asset = await templateQrRef.current.downloadQRCode();
        if (asset) {
          setModalVisible(true);
        } else {
          Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan QR code');
        }
      }
    } catch (error) {
      console.error('Error saat mengunduh QR code:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan QR code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR Code Toko</Text>
      </View>
    
      <View style={styles.content}>
        <Text style={styles.headerTitle2}>{dataContext?.pedagang?.nama_toko || ""}</Text>
        <Text style={styles.subTitle}>ID Toko : {dataContext?.pedagang?.id} </Text>
        <View style={styles.qrContainer}>
          <TemplateDownloadQR
            ref={templateQrRef}
            qrValue={JSON.stringify({
              id: dataContext?.pedagang?.id,
              type: "pedagang"
            })}
            storeName={dataContext?.pedagang?.nama_toko || ""}
            storeDescription={dataContext?.pedagang?.deskripsi_toko || undefined}
            containerStyle={styles.qrTemplate}
          />
          
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={downloadQRCode}
          >
            <Download size={20} color="white" />
            <Text style={styles.downloadButtonText}>Simpan QR Code</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.instructions}>
          Tunjukkan QR Code ini kepada pembeli untuk melihat halaman toko Anda.
        </Text>
      </View>

      {/* Modal Berhasil */}
      <BerhasilSimpanQr 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}

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
  },
  headerTitle2: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subTitle: {
    fontSize: 13,
    color: 'gray',
  },
  qrContainer: {
    marginTop: 10,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  qrTemplate: {
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    paddingHorizontal: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});