import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DetailProduk from '../../../components/pedagang/produk/DetailProduk';
import { Colors } from '../../../constants/Color';
import TambahProduk from '../../../components/pedagang/produk/TambahProduk';
import { useSession } from '../_layout';
import { supabase } from '@/lib/supabase';
import { useData } from './_layout';
import { Product } from '@/lib/types';

export default function ProductScreen() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [tambahModalVisible, setTambahModalVisible] = useState(false);
  // const [products, setProducts] = useState<Product[] | null>(null);
  const session = useSession();
  const productsContext = useData();

  useEffect(() => {
    // Mengatur StatusBar saat komponen dimount
    StatusBar.setBackgroundColor(Colors.primary);
    StatusBar.setBarStyle('light-content');

    fetchProducts();
  }, []);

  // // Ambil data produk dari database
  const fetchProducts = async () => {
    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      return;
    }

    // Ambil id pedagang
    const pedagang_id = session.user.id;

    // Ambil data produk dari database
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('pedagang_id', pedagang_id);

    if (error) {
      console.error('Gagal mengambil data produk:', error.message);
      Alert.alert('Gagal mengambil data produk:', error.message);
    } else {
      productsContext?.setProducts(data);
    }
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const closeProductDetail = () => {
    setDetailModalVisible(false);
  };

  const handleAddProduct = () => {
    setTambahModalVisible(true);
  };

  // Menambahkan produk baru
  const handleSaveProduct = async (newProduct : any) => {
    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      return;
    }

    // Ambil input dari newProduct
    const { name, description, price, stock, unit, image } = newProduct;

    // Ambil id pedagang
    const pedagang_id = session.user.id;
  
    // Insert produk baru ke database
    const insertedProduct = {
      pedagang_id,
      nama_produk : name,
      deskripsi : description,
      harga : price,
      stok : stock,
      stok_satuan: unit,
      foto_produk_url: image,
    }
    const { error } = await supabase
      .from('produk')
      .insert([
        insertedProduct
      ]);
  
    if (error) {
      console.error('Gagal menambahkan produk:', error.message);
      Alert.alert('Gagal menambahkan produk:', error.message);
      return;
    }
    console.log('Produk berhasil ditambahkan!');

    // Fetch ulang data produk setelah menambahkan produk baru
    const { data } = await supabase
      .from('produk')
      .select('*')
      .eq('pedagang_id', pedagang_id);

    productsContext?.setProducts(data);
  };

  const handleDeleteProduct = async (product: Product) => {
    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      return;
    }

    const { error } = await supabase
      .from('produk')
      .delete()
      .eq('id', product.id);

    if(error) {
      console.error('Gagal menghapus produk:', error.message);
      Alert.alert('Gagal menghapus produk:', error.message);
      return;
    }

    console.log('Produk berhasil dihapus:', product.nama_produk);
    Alert.alert('Sukses', `Produk ${product.nama_produk} berhasil dihapus`);

    // Fetch ulang data produk setelah menambahkan produk baru
    const { data } = await supabase
      .from('produk')
      .select('*')
      .eq('pedagang_id', session.user.id);

    productsContext?.setProducts(data);
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"
        translucent={true}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Produk</Text>
        <Text style={styles.subtitle}>Total: {productsContext?.products?.length} produk</Text>
      </View>

      {productsContext && productsContext.products && productsContext.products.length > 0 ? (
        <FlatList
          data={productsContext.products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => openProductDetail(item)}
            >
              <Image source={{ uri: item.foto_produk_url || 'https://placehold.co/400x200/gray/white?text=Foto+Produk' }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nama_produk}</Text>
                <Text style={styles.productPrice}>Rp {item.harga.toLocaleString('id-ID')}</Text>
                <View style={styles.stockContainer}>
                  <View style={[styles.stockBadge, item.stok > 10 ? styles.stockHigh : item.stok > 0 ? styles.stockMedium : styles.stockLow]}>
                    <Text style={styles.stockText}>Stok: {item.stok} {item.stok_satuan}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.detailButton} onPress={() => openProductDetail(item)}>
                <View style={styles.iconCircle}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inventory" size={80} color={Colors.secondary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>Belum ada Produk</Text>
          <Text style={styles.emptySubText}>Tambahkan produk pertamamu dengan menekan tombol + di bawah</Text>
        </View>
      )}

      {/* Tombol tambah produk */}
      <TouchableOpacity 
        style={styles.fabContainer} 
        onPress={handleAddProduct}
        activeOpacity={0.8}
      >
        <View style={styles.fab}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <DetailProduk
        visible={detailModalVisible}
        product={selectedProduct}
        onClose={closeProductDetail}
        onDelete={handleDeleteProduct}
      />

      <TambahProduk
        visible={tambahModalVisible}
        onClose={() => setTambahModalVisible(false)}
        onSave={handleSaveProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: StatusBar.currentHeight, 
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 70, // Tambahkan padding atas lebih besar
    paddingBottom: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: 'row',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  detailButton: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 25,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});