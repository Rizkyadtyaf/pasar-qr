import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Store,
    FileText,
    Phone,
    MapPin,
    Save,
    QrCode,
    Share2,
    Download
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Color';
import QRCode from 'react-native-qrcode-svg';
import { useSession } from './_layout';
import { Pedagang } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import TemplateDownloadQR, { TemplateDownloadQRRef } from '../../components/TemplateDownloadQR';
import BerhasilSimpanQr from '../../components/pedagang/BerhasilSimpanQr';
import { AlertBerhasilSimpan } from '../../components/pedagang/AlertBerhasilSimpan';

export default function ProfileScreen() {
    const router = useRouter();
    const session = useSession(); 
    const [pedagang, setPedagang] = useState<Pedagang | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAlertSimpan, setShowAlertSimpan] = useState(false);
    const templateQrRef = useRef<TemplateDownloadQRRef>(null);

    useEffect(() => {
        fetchUser();
    }, [])

    // Fungsi untuk mengambil data pedagang dari database
    const fetchUser = async () => {
        // Cek session
        if (!session) {
            console.error('Session tidak tersedia. Pengguna harus login.');
            return;
        }

        // Ambil id pedagang
        const pedagang_id = session.user.id;

        // Ambil data produk dari database
        const { data, error } = await supabase
            .from('pedagang')
            .select('*')
            .eq('id', pedagang_id)
            .single();

        if (error) {
            console.error('Gagal mengambil data pedagang:', error.message);
            Alert.alert('Gagal mengambil data pedagang:', error.message);
            router.replace('./auth/login');
        } else {
            setPedagang(data);
        }
    };

    const handleSaveChanges = async () => {
        // Simpan perubahan data pedagang ke database
        if (!pedagang) {
            Alert.alert('Error', 'Data pedagang tidak ditemukan!');
            return;
        }
        if (!pedagang.nama_toko || !pedagang.deskripsi_toko || !pedagang.nomor_whatsapp || !pedagang.lokasi_toko) {
            Alert.alert('Error', 'Semua field harus diisi!');
            return;
        }


        const { error } = await supabase
            .from('pedagang')
            .update({
                nama_toko: pedagang.nama_toko,
                deskripsi_toko: pedagang.deskripsi_toko,
                nomor_whatsapp: pedagang.nomor_whatsapp,
                lokasi_toko: pedagang.lokasi_toko,
            })
            .eq('id', pedagang.id);

        if (error) {
            console.error('Gagal menyimpan perubahan:', error.message);
            Alert.alert('Gagal menyimpan perubahan:', error.message);
        } else {
            setShowAlertSimpan(true);
        }
    }

    // Fungsi untuk mendownload QR code
    const handleDownloadQR = async () => {
        if (!pedagang) {
            Alert.alert('Error', 'Data pedagang tidak ditemukan!');
            return;
        }

        try {
            // Panggil fungsi download dari komponen TemplateDownloadQR
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

    if(pedagang === null) {
        return <Text>Loading...</Text>;
    }

    // Buat URL untuk QR code
    const qrValue = `https://pasar-qr.vercel.app/pedagang/${pedagang.id}`;

    return (
        <>
            <StatusBar
                backgroundColor={Colors.primary}
                barStyle="light-content"
                translucent={true}
            />
            <SafeAreaView style={styles.safeArea}>


                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profil Toko</Text>
                    <View style={styles.rightPlaceholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        style={styles.container}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {/* Card Profil */}
                        <View style={styles.profileCard}>
                            <View style={styles.iconHeader}>
                                <Store size={40} color={Colors.primary} />
                            </View>

                            <Text style={styles.sectionTitle}>Informasi Toko</Text>

                            {/* Form Fields */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <Store size={18} color={Colors.primary} />
                                    <Text style={styles.label}>Nama Toko</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: Warung Barokah, Toko Sejahtera"
                                    placeholderTextColor="#aaa"
                                    value={pedagang?.nama_toko || ''}
                                    onChangeText={(text) => setPedagang({ ...pedagang, nama_toko: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <FileText size={18} color={Colors.primary} />
                                    <Text style={styles.label}>Deskripsi Toko</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Jelaskan tentang toko kamu (produk yang dijual, keunggulan, dll)"
                                    placeholderTextColor="#aaa"
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={pedagang?.deskripsi_toko || ''}
                                    onChangeText={(text) => setPedagang({ ...pedagang, deskripsi_toko: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <Phone size={18} color={Colors.primary} />
                                    <Text style={styles.label}>Nomor WhatsApp</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Format: 08xxxxxxxxxx (tanpa +62 atau spasi)"
                                    placeholderTextColor="#aaa"
                                    keyboardType="phone-pad"
                                    value={pedagang?.nomor_whatsapp || ''}
                                    onChangeText={(text) => setPedagang({ ...pedagang, nomor_whatsapp: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MapPin size={18} color={Colors.primary} />
                                    <Text style={styles.label}>Lokasi Toko</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: Blok A No.10, Pasar Minggu, Jakarta Selatan"
                                    placeholderTextColor="#aaa"
                                    value={pedagang?.lokasi_toko || ''}
                                    onChangeText={(text) => setPedagang({ ...pedagang, lokasi_toko: text })}
                                />
                            </View>
                        </View>

                        {/* Card QR Code */}
                        <View style={styles.qrCard}>
                            <View style={styles.iconHeader}>
                                <QrCode size={40} color={Colors.primary} />
                            </View>

                            <Text style={styles.sectionTitle}>QR Code Toko</Text>
                            <Text style={styles.qrDescription}>
                                Bagikan QR code ini agar pembeli dapat dengan mudah menemukan toko kamu.
                            </Text>

                            {/* QR Code Template */}
                            <View style={styles.qrTemplateContainer}>
                                <TemplateDownloadQR
                                    ref={templateQrRef}
                                    qrValue={qrValue}
                                    storeName={pedagang.nama_toko || 'Toko Saya'}
                                    storeDescription={pedagang.deskripsi_toko || undefined}
                                    containerStyle={styles.qrTemplate}
                                />
                            </View>

                            {/* QR Actions */}
                            <View style={styles.qrActions}>
                                <TouchableOpacity
                                    style={[styles.qrButton, styles.downloadButton]}
                                    onPress={handleDownloadQR}
                                >
                                    <Download size={20} color="#FFF" />
                                    <Text style={styles.qrButtonText}>Simpan QR Code</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.qrButton, styles.shareButton]}
                                >
                                    <Share2 size={20} color="#FFF" />
                                    <Text style={styles.qrButtonText}>Bagikan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tombol Simpan */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                            <Save size={20} color="#FFF" />
                            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Modal Sukses Download QR */}
            <BerhasilSimpanQr 
                visible={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)} 
            />

            {/* Modal Berhasil Simpan Perubahan */}
            <AlertBerhasilSimpan 
                visible={showAlertSimpan} 
                onClose={() => {
                    setShowAlertSimpan(false);
                    router.push('./dashboard');
                }} 
            />
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    rightPlaceholder: {
        width: 40,
    },
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    qrCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
        textAlign: 'center',
        marginLeft: 8,
    },
    qrDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    qrTemplateContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    qrTemplate: {
        marginVertical: 10,
    },
    qrActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    downloadButton: {
        backgroundColor: Colors.primary,
    },
    shareButton: {
        backgroundColor: Colors.secondary,
    },
    qrButtonText: {
        color: '#FFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    formGroup: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textArea: {
        height: 100,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});