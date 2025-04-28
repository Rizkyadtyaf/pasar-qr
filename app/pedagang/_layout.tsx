import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, usePathname } from "expo-router";
import { View, AppState } from 'react-native';

// Auth session context untuk digunakan pada anak komponen
const SessionContext = createContext<Session | null>(null);

export const useSession = () => useContext(SessionContext);

export default function PedagangLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Menyiapkan auto refresh token dan mengatur session saat aplikasi aktif
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && pathname !== '/pedagang/dashboard') {
        router.replace('/pedagang/dashboard');
      } else if (!session && pathname !== '/pedagang') {
        router.replace('/pedagang');
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && pathname !== '/pedagang/dashboard') {
        router.replace('/pedagang/dashboard');
      } else if (!session && pathname !== '/pedagang') {
        router.replace('/pedagang');
      } else if (_event === 'SIGNED_OUT'){
        router.replace('/pedagang');
      }
    });

    return () => {
      subscription.remove()
      listener?.subscription.unsubscribe();
    }
  }, []);

  // Jika loading, tampilkan blank screen
  if (loading) {
    return (
      <View>
      </View>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      <Stack screenOptions={{ headerShown: false }} />
    </SessionContext.Provider>
  );}
