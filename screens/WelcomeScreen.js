import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Dimensions, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');
const IS_WEB = width > 600;

export default function WelcomeScreen({ navigation }) {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => { setUsername(''); setPassword(''); setShowPassword(false); };

  // ─── Login Pelanggan ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Lengkapi Data', 'Username dan password wajib diisi');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        Alert.alert('Login Gagal', 'Username atau password salah');
      } else {
        resetForm();
        setMode('welcome');
        navigation.navigate('CustomerHome', { customer: data });
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Registrasi Pelanggan ───────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!username.trim() || !password.trim())
      return Alert.alert('Lengkapi Data', 'Username dan password wajib diisi');
    if (password.length < 6)
      return Alert.alert('Password Lemah', 'Password minimal 6 karakter');

    setLoading(true);
try {
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('username', username.trim())
    .maybeSingle();

  if (existing) {
        Alert.alert('Username Dipakai', 'Coba gunakan username lain');
        setLoading(false);
        return;
      }

      const { error } = await supabase
  .from('customers')
  .insert([{ username: username.trim(), password }]);

if (error) throw error;

resetForm();
setMode('login');

} catch (e) {
  Alert.alert('Error', e.message);
} finally {
  setLoading(false);
}
};

  // ─── RENDER: Welcome ────────────────────────────────────────────────────────
  const renderWelcome = () => (
    <>
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvZmZlfGVufDB8fDB8fHww' }}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Sajati Kopi</Text>
      <Text style={styles.subtitle}>Selamat Datang ☕</Text>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.btnPrimary} onPress={() => setMode('login')}>
        <Text style={styles.btnPrimaryText}>☕  Saya Pelanggan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('LoginOwner')}>
        <Text style={styles.btnSecondaryText}>🔑  Pemilik Usaha</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Sajati Kopi © 2025</Text>
    </>
  );

  // ─── RENDER: Login ──────────────────────────────────────────────────────────
  const renderLogin = () => (
    <>
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvZmZlfGVufDB8fDB8fHww' }}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Masuk</Text>
      <Text style={styles.subtitle}>Login ke akun kamu ☕</Text>
      <View style={styles.divider} />

      {/* Username */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#C4A882"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#C4A882"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Login */}
      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Masuk</Text>}
      </TouchableOpacity>

      {/* Ke Registrasi */}
      <TouchableOpacity style={styles.btnSecondary} onPress={() => { resetForm(); setMode('register'); }}>
        <Text style={styles.btnSecondaryText}>📝  Daftar Akun Baru</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>atau</Text>
        <View style={styles.orLine} />
      </View>

      {/* Login Owner */}
      <TouchableOpacity style={styles.btnOwner} onPress={() => navigation.navigate('LoginOwner')}>
        <Text style={styles.btnOwnerText}>🔑  Login sebagai Pemilik Usaha</Text>
      </TouchableOpacity>

      {/* Kembali */}
      <TouchableOpacity onPress={() => { resetForm(); setMode('welcome'); }} style={styles.backBtn}>
        <Text style={styles.backText}>← Kembali</Text>
      </TouchableOpacity>
    </>
  );

  // ─── RENDER: Register ───────────────────────────────────────────────────────
  const renderRegister = () => (
    <>
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvZmZlfGVufDB8fDB8fHww' }}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Daftar</Text>
      <Text style={styles.subtitle}>Buat akun baru kamu ✨</Text>
      <View style={styles.divider} />

      {/* Username */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder="Buat Username"
          placeholderTextColor="#C4A882"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Buat Password (min. 6 karakter)"
          placeholderTextColor="#C4A882"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Daftar */}
      <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Daftar Sekarang</Text>}
      </TouchableOpacity>

      {/* Sudah punya akun */}
      <TouchableOpacity style={styles.btnSecondary} onPress={() => { resetForm(); setMode('login'); }}>
        <Text style={styles.btnSecondaryText}>Sudah punya akun? Login</Text>
      </TouchableOpacity>

      {/* Kembali */}
      <TouchableOpacity onPress={() => { resetForm(); setMode('welcome'); }} style={styles.backBtn}>
        <Text style={styles.backText}>← Kembali</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.circleBig} />
      <View style={styles.circleSmall} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {mode === 'welcome'  && renderWelcome()}
          {mode === 'login'    && renderLogin()}
          {mode === 'register' && renderRegister()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4B896',
  },
  circleBig: {
    position: 'absolute',
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(198,134,66,0.15)',
    top: -80, right: -80,
  },
  circleSmall: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(198,134,66,0.1)',
    bottom: -50, left: -50,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#8f5907',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2CDB0',
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFF5E9',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: '#C68642',
    elevation: 5,
  },
  logo: { width: 80, height: 80, borderRadius: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3B1F0E', letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#542c13', marginBottom: 20, letterSpacing: 0.5 },
  divider: { width: 50, height: 2, backgroundColor: '#C68642', borderRadius: 2, marginBottom: 24 },

  // Input
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', backgroundColor: '#FFF',
    borderRadius: 14, paddingHorizontal: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2CDB0',
  },
  inputIcon: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#3B1F0E' },
  btnPrimary: {
    width: '100%', backgroundColor: '#C68642',
    paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', marginBottom: 12,
    elevation: 5,
  },
  btnPrimaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnSecondary: {
    width: '100%', backgroundColor: 'transparent',
    paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#C68642',
    marginBottom: 12,
  },
  btnSecondaryText: { color: '#C68642', fontWeight: 'bold', fontSize: 15 },
  btnOwner: {
    width: '100%', backgroundColor: 'rgba(59,31,14,0.3)',
    paddingVertical: 13, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#8B6344',
  },
  btnOwnerText: { color: '#FBF5EC', fontWeight: '600', fontSize: 14 },

  // Or divider
  orRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: '#8B6344' },
  orText: { color: '#B89070', marginHorizontal: 10, fontSize: 12 },

  // Back
  backBtn: { marginTop: 16 },
  backText: { color: '#C68642', fontWeight: 'bold', fontSize: 14 },

  footer: { marginTop: 24, color: '#B89070', fontSize: 12 },
});