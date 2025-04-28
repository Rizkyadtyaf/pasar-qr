import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react-native';

export default function PedagangIndex() {
  const router = useRouter();

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/')}
        >
          <ArrowLeft size={24} color="#4050B5" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/pedagang/logo-pedagang.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Halaman Pedagang</Text>
        <Text style={styles.subtitle}>Silahkan login atau register untuk melanjutkan</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/pedagang/auth/login')}
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={() => router.push('/pedagang/auth/register')}
          >
            <UserPlus size={20} color="black" />
            <Text style={styles.buttonTextRegist}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
    borderRadius: 75,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4050B5',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#4050B5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#4050B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4050B5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonTextRegist: {
    color: 'black',
    fontSize: 16,
    marginLeft: 10,
  },
});