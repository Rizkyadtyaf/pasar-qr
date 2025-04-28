import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, CameraOff, FlipHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function PembeliIndex() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  const toggleCameraFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
    // Matikan flash saat beralih ke kamera depan
    if (facing === 'back') {
      setFlashEnabled(false);
    }
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashEnabled(prev => !prev);
  };

  const handleBarCodeScanned = ({ data }: { data : string }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Coba parse sebagai JSON
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'pedagang') {
        router.replace({
          pathname: './pembeli/foundPedagang',
          params: { id: parsedData.id },
        });
      } else {
        router.replace({
          pathname: './pembeli/foundProduct',
          params: { id: parsedData.id },
        });
      }
    } catch (error) {
      // Jika bukan JSON, coba handle sebagai URL atau format lain
      console.log('QR code data:', data);
      
      try {
        let id = null;
        let isPedagang = false;
        
        // Cek apakah ini URL dengan format yang kita kenal
        if (data.includes('/pedagang/')) {
          isPedagang = true;
          
          // Format URL: https://pasar-qr.vercel.app/pedagang/{id}
          const matches = data.match(/\/pedagang\/([^\/\?]+)/);
          if (matches && matches[1]) {
            id = matches[1];
          }
        } else if (data.includes('/produk/')) {
          // Format URL: https://pasar-qr.vercel.app/produk/{id}
          const matches = data.match(/\/produk\/([^\/\?]+)/);
          if (matches && matches[1]) {
            id = matches[1];
          }
        }
        
        // Jika tidak ditemukan dengan format path, coba cari parameter id=
        if (!id) {
          const idMatch = data.match(/[?&]id=([^&]+)/);
          if (idMatch && idMatch[1]) {
            id = idMatch[1];
            
            // Tentukan tipe berdasarkan URL
            isPedagang = data.includes('foundPedagang') || data.includes('pedagang');
          }
        }
        
        if (id) {
          if (isPedagang) {
            router.replace({
              pathname: './pembeli/foundPedagang',
              params: { id },
            });
          } else {
            router.replace({
              pathname: './pembeli/foundProduct',
              params: { id },
            });
          }
          return;
        }
        
        // Jika tidak ada ID yang ditemukan, tampilkan error
        throw new Error('ID tidak ditemukan dalam QR code');
      } catch (urlError) {
        console.error('Error parsing QR code URL:', urlError);
        Alert.alert(
          'Format QR Code Tidak Valid',
          'QR code yang dipindai tidak valid atau tidak didukung.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4050B5" />
        <Text style={styles.permissionText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CameraOff size={64} color="#ff6b6b" />
        <Text style={styles.permissionText}>Akses kamera ditolak</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => requestPermission()}
        >
          <Text style={styles.backButtonText}>Minta Izin</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.backButton, {marginTop: 10}]} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing as CameraType}
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => router.back()}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Scan QR code</Text>
          </View>
          
          <View style={styles.scannerContainer}>
            <View style={styles.scanner}>
              <View style={styles.scannerCorner} />
              <View style={[styles.scannerCorner, styles.topRight]} />
              <View style={[styles.scannerCorner, styles.bottomLeft]} />
              <View style={[styles.scannerCorner, styles.bottomRight]} />
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => {
                if (scanned) setScanned(false);
              }}
            >
              <Text style={styles.scanButtonText}>
                {scanned ? 'Scan Lagi' : 'Scan the Vendor/Product\'s QR code'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <FlipHorizontal size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, flashEnabled && styles.activeIconButton]} 
                onPress={toggleFlash}
              >
                <Zap size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  scannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanner: {
    width: 250,
    height: 250,
    borderRadius: 16,
    borderWidth: 0,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  topRight: {
    right: 0,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#4050B5',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  iconButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    marginHorizontal: 10,
  },
  activeIconButton: {
    backgroundColor: '#4050B5',
  },
  permissionText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4050B5',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
});