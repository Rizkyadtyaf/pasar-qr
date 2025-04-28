import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Alert, TextInput, FlatList, Keyboard } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Color";
import { ArrowLeft, ShoppingCart, Info, Package, MapPin, Phone, User, Search, MessageCircle, ExternalLink, Store } from "lucide-react-native";
import { Pedagang } from "@/lib/types";

export default function PembeliIndex() {
  const [pedagang, setPedagang] = useState<any | null | "Tidak Ditemukan">(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const { id } = useLocalSearchParams();  

  // Mengambil data pedagang berdasarkan id
  useEffect(() => {
    const fetchPedagang = async () => {
      try {
        const { data, error } = await supabase
          .from("pedagang")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          setPedagang('Tidak Ditemukan');
          return;
        } 
        
        if (data) {
          setPedagang(data);
          const { error } = await supabase
            .from("pedagang")
            .update({ pengunjung_count : data.pengunjung_count + 1 })
            .eq("id", id)
        
          if (error) {
            console.error("Error updating scan QR counter:", error);
          } else {
            console.log("Scan QR counter updated successfully.");
          }
        }
      } catch (error) {
        console.error("Error fetching pedagang:", error);
        setPedagang('Tidak Ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchPedagang();
  }, [id]);

  // Mengambil produk dari pedagang
  useEffect(() => {
    const fetchProducts = async () => {
      if (pedagang === null || pedagang === 'Tidak Ditemukan') return;
      
      try {
        setProductsLoading(true);
        const { data, error } = await supabase
          .from("produk")
          .select("*")
          .eq("pedagang_id", id);
        
        if (error) {
          console.error("Error fetching products:", error);
          return;
        }
        
        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [pedagang, id]);

  // Filter produk berdasarkan pencarian
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleBack = () => {
    router.back();
  };

  // Fungsi untuk membuka WhatsApp dengan nomor pedagang
  // dan pesan yang telah ditentukan
  const openWhatsApp = async () => {
    // phoneNumberTest untuk testing
    const phoneNumberTest = '623840239812'; 
    const phoneNumber = pedagang?.nomor_whatsapp

    const message = `Halo, saya tertarik dengan toko ini, ${pedagang?.nama_toko}.`;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const navigateToProductDetail = (productId: string) => {
    router.push(`/pembeli/foundProduct?id=${productId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data pedagang...</Text>
      </SafeAreaView>
    );
  }

  if (pedagang === 'Tidak Ditemukan') {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pedagang</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContent}>
          <Info size={64} color={Colors.primary} />
          <Text style={styles.notFoundText}>Pedagang tidak ditemukan</Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={handleBack}>
            <Text style={styles.backHomeButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header dengan tombol back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pedagang</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner/Cover Image dengan overlay pattern */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: pedagang?.avatar_url || 'https://placehold.co/400x200/gray/white?text=Foto+Profil' }} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.patternContainer}>
              {/* Pattern dengan ikon toko */}
              {[...Array(15)].map((_, index) => (
                <View key={index} style={[
                  styles.patternIcon, 
                  { 
                    top: Math.random() * 180, 
                    left: Math.random() * (width - 30),
                    opacity: 0.1 + Math.random() * 0.2,
                    transform: [{ rotate: `${Math.random() * 360}deg` }]
                  }
                ]}>
                  <Store size={20} color="#fff" />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.imageDarken} />
        </View>

        {/* Informasi Utama Pedagang */}
        <View style={styles.pedagangInfoContainer}>
          <View style={styles.pedagangHeader}>
            <Text style={styles.pedagangName}>{pedagang?.nama_toko || 'Nama Toko'}</Text>
            <Text style={styles.visitorText}>Pengunjung: {pedagang?.pengunjung_count || 0}</Text>
          </View>

          {/* Informasi Detail */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{pedagang?.nama_lengkap || 'Nama Pemilik tidak tersedia'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{pedagang?.lokasi_toko || 'Alamat tidak tersedia'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Phone size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{pedagang?.nomor_whatsapp || 'Nomor telepon tidak tersedia'}</Text>
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Tentang Toko</Text>
            <Text style={styles.descriptionText}>
              {pedagang?.deskripsi_toko || 'Tidak ada deskripsi tersedia untuk toko ini.'}
            </Text>
          </View>

          {/* Tombol Hubungi Pedagang */}
          {pedagang?.nomor_whatsapp && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={openWhatsApp}
              activeOpacity={0.8}
            >
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Hubungi Penjual</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Produk Pedagang */}
        <View style={styles.productsContainer}>
          <Text style={styles.productsTitle}>Produk Tersedia</Text>
          
          {/* Pencarian Produk */}
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari produk..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardType="default"
              returnKeyType="search"
              onSubmitEditing={() => {
                // Menutup keyboard saat user menekan tombol search/enter
                Keyboard.dismiss();
              }}
            />
          </View>

          {/* Daftar Produk */}
          {productsLoading ? (
            <View style={styles.loadingProductsContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingProductsText}>Memuat produk...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Info size={40} color={Colors.primary} />
              <Text style={styles.emptyProductsText}>
                {searchQuery.trim() !== "" 
                  ? "Produk tidak ditemukan" 
                  : "Belum ada produk tersedia"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Image 
                    source={{ uri: item.foto_produk_url || 'https://placehold.co/200x200/gray/white?text=Foto+Produk' }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.nama_produk}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.harga || 0)}</Text>
                    <View style={styles.productActions}>
                      <TouchableOpacity 
                        style={styles.detailButton}
                        onPress={() => navigateToProductDetail(item.id)}
                      >
                        <ExternalLink size={16} color={Colors.primary} />
                        <Text style={styles.detailButtonText}>Detail</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    height: 200,
    backgroundColor: Colors.secondary,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  patternContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  patternIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  imageDarken: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 0,
  },
  pedagangInfoContainer: {
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
  pedagangHeader: {
    marginBottom: 16,
  },
  pedagangName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  visitorText: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  descriptionSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contactButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  loadingProductsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingProductsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyProductsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProductsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(64, 80, 181, 0.1)',
  },
  detailButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
});