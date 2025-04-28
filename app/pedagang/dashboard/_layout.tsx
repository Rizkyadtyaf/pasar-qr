import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, AccessibilityState, Alert  } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, ShoppingBag, QrCode, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/Color';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { Pedagang, Product } from '@/lib/types';
import { useSession } from '../_layout';

const TabArr = [
  { route: 'index', label: 'Beranda', icon: (color:string, size: number) => <Home size={size} color={color} strokeWidth={2} /> },
  { route: 'product', label: 'Produk', icon: (color:string, size: number) => <ShoppingBag size={size} color={color} strokeWidth={2} /> },
  { route: 'qrcode', label: 'QR Code', icon: (color:string, size: number) => <QrCode size={size} color={color} strokeWidth={2} /> },
  { route: 'pengaturan', label: 'Pengaturan', icon: (color:string, size: number) => <Settings size={size} color={color} strokeWidth={2} /> },
];

// Tambahkan interface untuk tipe TabItem
interface TabItem {
  route: string;
  label: string;
  icon: (color: string, size: number) => JSX.Element;
}

// Definisikan tipe untuk props dari Tabs.Screen
interface TabScreenProps {
  accessibilityState?: AccessibilityState;
  onPress?: (event?: any) => void;
  [key: string]: any;
}

const TabButton = (props: TabScreenProps & { item: TabItem }) => {
  const { item, accessibilityState } = props;
  const focused = accessibilityState?.selected || false;
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const textScale = useSharedValue(0);
  

  useEffect(() => {
    if (focused) {
      scale.value = withTiming(1.2, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      translateY.value = withTiming(-15, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      circleScale.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      textScale.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    } else {
      scale.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      circleScale.value = withTiming(0, { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      textScale.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    }
  }, [focused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: circleScale.value
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: textScale.value }],
      opacity: textScale.value
    };
  });

  return (
    <TouchableOpacity
      onPress={props.onPress || (() => {})}
      activeOpacity={1}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.container, animatedIconStyle]}>
        <View style={styles.btn}>
          <Animated.View style={[styles.circle, animatedCircleStyle]} />
          {item.icon(focused ? '#FFFFFF' : Colors.primary, 24)}
        </View>
        <Animated.Text style={[styles.text, animatedTextStyle]}>
          {item.label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Auth session context untuk digunakan pada anak komponen
const dataContext = createContext<{ products : Product[] | null, setProducts: Dispatch<SetStateAction<Product[] | null>>, pedagang: Pedagang | null, setPedagang: Dispatch<any>} | null>(null);

export const useData = () => useContext(dataContext);

export default function DashboardLayout() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pedagang, setPedagang] = useState<Pedagang | null>(null);

  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    // Ambil data pedagang saat komponen pertama kali dimuat
    fetchUser();

    // Ambil data produk saat komponen pertama kali dimuat
    fetchProducts();
  }, []);

  // Fungsi untuk mengambil data produk dari database
  const fetchProducts = async () => {
    // Cek session
    if (!session) {
      console.error('Session tidak tersedia. Pengguna harus login.');
      return;
    }

    // Ambil id pedagang
    const pedagang_id = session.user.id;

    // Ambil data produk dari database
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('pedagang_id', pedagang_id);

    if (error) {
      console.error('Gagal mengambil data produk:', error.message);
      Alert.alert('Gagal mengambil data produk:', error.message);
    } else {
      setProducts(data);
    }
  };

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
    } else {
      setPedagang(data);
    }
  };
  
  return (
    <dataContext.Provider value={{products, setProducts, pedagang, setPedagang}}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        {TabArr.map((item) => (
          <Tabs.Screen
            key={item.route}
            name={item.route}
            options={{
              tabBarButton: (props) => <TabButton {...props} item={item} />
            }}
          />
        ))}
      </Tabs>
    </dataContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    height: 70,
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderTopWidth: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4
  }
});