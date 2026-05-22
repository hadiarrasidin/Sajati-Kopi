  import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  TextInput, Alert, ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');
const IS_WEB = width > 600;

export default function ProfileUMKMScreen({ navigation }) {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [profile, setProfile]     = useState(null);

  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [address, setAddress]     = useState('');
  const [whatsapp, setWhatsapp]   = useState('');

  // ── Fetch existing profile ─────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_umkm')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setDesc(data.description || '');
        setAddress(data.address || '');
        setWhatsapp(data.whatsapp || '');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Save (upsert) ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim())
      return Alert.alert('Wajib Diisi', 'Nama toko tidak boleh kosong');

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        whatsapp: whatsapp.trim(),
        updated_at: new Date().toISOString(),
      };

      let error;
      if (profile?.id) {
        ({ error } = await supabase
          .from('profile_umkm')
          .update(payload)
          .eq('id', profile.id));
      } else {
        ({ error } = await supabase
          .from('profile_umkm')
          .insert([payload]));
      }

      if (error) throw error;

      Alert.alert('✅ Berhasil', 'Profil UMKM berhasil disimpan!');
      fetchProfile();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C68642" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circleBig} />
      <View style={styles.circleSmall} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvZmZlfGVufDB8fDB8fHww' }}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Profil UMKM</Text>
          <Text style={styles.subtitle}>Kelola informasi toko kamu 🏪</Text>
          <View style={styles.divider} />

          {/* Nama Toko */}
          <Text style={styles.label}>Nama Toko</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🏪</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama toko kamu"
              placeholderTextColor="#C4A882"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Deskripsi */}
          <Text style={styles.label}>Deskripsi</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ceritain sedikit tentang toko kamu..."
              placeholderTextColor="#C4A882"
              value={description}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Alamat */}
          <Text style={styles.label}>Alamat</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alamat lengkap toko..."
              placeholderTextColor="#C4A882"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* WhatsApp */}
          <Text style={styles.label}>WhatsApp</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#C4A882"
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          {/* Last updated info */}
          {profile?.updated_at && (
            <Text style={styles.updatedAt}>
              🕐 Terakhir diperbarui:{' '}
              {new Date(profile.updated_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.btnPrimaryText}>💾  Simpan Perubahan</Text>
            }
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
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
  centered: {
    flex: 1,
    backgroundColor: '#D4B896',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B3F1F',
    fontSize: 14,
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  title: {
    fontSize: 28, fontWeight: 'bold',
    color: '#3B1F0E', letterSpacing: 1, marginBottom: 4,
  },
  subtitle: {
    fontSize: 13, color: '#542c13',
    marginBottom: 20, letterSpacing: 0.5,
  },
  divider: {
    width: 50, height: 2,
    backgroundColor: '#C68642', borderRadius: 2, marginBottom: 24,
  },

  label: {
    alignSelf: 'flex-start',
    color: '#FBF5EC',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', backgroundColor: '#FFF',
    borderRadius: 14, paddingHorizontal: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#E2CDB0',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  inputIcon: { fontSize: 18, marginRight: 8 },
  input: {
    flex: 1, paddingVertical: 12,
    fontSize: 14, color: '#3B1F0E',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 0,
  },

  updatedAt: {
    color: '#D4A96A',
    fontSize: 11,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },

  btnPrimary: {
    width: '100%', backgroundColor: '#C68642',
    paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', marginBottom: 12,
    elevation: 5,
  },
  btnPrimaryText: {
    color: '#FFF', fontWeight: 'bold', fontSize: 16,
  },

  backBtn: { marginTop: 8 },
  backText: { color: '#C68642', fontWeight: 'bold', fontSize: 14 },
  });