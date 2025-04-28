import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, RefreshCcw, Mail } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BerhasilVerifikasiOtp from '../../../components/pedagang/BerhasilVerifikasiOtp';

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Refs untuk TextInput
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Timer untuk countdown
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Fungsi untuk handle input OTP
  const handleOtpChange = (value: string, index: number) => {
    // Reset error message saat user mulai ketik
    if (errorMessage) {
      setErrorMessage('');
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus ke input berikutnya
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto trigger verifikasi jika digit terakhir diisi
    if (value && index === 5) {
      // Tunggu sebentar untuk memastikan state sudah terupdate
      setTimeout(() => {
        // Cek apakah semua digit sudah diisi dengan benar
        const completeOtp = [...newOtp];
        const isComplete = completeOtp.every(digit => digit !== '');
        
        if (isComplete) {
          verifyOtp(completeOtp.join(''));
        }
      }, 100);
    }
  };

  // Fungsi untuk handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Fungsi untuk verifikasi OTP
  const verifyOtp = async (manualOtp?: string) => {
    const inputOtpCode = manualOtp || otp.join('');
    
    if (inputOtpCode.length !== 6) {
      setErrorMessage('Silakan masukkan kode OTP 6 digit');
      return;
    }
    
    // Jika sudah loading, jangan proses lagi
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Verifikasi OTP menggunakan Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: inputOtpCode,
        type: 'signup'
      });
      
      if (error) {
        throw error;
      }
      
      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Kode OTP tidak valid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk navigasi ke halaman login setelah sukses
  const handleLanjutkan = () => {
    setShowSuccessModal(false);
    router.replace('/pedagang/auth/login');
  };

  // Fungsi untuk kirim ulang OTP
  const resendOtp = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    
    try {
      // Kirim ulang OTP menggunakan Supabase
      const { data, error } = await supabase.auth.resend({
        email: email as string,
        type: 'signup'
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert(
        'OTP Terkirim',
        `Kami telah mengirimkan kode OTP baru ke email ${email}. Silakan cek inbox atau folder spam kamu.`
      );
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Mail size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Verifikasi Email</Text>
        <Text style={styles.subtitle}>
          Kami telah mengirimkan kode OTP ke email{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
        
        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={[
                styles.otpInput, 
                errorMessage ? styles.otpInputError : {}
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        
        {/* Error Message */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        
        {/* Verify Button */}
        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={() => verifyOtp()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <CheckCircle size={20} color="#FFF" />
              <Text style={styles.verifyButtonText}>Verifikasi</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {canResend ? 'Belum menerima kode?' : `Kirim ulang dalam ${countdown}s`}
          </Text>
          {canResend ? (
            <TouchableOpacity 
              onPress={resendOtp}
              disabled={resendLoading}
              style={styles.resendButton}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <RefreshCcw size={16} color={Colors.primary} />
                  <Text style={styles.resendButtonText}>Kirim Ulang</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
      
      {/* Modal Sukses Verifikasi */}
      <BerhasilVerifikasiOtp
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onLanjutkan={handleLanjutkan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  emailText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#F9F9F9',
  },
  otpInputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    padding: 5,
  },
  resendButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});