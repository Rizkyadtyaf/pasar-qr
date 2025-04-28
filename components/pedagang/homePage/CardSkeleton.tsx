import React from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { Colors } from '@/constants/Color';

// Komponen untuk skeleton item card (statistik)
const CardItemSkeleton = () => {
  return (
    <View style={[styles.card, styles.cardSkeleton]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSkeleton} />
        <View style={styles.iconSkeleton} />
      </View>
      <View style={styles.valueSkeleton} />
      <View style={styles.subtitleSkeleton} />
    </View>
  );
};

// Komponen untuk skeleton produk
const ProductCardSkeleton = () => {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCardContent}>
        <View style={styles.productImageSkeleton} />
        <View style={styles.productInfo}>
          <View style={styles.productNameSkeleton} />
          <View style={styles.productDescriptionSkeleton} />
          <View style={styles.productDescriptionSkeleton} />
          <View style={styles.productPriceSkeleton} />
          <View style={styles.stockBadgeSkeleton} />
        </View>
      </View>
      <View style={styles.detailButtonSkeleton} />
    </View>
  );
};

class CardSkeleton extends React.Component {
  animatedValue = new Animated.Value(0);

  componentDidMount() {
    this.startAnimation();
  }

  startAnimation = () => {
    Animated.loop(
      Animated.timing(this.animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      })
    ).start();
  };

  render() {
    const shimmerAnimation = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(211, 211, 211, 0.2)', 'rgba(211, 211, 211, 0.6)'],
    });

    return (
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          {[1, 2, 3, 4].map((item) => (
            <CardItemSkeleton key={item} />
          ))}
        </View>

        <View style={styles.newestProductsContainer}>
          <View style={styles.sectionTitleSkeleton} />
          
          <View style={styles.productList}>
            {[1, 2, 3, 4, 5].map((item) => (
              <ProductCardSkeleton key={item} />
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
        
        {/* Overlay animasi shimmer */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: shimmerAnimation,
              opacity: 0.3,
            },
          ]}
        />
      </View>
    );
  }
}

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
    height: 120,
  },
  cardSkeleton: {
    backgroundColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSkeleton: {
    width: '70%',
    height: 14,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d0d0d0',
  },
  valueSkeleton: {
    width: '40%',
    height: 24,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitleSkeleton: {
    width: '60%',
    height: 12,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  newestProductsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitleSkeleton: {
    width: '50%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  productList: {
    marginTop: 8,
  },
  productCard: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  productImageSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#d0d0d0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productNameSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    marginBottom: 8,
  },
  productDescriptionSkeleton: {
    width: '90%',
    height: 12,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    marginBottom: 6,
  },
  productPriceSkeleton: {
    width: '40%',
    height: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    marginBottom: 8,
  },
  stockBadgeSkeleton: {
    width: '50%',
    height: 20,
    backgroundColor: '#d0d0d0',
    borderRadius: 10,
  },
  detailButtonSkeleton: {
    height: 36,
    backgroundColor: '#d0d0d0',
  },
  bottomPadding: {
    height: 80,
  },
});

export default CardSkeleton;