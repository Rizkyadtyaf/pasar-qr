import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, AppState, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft, CheckSquare, Mail, Lock, LockKeyhole, LogIn } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Color';
import { SafeAreaView } from 'react-native-safe-area-context';
import KonfirmasiKodeOtp from '../../../components/pedagang/KonfirmasiKodeOtp';
import SignupGoogle from '../../../components/pedagang/SignupGoogle';
import EmailSudahTerdaftar from '../../../components/pedagang/EmailSudahTerdaftar';

export default function PedagangRegister() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showEmailTerdaftarModal, setShowEmailTerdaftarModal] = useState(false);

  const handleRegister = async () => {
    // Tidak melakukan register bila user tidak setuju dengan syarat dan ketentuan
    if(!isAgreed) {
      Alert.alert('Silakan setujui syarat dan ketentuan untuk melanjutkan pendaftaran.');
      return;
    }

    // Jika password tidak sama dengan konfirmasi password
    if (password !== konfirmasiPassword) {
      Alert.alert('Password tidak sama!');
      return;
    }

    // Aktifkan loading state
    setLoading(true);

    try {
      // Tambahkan delay kecil untuk memastikan loading terlihat
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Cek apakah email sudah terdaftar di auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy_password_for_check_only'
      });
      
      // Jika tidak ada error atau error bukan "Invalid login credentials", berarti email sudah terdaftar
      if (authError) {
        if (!authError.message.includes('Invalid login credentials')) {
          setLoading(false);
          setShowEmailTerdaftarModal(true);
          return;
        }
      } else {
        // Jika tidak ada error sama sekali, berarti email dan password valid (sangat kecil kemungkinannya)
        setLoading(false);
        setShowEmailTerdaftarModal(true);
        return;
      }
      
      // Cek apakah email sudah terdaftar di profiles
      const { data: userData } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      // Jika email sudah terdaftar di tabel profiles
      if (userData) {
        setLoading(false);
        setShowEmailTerdaftarModal(true);
        return;
      }
      
      // Sign up menggunakan email
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // Ini akan memastikan Supabase mengirim email verifikasi
          emailRedirectTo: undefined,
          data: {
            email_confirm_sent_at: new Date().toISOString()
          }
        }
      });

      if (error) {
        // Cek apakah error karena email sudah terdaftar
        if (error.message.includes('already registered') || 
            error.message.includes('email already')) {
          setLoading(false);
          setShowEmailTerdaftarModal(true);
          return;
        }
        
        Alert.alert('Error', error.message);
        return;
      }

      // Tampilkan modal konfirmasi OTP hanya jika tidak ada error dan email belum terdaftar
      setShowOtpModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      // Nonaktifkan loading state
      setLoading(false);
    }
  };

  // Fungsi untuk menangani tombol lanjutkan di modal OTP
  const handleLanjutkan = () => {
    setShowOtpModal(false);
    // Redirect ke halaman OTP dengan email sebagai parameter
    router.push({
      pathname: '/pedagang/auth/otp',
      params: { email: email }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daftar Akun</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formCard}>
            {/* Logo or Illustration */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>PasarQR</Text>
              </View>
              <Text style={styles.welcomeText}>Selamat Datang di PasarQR</Text>
              <Text style={styles.subtitleText}>Daftar untuk mulai berjualan</Text>
            </View>

            {/* Google Sign Up Option */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={() => setShowGoogleModal(true)}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau daftar dengan email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email and Password Fields */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <LockKeyhole size={20} color={Colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                value={konfirmasiPassword}
                onChangeText={setKonfirmasiPassword}
                secureTextEntry={!showKonfirmasiPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
              >
                {showKonfirmasiPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsAgreed(!isAgreed)}
              >
                {isAgreed ? (
                  <CheckSquare size={20} color={Colors.primary} />
                ) : (
                  <View style={styles.emptyCheckbox} />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Saya setuju dengan <Text style={styles.termsLink}>Syarat dan Ketentuan</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, !isAgreed && styles.signupButtonDisabled]}
              onPress={handleRegister}
              disabled={!isAgreed || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.signupButtonText}>Daftar</Text>
                  <LogIn size={20} color="#FFFFFF" style={{marginLeft: 8}} />
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.push('/pedagang/auth/login')}>
                <Text style={styles.loginLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Konfirmasi OTP */}
      <KonfirmasiKodeOtp
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        onLanjutkan={handleLanjutkan}
      />

      {/* Modal Google Signup */}
      <SignupGoogle
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />

      {/* Modal Email Sudah Terdaftar */}
      <EmailSudahTerdaftar
        visible={showEmailTerdaftarModal}
        onClose={() => setShowEmailTerdaftarModal(false)}
        email={email}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DB4437',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#9E9E9E',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    marginRight: 10,
  },
  emptyCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  signupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    backgroundColor: Colors.secondary,
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});