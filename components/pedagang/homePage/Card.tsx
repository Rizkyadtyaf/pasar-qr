import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Package, QrCode, Users, ShoppingCart, Info } from 'lucide-react-native';
import { Colors } from '@/constants/Color';
import { Product } from '@/lib/types';
import DetailProduk from '@/components/pedagang/produk/DetailProduk';
import { useRouter } from 'expo-router';

interface CardItemProps {
    title: string;
    value: number;
    subtitle: string;
    type: 'product' | 'qr' | 'visitor' | 'order';
}

const CardItem = ({ title, value, subtitle, type }: CardItemProps) => {
    const getCardColor = () => {
        switch (type) {
            case 'product':
                return styles.blueCard;
            case 'qr':
                return styles.purpleCard;
            case 'visitor':
                return styles.orangeCard;
            case 'order':
                return styles.greenCard;
            default:
                return styles.blueCard;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'product':
                return <Package size={24} color="#4A6CF7" />;
            case 'qr':
                return <QrCode size={24} color="#A66FF0" />;
            case 'visitor':
                return <Users size={24} color="#FFA500" />;
            case 'order':
                return <ShoppingCart size={24} color="#3CD856" />;
            default:
                return <Package size={24} color="#4A6CF7" />;
        }
    };

    return (
        <View style={[styles.card, getCardColor()]}>
            <View style={styles.cardHeader}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.iconContainer}>
                    {getIcon()}
                </View>
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const Card = ({ products, pedagang } : { products : Product[] | null | undefined, pedagang : any }) => {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const productCount = products ? products.length : 0;
    let qrCount = 0;
    if (products) {
        qrCount = products.reduce((acc, product) => { 
            return product.qr_scan_count !== null ? acc + product.qr_scan_count : acc
        }, 0);
    }
    const visitorCount = pedagang ? pedagang.pengunjung_count + qrCount : 0 ; 
    const orderCount = 0;

    const cardData = [
        { title: "Total Produk", value: productCount, subtitle: "+2 hari ini", type: "product" as const },
        { title: "Scan QR", value: qrCount, subtitle: "+12 minggu ini", type: "qr" as const },
        { title: "Pengunjung", value: visitorCount, subtitle: "+7 hari ini", type: "visitor" as const },
        { title: "Pesanan", value: orderCount, subtitle: "+3 hari ini", type: "order" as const }
    ];

    // Lima produk terbaru
    let newestProducts: Product[] = [];
    if (products) {
        // Sort products by created_at in descending order and get the first 5
        newestProducts = products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    }

    const handleShowDetail = (product: Product) => {
        setSelectedProduct(product);
        setDetailModalVisible(true);
    };

    const handleCloseDetail = () => {
        setDetailModalVisible(false);
    };

    const handleDeleteProduct = (product: Product) => {
        // Implementasi delete product jika diperlukan
        console.log("Delete product:", product.id);
    };

    const formatPrice = (price: number) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    return (
        <ScrollView style={styles.mainContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {cardData.map((item, index) => (
                    <CardItem 
                        key={index}
                        title={item.title}
                        value={item.value}
                        subtitle={item.subtitle}
                        type={item.type}
                    />
                ))}
            </View>

            {/* Bagian Produk Terbaru */}
            <View style={styles.newestProductsContainer}>
                <Text style={styles.sectionTitle}>Produk Terbaru</Text>
                
                {newestProducts.length > 0 ? (
                    <View style={styles.productList}>
                        {newestProducts.map((product, index) => (
                            <View key={index} style={styles.productCard}>
                                <View style={styles.productCardContent}>
                                    <View style={styles.productImageContainer}>
                                        <Image 
                                            source={{ uri: product.foto_produk_url || 'https://placehold.co/400x200/gray/white?text=Foto+Produk' }} 
                                            style={styles.productImage} 
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={1}>{product.nama_produk}</Text>
                                        <Text style={styles.productDescription} numberOfLines={2}>{product.deskripsi || 'Tidak ada deskripsi'}</Text>
                                        <Text style={styles.productPrice}>{formatPrice(product.harga)}</Text>
                                        <View style={[
                                            styles.stockBadge, 
                                            product.stok > 10 ? styles.stockHigh : 
                                            product.stok > 0 ? styles.stockMedium : 
                                            styles.stockLow
                                        ]}>
                                            <Text style={styles.stockText}>
                                                Stok: {product.stok} {product.stok_satuan || 'pcs'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.detailButton}
                                    onPress={() => handleShowDetail(product)}
                                >
                                    <Info size={16} color="#fff" />
                                    <Text style={styles.detailButtonText}>Detail</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyProductContainer}>
                        <Text style={styles.emptyProductText}>Belum ada produk</Text>
                    </View>
                )}
            </View>

            {/* Padding tambahan di bagian bawah untuk memastikan konten terlihat semua */}
            <View style={styles.bottomPadding} />

            {/* Modal Detail Produk */}
            <DetailProduk 
                visible={detailModalVisible}
                product={selectedProduct}
                onClose={handleCloseDetail}
                onDelete={handleDeleteProduct}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        width: '48%',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(153, 15, 15, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    textContainer: {
        flex: 1,
    },
    blueCard: {
        backgroundColor: 'rgba(74, 108, 247, 0.1)',
    },
    purpleCard: {
        backgroundColor: 'rgba(166, 111, 240, 0.1)',
    },
    orangeCard: {
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
    },
    greenCard: {
        backgroundColor: 'rgba(60, 216, 86, 0.1)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        color: '#64748B',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
    },
    // Styles untuk bagian produk terbaru
    newestProductsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
    },
    productList: {
        width: '100%',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    productCardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    productImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    stockHigh: {
        backgroundColor: 'rgba(60, 216, 86, 0.2)',
    },
    stockMedium: {
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
    },
    stockLow: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
    },
    stockText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailButton: {
        backgroundColor: Colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    detailButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyProductContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
    },
    emptyProductText: {
        color: '#64748B',
        fontSize: 16,
    },
    bottomPadding: {
        height: 20,
    },
});

export default Card;