import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/Color';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Store } from 'lucide-react-native';

interface TemplateDownloadQRProps {
  qrValue: string;
  storeName: string;
  storeDescription?: string;
  containerStyle?: ViewStyle;
}

export interface TemplateDownloadQRRef {
  downloadQRCode: () => Promise<any>;
}

const TemplateDownloadQR = forwardRef<TemplateDownloadQRRef, TemplateDownloadQRProps>((props, ref) => {
  const { qrValue, storeName, storeDescription, containerStyle } = props;
  const qrRef = useRef<View>(null);

  const downloadQRCode = async () => {
    try {
      // Minta izin untuk menyimpan ke galeri
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('Izin untuk mengakses galeri ditolak');
        return null;
      }

      // Capture QR code sebagai gambar
      if (qrRef.current) {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1,
        });

        // Simpan ke galeri
        const asset = await MediaLibrary.createAssetAsync(uri);
        
        // Tidak perlu menghapus file temporary karena menyebabkan error
        // Sistem akan membersihkannya secara otomatis
        
        return asset;
      }
      return null;
    } catch (error) {
      console.error('Error saat menyimpan QR code:', error);
      return null;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    downloadQRCode
  }));

  return (
    <View ref={qrRef} style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Store size={32} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>PasarQR</Text>
      </View>
      
      {/* Store Info */}
      <View style={styles.storeInfoContainer}>
        <Text style={styles.storeName}>{storeName}</Text>
        {storeDescription && (
          <Text style={styles.storeDescription}>{storeDescription}</Text>
        )}
      </View>
      
      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrBackground}>
          <QRCode
            value={qrValue}
            size={200}
            color="#000"
            backgroundColor="white"
          />
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.scanText}>Scan untuk melihat toko</Text>
        <Text style={styles.poweredBy}>Powered by PasarQR</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  storeInfoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrBackground: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  footer: {
    alignItems: 'center',
  },
  scanText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  poweredBy: {
    fontSize: 12,
    color: '#888',
  },
});

TemplateDownloadQR.displayName = 'TemplateDownloadQR';

export { TemplateDownloadQR, type TemplateDownloadQRProps };
export default TemplateDownloadQR;