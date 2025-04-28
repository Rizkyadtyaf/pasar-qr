import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/Color';
import { supabase } from '@/lib/supabase';
import { useSession } from './_layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '@/lib/types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { imagekit } from '@/lib/imagekit';
//@ts-ignore
import CryptoJS from 'crypto-js';

export default function EditProdukScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const session = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk form input
  const [namaProduk, setNamaProduk] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [fotoProduk, setFotoProduk] = useState('https://placehold.co/400x200/gray/white?text=Foto+Produk');

// sadasdas

  useEffect(() => {
    // Mengatur StatusBar saat komponen dimount
    StatusBar.setBackgroundColor('#FFFFFF');
    StatusBar.setBarStyle('dark-content');

    fetchProduct();
  }, [id]);

  // Mengisi form dengan data produk yang akan diedit
  useEffect(() => {
    if (product) {
      setNamaProduk(product.nama_produk);
      setDeskripsi(product.deskripsi || '');
      setHarga(product.harga.toString());
      setStok(product.stok.toString());
      setUnit(product.stok_satuan || 'pcs');
      setFotoProduk(product.foto_produk_url || 'https://placehold.co/400x200/gray/white?text=Foto+Produk');
    }
  }, [product]);

  // Ambil data produk dari database berdasarkan ID
  const fetchProduct = async () => {
    if (!id) {
      Alert.alert('Error', 'ID Produk tidak ditemukan');
      router.back();
      return;
    }

    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      router.replace('/');
      return;
    }

    setLoading(true);

    // Ambil data produk dari database
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('id', id)
      .eq('pedagang_id', session.user.id)
      .single();

    setLoading(false);

    if (error) {
      console.error('Gagal mengambil data produk:', error.message);
      Alert.alert('Error', 'Gagal mengambil data produk: ' + error.message);
      router.back();
      return;
    }

    if (!data) {
      Alert.alert('Error', 'Produk tidak ditemukan');
      router.back();
      return;
    }

    setProduct(data as Product);
  };

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
    Alert.alert(
      'Pilih Foto Produk',
      'Pilih sumber foto',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ambil Foto', onPress: takePhoto },
        { text: 'Pilih dari Galeri', onPress: pickImage },
      ]
    );
  };

  // Fungsi untuk menyimpan perubahan produk
  const handleSaveProduct = async () => {
    // Validasi input
    if (!namaProduk || !harga || !stok) {
      Alert.alert('Error', 'Nama produk, harga, dan stok harus diisi!');
      return;
    }

    if(isNaN(parseFloat(harga)) || isNaN(parseInt(stok))) {
      Alert.alert('Error', 'Harga dan Stok harus berupa angka!');
      return;
    }

    if (!product) {
      Alert.alert('Error', 'Data produk tidak ditemukan');
      return;
    }

    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      return;
    }

    setSaving(true);

    // Upload gambar jika gambar telah diubah
    let uploadedImageUrl = fotoProduk;
    if (fotoProduk !== product.foto_produk_url && !fotoProduk.startsWith('https://imagekit')) {
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
        // Perbaikan parameter expire - pastikan kurang dari 1 jam ke depan
        const expire = Math.floor(Date.now() / 1000) + 3600; // 1 jam = 3600 detik
        const token = Date.now().toString(); 
        const signature = CryptoJS.HmacSHA1(`${token}${expire}`, privateKey).toString(CryptoJS.enc.Hex);

        // Upload to ImageKit
        const result = await new Promise((resolve, reject) => {
          imagekit.upload(
            {
              file: base64,
              fileName: `${Date.now()}.jpg`,
              useUniqueFileName: true,
              folder: '/produk',
              token,
              signature,
              expire,
            },
            (err : any, result: any) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
    
        // @ts-ignore
        uploadedImageUrl = result.url;
      } catch (error) {
        console.error('Gagal mengupload gambar:', error);
        Alert.alert('Error', 'Gagal mengupload gambar. Silakan coba lagi.');
        setSaving(false);
        return;
      }
    }

    // Buat objek produk yang diupdate
    const updatedProduct = {
      nama_produk: namaProduk,
      deskripsi: deskripsi,
      harga: parseFloat(harga),
      stok: parseInt(stok),
      stok_satuan: unit,
      foto_produk_url: uploadedImageUrl,
      updated_at: new Date().toISOString()
    };

    // Update produk di database
    const { error } = await supabase
      .from('produk')
      .update(updatedProduct)
      .eq('id', product.id);

    setSaving(false);

    if (error) {
      console.error('Gagal mengupdate produk:', error.message);
      Alert.alert('Error', 'Gagal mengupdate produk: ' + error.message);
      return;
    }

    Alert.alert('Sukses', 'Produk berhasil diupdate');
    
    // Kembali ke halaman produk
    router.replace('./dashboard/product');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data produk...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      
      {/* Header dengan tombol back */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Produk</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Gambar produk */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: fotoProduk }} 
            style={styles.productImage} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleImageSelection}
          >
            <MaterialIcons name="add-a-photo" size={20} color="#fff" />
            <Text style={styles.changePhotoText}>Ganti Foto</Text>
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
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveProduct}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <MaterialIcons name="cancel" size={20} color="#fff" />
            <Text style={styles.buttonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    marginTop:-5,
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtons: {
    padding: 15,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
});