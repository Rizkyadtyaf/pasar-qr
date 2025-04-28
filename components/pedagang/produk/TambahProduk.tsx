import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Image, Alert, Dimensions, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Color';
import * as ImagePicker from 'expo-image-picker';
import { imagekit } from '@/lib/imagekit'
import Loading from '@/components/Loading';
import BerhasilTambahProduk from './BerhasilTambahProduk';

//@ts-ignore
import CryptoJS from 'crypto-js';


interface TambahProdukProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
}

const TambahProduk = ({ visible, onClose, onSave }: TambahProdukProps) => {
  const [namaProduk, setNamaProduk] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [fotoProduk, setFotoProduk] = useState('https://placehold.co/400x200/gray/white?text=Foto+Produk');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fungsi untuk membuka galeri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
  
    if (!result.canceled) {
      setFotoProduk(result.assets[0].uri);
    }
  };

  // Fungsi untuk mengambil foto dengan kamera
  const takePhoto = async () => {
    // Minta izin kamera terlebih dahulu
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Kamu perlu memberikan izin untuk mengakses kamera.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setFotoProduk(result.assets[0].uri);
    }
  };

  // Fungsi untuk menampilkan pilihan (galeri atau kamera)
  const handleImageSelection = () => {
    if (Platform.OS === 'ios') {
      // Gunakan ActionSheet di iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Batal', 'Ambil Foto', 'Pilih dari Galeri'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      // Untuk Android, gunakan Alert sebagai pengganti ActionSheet
      Alert.alert(
        'Pilih Foto Produk',
        'Pilih sumber foto',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ambil Foto', onPress: takePhoto },
          { text: 'Pilih dari Galeri', onPress: pickImage },
        ]
      );
    }
  };

  const handleSave = async () => {
    // Validasi input
    if (!namaProduk || !deskripsi || !harga || !stok) {
      Alert.alert('Error', 'Semua field harus diisi!');
      return;
    }

    if(isNaN(parseFloat(harga)) || isNaN(parseInt(stok))) {
      Alert.alert('Error', 'Harga dan Stok harus berupa angka!');
      return;
    }

    // Aktifkan loading
    setIsLoading(true);

    let uploadedImageUrl = fotoProduk;

    try {
      const response = await fetch(fotoProduk);
      const blob = await response.blob();
  
      const reader = new FileReader();
      reader.readAsDataURL(blob);
  
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
  
      const privateKey = process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY; 
      const expire = Math.floor(Date.now() / 1000) + 60 * 60; 
      const token = Date.now().toString(); 
      const signature = CryptoJS.HmacSHA1(`${token}${expire}`, privateKey).toString(CryptoJS.enc.Hex);

      // Step 3: Upload to ImageKit
      const result = await new Promise((resolve, reject) => {
        imagekit.upload(
          {
            file: base64,
            fileName: `${Date.now()}.jpg`,
            useUniqueFileName: true,
            folder: '/produk', // optional
            token,
            signature,
            expire, // 1 hour
          },
          (err : any, result: any) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
  
      // @ts-ignore
      uploadedImageUrl = result.url;
    } catch (err) {
      console.error('Image upload failed:', err);
      Alert.alert('Gagal upload gambar', 'Silakan coba lagi.');
      setIsLoading(false);
      return;
    }

    // Buat objek produk baru
    const newProduct = {
      name: namaProduk,
      description: deskripsi,
      price: parseFloat(harga),
      stock: parseInt(stok),
      unit: unit,
      image: uploadedImageUrl,
    };

    // Kirim ke parent component
    onSave(newProduct);
    
    // Nonaktifkan loading
    setIsLoading(false);
    
    // Tampilkan modal sukses
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    
    // Reset form
    resetForm();
    
    // Tutup modal
    onClose();
  };

  const resetForm = () => {
    setNamaProduk('');
    setDeskripsi('');
    setHarga('');
    setStok('');
    setUnit('pcs');
    setFotoProduk('https://placehold.co/400x200/gray/white?text=Foto+Produk');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header dengan tombol close */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tambah Produk Baru</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Gambar produk */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: fotoProduk }} 
                style={styles.productImage} 
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleImageSelection}>
                <MaterialIcons name="add-a-photo" size={20} color="#fff" />
                <Text style={styles.changePhotoText}>Pilih Foto</Text>
              </TouchableOpacity>
            </View>
            
            {/* Form input */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Produk</Text>
                <TextInput
                  style={styles.input}
                  value={namaProduk}
                  onChangeText={setNamaProduk}
                  placeholder="Masukkan nama produk"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Deskripsi</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                  placeholder="Masukkan deskripsi produk"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Harga (Rp)</Text>
                <TextInput
                  style={styles.input}
                  value={harga}
                  onChangeText={setHarga}
                  placeholder="Masukkan harga produk"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.label}>Stok</Text>
                  <TextInput
                    style={styles.input}
                    value={stok}
                    onChangeText={setStok}
                    placeholder="Jumlah stok"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, {flex: 1}]}>
                  <Text style={styles.label}>Satuan</Text>
                  <TextInput
                    style={styles.input}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="kg, pcs, dll"
                  />
                </View>
              </View>
            </View>
            
            {/* Tombol aksi */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onClose}
              >
                <MaterialIcons name="cancel" size={20} color="#fff" />
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* Loading modal */}
      <Loading visible={isLoading} message="Menyimpan produk..." />
      
      {/* Sukses modal */}
      <BerhasilTambahProduk 
        visible={showSuccess} 
        onClose={handleSuccessClose}
        productName={namaProduk}
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TambahProduk;