import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Color';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Product } from '@/lib/types'; 
import TemplateDownloadProdukQR, { TemplateDownloadProdukQRRef } from '../../../components/TemplateDownloadProdukQR';
import BerhasilSimpanQr from '../BerhasilSimpanQr';

interface DetailProdukProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onDelete: (product: Product) => void;
}

const DetailProduk: React.FC<DetailProdukProps> = ({ visible, product, onClose, onDelete }) => {
  if (!product) return null;
  
  // Menggunakan router untuk navigasi
  const router = useRouter();
  
  // Ref untuk template QR code
  const templateQrRef = useRef<TemplateDownloadProdukQRRef>(null);
  
  // State untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Menghapus produk
  const handleDelete = async () => {  
    onDelete(product);

    // Close detail modal
    onClose();
  }

  // Fungsi untuk download QR code
  const handleDownloadQRCode = async () => {
    try {
      // Panggil fungsi download dari komponen TemplateDownloadProdukQR
      if (templateQrRef.current) {
        const asset = await templateQrRef.current.downloadQRCode();
        if (asset) {
          setShowSuccessModal(true);
        } else {
          Alert.alert('Error', 'Gagal menyimpan QR code!');
        }
      }
    } catch (error) {
      console.error('Error saat download QR code:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan QR code!');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header dengan tombol close */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Produk</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Gambar produk */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: product.foto_produk_url || 'https://placehold.co/400x200/gray/white?text=Foto+Produk' }} 
                style={styles.productImage} 
                resizeMode="cover"
              />
            </View>
            
            {/* Informasi utama produk */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.nama_produk}</Text>
              <Text style={styles.productPrice}>Rp {product.harga.toLocaleString('id-ID')}</Text>
              
              <View style={styles.stockInfo}>
                <View style={[
                  styles.stockBadge, 
                  product.stok > 10 ? styles.stockHigh : 
                  product.stok > 0 ? styles.stockMedium : 
                  styles.stockLow
                ]}>
                  <Text style={styles.stockText}>
                    Stok: {product.stok} {product.stok_satuan}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Deskripsi produk */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="description" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Deskripsi</Text>
              </View>
              <Text style={styles.description}>{product.deskripsi}</Text>
            </View>
            
            {/* Placeholder untuk fitur barcode */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="qr-code" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Barcode</Text>
              </View>
              <View style={styles.barcodePlaceholder}>
                <TemplateDownloadProdukQR
                  ref={templateQrRef}
                  qrValue={JSON.stringify({
                    id: product.id,
                    type: "produk"
                  })}
                  productName={product.nama_produk}
                  productPrice={product.harga}
                  containerStyle={styles.qrTemplate}
                />
                <TouchableOpacity 
                  style={styles.downloadButton} 
                  onPress={handleDownloadQRCode}
                >
                  <MaterialIcons name="file-download" size={24} color={Colors.primary} />
                  <Text style={styles.downloadText}>Simpan QR Code</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Tombol aksi */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  onClose(); // Tutup modal detail terlebih dahulu
                  router.push({
                    pathname: '/pedagang/editProduk',
                    params: { id: product.id }
                  });
                }}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit Produk</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <MaterialIcons name="delete" size={20} color="#fff" />
                <Text style={styles.buttonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* Modal Sukses Download QR */}
      <BerhasilSimpanQr
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(163, 84, 84, 0.2)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockHigh: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  stockMedium: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  stockLow: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  barcodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  qrTemplate: {
    marginVertical: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  downloadText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DetailProduk;