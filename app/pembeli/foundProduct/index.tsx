import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Color";
import { ArrowLeft, ShoppingCart, Info, Package, Download } from "lucide-react-native";
import TemplateDownloadProdukQR, { TemplateDownloadProdukQRRef } from "../../../components/TemplateDownloadProdukQR";
import BerhasilSimpanQr from "../../../components/pedagang/BerhasilSimpanQr";

export default function PembeliIndex() {
  const [product, setProduct] = useState<any | null | 'Tidak Ditemukan'>(null);
  const { id } = useLocalSearchParams();  
  const [loading, setLoading] = useState(true);
  const [showQRSection, setShowQRSection] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const templateQrRef = useRef<TemplateDownloadProdukQRRef>(null);

  // Mengambil data produk berdasarkan id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("produk")
          .select(`
            *,
            pedagang:pedagang_id (
              *
            )
          `)
          .eq("id", id)
          .single();
        
        if (error) {
          console.log(error)
          setProduct('Tidak Ditemukan');
          return;
        } 
        
        if (data) {
          setProduct(data);
          const { error } = await supabase
            .from("produk")
            .update({ qr_scan_count : data.qr_scan_count + 1 })
            .eq("id", id)
        
          if (error) {
            console.error("Error updating scan QR counter:", error);
          } else {
            console.log("Scan QR count updated successfully.");
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct('Tidak Ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fungsi untuk membuka WhatsApp dengan pesan yang telah disiapkan
  const openWhatsApp = async () => {
    // phoneNumberTest untuk testing
    const phoneNumberTest = '6285279128213'; 
    const phoneNumber = product?.pedagang?.nomor_whatsapp

    const message = `Halo, saya tertarik dengan produk ini!, apakah produk: ${product?.nama_produk} ini masih tersedia?`;

    // ganti dengan phoneNumberTest jika ingin testing
    // const url = `https://wa.me/${phoneNumberTest}?text=${message}`;
    const url = `https://wa.me/${phoneNumber}?text=${message}`;

  
    const supported = await Linking.canOpenURL(url);
  
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'WhatsApp tidak tersedia di perangkat ini.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Fungsi untuk mendownload QR code
  const handleDownloadQR = async () => {
    if (!product) {
      Alert.alert('Error', 'Data produk tidak ditemukan!');
      return;
    }

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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data produk...</Text>
      </SafeAreaView>
    );
  }

  if (product === 'Tidak Ditemukan') {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContent}>
          <Info size={64} color={Colors.primary} />
          <Text style={styles.notFoundText}>Produk tidak ditemukan</Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={handleBack}>
            <Text style={styles.backHomeButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Gambar Produk */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product?.foto_produk_url || 'https://placehold.co/400x300/gray/white?text=Foto+Produk' }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Informasi Produk */}
        <View style={styles.productInfoContainer}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product?.nama_produk}</Text>
            <Text style={styles.productPrice}>{formatPrice(product?.harga || 0)}</Text>
          </View>

          <View style={styles.stockContainer}>
            <View style={[
              styles.stockBadge,
              typeof product === 'object' && product !== null && product.stok > 10 ? styles.stockHigh : 
              typeof product === 'object' && product !== null && product.stok > 0 ? styles.stockMedium : 
              styles.stockLow
            ]}>
              <Text style={styles.stockText}>
                Stok: {typeof product === 'object' && product !== null ? product.stok : 0} {typeof product === 'object' && product !== null ? product.stok_satuan || 'pcs' : 'pcs'}
              </Text>
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Deskripsi</Text>
            </View>
            <Text style={styles.description}>
              {product?.deskripsi || 'Tidak ada deskripsi untuk produk ini'}
            </Text>
          </View>

          {/* Detail Tambahan */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Detail Produk</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nama Toko:</Text>
              <Text style={styles.detailValue}>Toko Sample</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ID Produk:</Text>
              <Text style={styles.detailValue}>{product?.id}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ID Pedagang:</Text>
              <Text style={styles.detailValue}>{product?.pedagang_id}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Terakhir Diperbarui:</Text>
              <Text style={styles.detailValue}>
                {product?.updated_at ? new Date(product?.updated_at).toLocaleDateString('id-ID') : 'Belum pernah diperbarui'}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.qrToggle}
              onPress={() => setShowQRSection(!showQRSection)}
            >
              <Text style={styles.sectionTitle}>QR Code Produk</Text>
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
            
            {showQRSection && (
              <View style={styles.qrContainer}>
                <Text style={styles.qrDescription}>
                  Scan QR code ini untuk melihat produk ini lagi nanti atau bagikan ke teman.
                </Text>
                
                <TemplateDownloadProdukQR
                  ref={templateQrRef}
                  qrValue={`https://pasar-qr.vercel.app/pembeli/foundProduct?id=${product.id}`}
                  productName={product.nama_produk}
                  productPrice={product.harga}
                  containerStyle={styles.qrTemplate}
                />
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={handleDownloadQR}
                >
                  <Download size={20} color="#FFF" />
                  <Text style={styles.downloadButtonText}>Simpan QR Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Tombol Beli */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.buyButton} 
          onPress={openWhatsApp}
          activeOpacity={0.8}
        >
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.buyButtonText}>Order Sekarang</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Sukses Download QR */}
      <BerhasilSimpanQr
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.primary,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  notFoundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  backHomeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backHomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.secondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  stockContainer: {
    marginBottom: 16,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stockHigh: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  stockMedium: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
  },
  stockLow: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  stockText: {
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 150,
    fontSize: 15,
    color: '#777',
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  qrToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 10,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrTemplate: {
    marginVertical: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  downloadButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});