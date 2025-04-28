import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Color';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Phone, FileQuestion, Info, AlertCircle, ShieldCheck, Smartphone, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function BantuanScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [animations, setAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    StatusBar.setBackgroundColor(Colors.primary);
    StatusBar.setBarStyle('light-content');
    
    // Initialize animations for each FAQ item
    const initialAnimations = faqItems.map(() => new Animated.Value(0));
    setAnimations(initialAnimations);
  }, []);

  const toggleExpand = (index: number) => {
    // Close currently expanded item if it's not the one being clicked
    if (expandedIndex !== null && expandedIndex !== index) {
      Animated.timing(animations[expandedIndex], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    
    // Toggle the clicked item
    const newValue = expandedIndex === index ? null : index;
    setExpandedIndex(newValue);
    
    Animated.timing(animations[index], {
      toValue: newValue === index ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const faqItems = [
    {
      question: 'Apa itu Pasar QR?',
      answer: 'Pasar QR adalah aplikasi yang membantu pedagang pasar tradisional untuk menjual produk mereka secara digital dengan menggunakan QR code.',
      icon: <Info size={22} color={Colors.primary} />
    },
    {
      question: 'Bagaimana cara membuat QR code?',
      answer: 'Kamu bisa membuat QR code untuk toko atau produk kamu dengan mengakses menu QR Code di dashboard pedagang.',
      icon: <FileQuestion size={22} color={Colors.primary} />
    },
    {
      question: 'Bagaimana cara mengubah informasi toko?',
      answer: 'Kamu bisa mengubah informasi toko melalui halaman Profil yang bisa diakses dari menu Pengaturan.',
      icon: <AlertCircle size={22} color={Colors.primary} />
    },
    {
      question: 'Apakah aplikasi ini aman?',
      answer: 'Ya, kami menggunakan teknologi keamanan terkini untuk melindungi data dan transaksi kamu.',
      icon: <ShieldCheck size={22} color={Colors.primary} />
    },
    {
      question: 'Apakah aplikasi ini gratis?',
      answer: 'Ya, aplikasi Pasar QR dapat digunakan secara gratis oleh semua pedagang pasar tradisional.',
      icon: <Smartphone size={22} color={Colors.primary} />
    }
  ];

  const contactUs = [
    {
      method: 'Email',
      value: 'bantuan@pasarqr.id',
      icon: <Mail size={22} color={Colors.primary} />,
      action: () => Linking.openURL('mailto:bantuan@pasarqr.id')
    },
    {
      method: 'WhatsApp',
      value: '0812-3456-7890',
      icon: <MessageCircle size={22} color={Colors.primary} />,
      action: () => Linking.openURL('https://wa.me/6281234567890')
    },
    {
      method: 'Telepon',
      value: '021-1234-5678',
      icon: <Phone size={22} color={Colors.primary} />,
      action: () => Linking.openURL('tel:02112345678')
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <HelpCircle size={40} color={Colors.primary} />
          <Text style={styles.bannerTitle}>Pusat Bantuan</Text>
          <Text style={styles.bannerSubtitle}>
            Temukan jawaban untuk pertanyaan umum atau hubungi kami jika kamu butuh bantuan lebih lanjut.
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pertanyaan Umum</Text>
          
          {faqItems.map((item, index) => {
            // Calculate animated height for the answer
            const animatedHeight = animations[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 100], // Adjust based on content
              extrapolate: 'clamp',
            }) || new Animated.Value(0);
            
            return (
              <View key={index} style={styles.faqItemContainer}>
                <TouchableOpacity 
                  style={[
                    styles.faqItemHeader,
                    expandedIndex === index && styles.faqItemHeaderActive
                  ]} 
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqIconContainer}>
                    {item.icon}
                  </View>
                  <Text style={[
                    styles.faqQuestion,
                    expandedIndex === index && styles.faqQuestionActive
                  ]}>
                    {item.question}
                  </Text>
                  {expandedIndex === index ? 
                    <ChevronUp size={20} color={Colors.primary} /> : 
                    <ChevronDown size={20} color="#666" />
                  }
                </TouchableOpacity>
                
                <Animated.View 
                  style={[
                    styles.faqAnswerContainer,
                    { 
                      height: animatedHeight,
                      opacity: animations[index],
                      overflow: 'hidden'
                    }
                  ]}
                >
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </Animated.View>
              </View>
            );
          })}
        </View>

        {/* Contact Us Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          
          {contactUs.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.contactItem}
              onPress={item.action}
            >
              <View style={styles.contactIconContainer}>
                {item.icon}
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactMethod}>{item.method}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Pasar QR v1.0.0</Text>
          <Text style={styles.copyrightText}> 2025 Pasar QR. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bannerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  faqItemContainer: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  faqItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  faqItemHeaderActive: {
    backgroundColor: '#f0f4ff',
  },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  faqQuestionActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  faqAnswerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingVertical: 15,
    paddingLeft: 48, // Align with question text
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
    justifyContent: 'center',
  },
  contactMethod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactValue: {
    fontSize: 14,
    color: Colors.secondary,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});