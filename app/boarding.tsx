import React, { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingPage from '../components/onBoarding/Onboarding';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Selamat Datang di Pasar QR',
        description: 'Aplikasi untuk menghubungkan pedagang pasar dengan pembeli secara digital',
        image: require('../assets/images/onBoarding/onBoard1.png'),
    },
    {
        id: '2',
        title: 'Scan QR Code',
        description: 'Cukup scan QR code untuk melihat produk dan info pedagang',
        image: require('../assets/images/onBoarding/qr.jpg'),
    },
    {
        id: '3',
        title: 'Mulai Belanja',
        description: 'Hubungi pedagang langsung melalui WhatsApp untuk belanja',
        image: require('../assets/images/onBoarding/onBoard3.png'),
    },
];

export default function Boarding() {
    const [currentPage, setCurrentPage] = useState(0);
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentPage < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentPage + 1,
                animated: true,
            });
            setCurrentPage(currentPage + 1);
        } else {
            // Selesai onboarding, kembali ke halaman utama
            router.push('/');
        }
    };

    const handleSkip = () => {
        // Skip langsung ke halaman utama
        router.push('/');
    };

    const handleBack = () => {
        if (currentPage > 0) {
            flatListRef.current?.scrollToIndex({
                index: currentPage - 1,
                animated: true,
            });
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#4050B5' barStyle="dark-content" />
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={({ item }) => (
                    <OnboardingPage
                        title={item.title}
                        description={item.description}
                        image={item.image}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(event) => {
                    const newPage = Math.round(
                        event.nativeEvent.contentOffset.x / width
                    );
                    setCurrentPage(newPage);
                }}
            />

            {/* Indicator bulat-bulat */}
            <View style={styles.indicatorContainer}>
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentPage ? styles.activeIndicator : null,
                        ]}
                    />
                ))}
            </View>

            {/* Tombol Skip & Next */}
            <View style={styles.buttonContainer}>
                {currentPage === 0 ? (
                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipButton}>Skip</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleBack}>
                        <Text style={styles.backButton}>Back</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <View style={styles.nextButtonContent}>
                        <Text style={styles.nextButtonText}>
                            {currentPage === onboardingData.length - 1 ? 'Mulai Belanja' : 'Next'}
                        </Text>
                        <ChevronRight size={20} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 80,
    },
    indicator: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
        marginHorizontal: 5,
    },
    activeIndicator: {
        backgroundColor: '#4050B5',
        width: 20,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 30,
    },
    skipButton: {
        fontSize: 16,
        color: '#666',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    backButton: {
        fontSize: 16,
        color: '#666',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    nextButton: {
        backgroundColor: '#4050B5',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    nextButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});