import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Color';
import { Store, PlusCircle, BarChart3 } from 'lucide-react-native';
import { useData } from '@/app/pedagang/dashboard/_layout';
import { router } from 'expo-router';
import FiturBelumTersedia from '@/components/FiturBelumTersedia';

const Header = () => {
    const dataContext = useData();
    const pedagang = dataContext?.pedagang;
    const [showModal, setShowModal] = useState(false);
    
    // Fungsi untuk navigasi ke halaman produk
    const handleAddProduct = () => {
        router.push('/pedagang/dashboard/product');
    };
    
    // Fungsi untuk menampilkan modal fitur belum tersedia
    const handleShowLaporan = () => {
        setShowModal(true);
    };
    
    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topSection}>
                    <View style={styles.leftSection}>
                        <Text style={styles.greeting}>
                            Selamat Datang, {pedagang?.nama_toko || 'Pedagang'}!
                        </Text>
                        <Text style={styles.subText}>Kelola toko Kamu dengan mudah</Text>
                    </View>
                    <View style={styles.rightSection}>
                        <View style={styles.iconContainer}>
                            <Store size={24} color="white" />
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
                        <PlusCircle size={20} color="white" />
                        <Text style={styles.buttonText}>Tambah Produk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleShowLaporan}>
                        <BarChart3 size={20} color="white" />
                        <Text style={styles.buttonText}>Lihat Laporan</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Modal fitur belum tersedia */}
            <FiturBelumTersedia 
                visible={showModal} 
                onClose={handleCloseModal} 
                fiturName="Fitur Laporan"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        margin: 0,
        marginHorizontal: 0,
        paddingBottom: 20,
        elevation: 5, // Buat shadow di Android
        shadowColor: '#000', // Shadow iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    container: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    leftSection: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    subText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    rightSection: {
        marginLeft: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: '48%',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '500',
    }
});

export default Header;