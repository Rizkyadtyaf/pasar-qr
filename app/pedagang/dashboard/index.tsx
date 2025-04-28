import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl } from 'react-native';
import Header from '@/components/pedagang/homePage/Header';
import Card from '@/components/pedagang/homePage/Card';
import CardSkeleton from '@/components/pedagang/homePage/CardSkeleton';
import BelumIsiNamaToko from '@/components/pedagang/homePage/BelumIsiNamaToko';
import { StatusBar } from 'react-native';
import { useData } from './_layout';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const dataContext = useData();
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Tampilkan modal jika nama toko belum diisi
    if (dataContext?.pedagang && dataContext.pedagang.nama_toko === null) {
      setShowModal(true);
    }
  }, [dataContext?.pedagang]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fungsi untuk refresh data
  const onRefresh = async () => {
    if (!dataContext) return;
    
    setRefreshing(true);
    setIsLoading(true);
    
    try {
      // Refresh data pedagang
      if (dataContext.pedagang) {
        const { data: pedagangData, error: pedagangError } = await supabase
          .from('pedagang')
          .select('*')
          .eq('id', dataContext.pedagang.id)
          .single();
        
        if (!pedagangError && pedagangData) {
          dataContext.setPedagang(pedagangData);
        }
      }
      
      // Refresh data produk
      if (dataContext.pedagang) {
        const { data: produkData, error: produkError } = await supabase
          .from('produk')
          .select('*')
          .eq('pedagang_id', dataContext.pedagang.id);
        
        if (!produkError && produkData) {
          dataContext.setProducts(produkData);
        }
      }
    } catch (error) {
      console.error('Error saat refresh data:', error);
    } finally {
      // Tambahkan delay 2 detik sebelum menghilangkan indikator refresh
      setTimeout(() => {
        setRefreshing(false);
        setIsLoading(false);
      }, 1000);
    }
  };

  if(dataContext === null || dataContext.pedagang === null || dataContext.products === null) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#4050B5" barStyle="light-content" />
        <Header />
        <ScrollView style={styles.content}>
          <CardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4050B5" barStyle="light-content" />
      <Header />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4050B5"]} // Warna spinner refresh sesuai dengan tema aplikasi
            tintColor="#4050B5"
            title="Menyegarkan data..."
            titleColor="#4050B5"
          />
        }
      >
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card products={dataContext?.products} pedagang={dataContext?.pedagang} />
        )}
      </ScrollView>

      {/* Modal notifikasi belum isi nama toko */}
      <BelumIsiNamaToko 
        visible={showModal}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  }
});