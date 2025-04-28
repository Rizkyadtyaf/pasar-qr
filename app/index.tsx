// app/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, Store, Info } from 'lucide-react-native';
import { useState } from 'react';
import Loading from '../components/Loading';
import { Colors } from '@/constants/Color';


export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = async (route: '/pembeli' | '/pedagang' | '/boarding') => {
    setIsLoading(true);

    // Tambah delay untuk memberikan waktu loading muncul
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('Navigasi ke:', route);
    router.push(route);

    // Tambah delay untuk memberikan waktu loading hilang
    await new Promise(resolve => setTimeout(resolve, 50));

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor='white' barStyle="dark-content" />
      <Loading visible={isLoading} message="Sedang memuat..." />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/images/welcomeScreen/logo-apps.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Pasar QR</Text>
          <Text style={styles.subtitle}>Belanja digital di pasar tradisional</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('/pembeli')}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <ShoppingCart size={28} color="white" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Pembeli</Text>
                <Text style={styles.buttonDescription}>Cari produk & pedagang</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('/pedagang')}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Store size={28} color="white" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Pedagang</Text>
                <Text style={styles.buttonDescription}>Daftarkan toko & produk</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={() => handleNavigate('/boarding')}
          disabled={isLoading}
        >
          <Info size={16} color="#4050B5" style={styles.infoIcon} />
          <Text style={styles.onboardingButtonText}>Lihat Panduan Penggunaan</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}> 2025 Pasar QR</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4050B5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#4050B5',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#4050B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  onboardingButton: {
    marginTop: 40,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    marginRight: 5,
  },
  onboardingButtonText: {
    color: '#4050B5',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  }
});