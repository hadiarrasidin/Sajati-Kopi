import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, ScrollView, Dimensions, Linking, Alert
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function StoreProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

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
      setProfile(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!profile?.whatsapp) return;
    const number = profile.whatsapp.replace(/\D/g, '');
    const wa = number.startsWith('0') ? '62' + number.slice(1) : number;
    Linking.openURL(`https://wa.me/${wa}?text=Halo, saya ingin bertanya tentang produk kamu 😊`);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C68642" />
        <Text style={styles.loadingText}>Memuat profil toko...</Text>
      </View>
    );
  }

  // ── No data ────────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🏪</Text>
        <Text style={styles.emptyTitle}>Profil belum tersedia</Text>
        <Text style={styles.emptySubtitle}>Pemilik belum mengisi informasi toko</Text>
        <TouchableOpacity style={styles.backBtnCenter} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
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
        {/* Hero banner */}
        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNvZmZlfGVufDB8fDB8fHww' }}
              style={styles.logo}
            />
          </View>
          <Text style={styles.heroName}>{profile.name}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>☕ UMKM Lokal</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.cardsContainer}>

          {/* Tentang Kami */}
          {!!profile.description && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📖</Text>
                <Text style={styles.infoCardTitle}>Tentang Kami</Text>
              </View>
              <Text style={styles.infoCardText}>{profile.description}</Text>
            </View>
          )}

          {/* Alamat */}
          {!!profile.address && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📍</Text>
                <Text style={styles.infoCardTitle}>Alamat</Text>
              </View>
              <Text style={styles.infoCardText}>{profile.address}</Text>
            </View>
          )}

          {/* Kontak / WhatsApp */}
          {!!profile.whatsapp && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📱</Text>
                <Text style={styles.infoCardTitle}>Kontak</Text>
              </View>
              <Text style={styles.infoCardText}>{profile.whatsapp}</Text>
              <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
                <Text style={styles.waBtnText}>💬  Chat via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Jam operasional placeholder — bisa dikembangkan */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardIcon}>🕐</Text>
              <Text style={styles.infoCardTitle}>Jam Operasional</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>Senin – Jumat</Text>
              <Text style={styles.scheduleTime}>08.00 – 21.00</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>Sabtu – Minggu</Text>
              <Text style={styles.scheduleTime}>09.00 – 22.00</Text>
            </View>
          </View>

          {/* Back button */}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B3F1F',
    fontSize: 14,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#3B1F0E', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#6B3F1F', marginBottom: 24 },
  backBtnCenter: { marginTop: 8 },

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
    paddingBottom: 40,
  },

  // Hero
  hero: {
    backgroundColor: '#8f5907',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginBottom: 20,
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: 'rgba(59,31,14,0.2)',
  },
  logoWrapper: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#FFF5E9',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3, borderColor: '#C68642',
    elevation: 8,
  },
  logo: { width: 90, height: 90, borderRadius: 45 },
  heroName: {
    fontSize: 26, fontWeight: 'bold',
    color: '#FBF5EC', letterSpacing: 1,
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(198,134,66,0.3)',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#C68642',
  },
  heroBadgeText: {
    color: '#FBF5EC', fontSize: 12, fontWeight: '600',
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#8f5907',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#C68642',
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardIcon: { fontSize: 20, marginRight: 10 },
  infoCardTitle: {
    fontSize: 16, fontWeight: 'bold',
    color: '#FBF5EC',
  },
  infoCardText: {
    fontSize: 14, color: '#E2CDB0',
    lineHeight: 22,
  },

  // WhatsApp button
  waBtn: {
    marginTop: 14,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  waBtnText: {
    color: '#FFF', fontWeight: 'bold', fontSize: 14,
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,134,66,0.2)',
  },
  scheduleDay: { color: '#E2CDB0', fontSize: 13 },
  scheduleTime: { color: '#C68642', fontWeight: '600', fontSize: 13 },

  // Back
  backBtn: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  backText: { color: '#C68642', fontWeight: 'bold', fontSize: 14 },
});