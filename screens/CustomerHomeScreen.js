import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  ScrollView, SafeAreaView, Alert, TextInput,
  Dimensions, Linking, ActivityIndicator
} from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const IS_WEB = width > 600;
const CARD_WIDTH = IS_WEB ? (width - 80) / 4 - 12 : (width - 48) / 2 - 12;

const categoryEmoji = {
  'coffe': '☕',
  'sweet coffe': '🧋',
  'non coffe': '🥤',
  'light meal': '🥗',
  'main course': '🍽️',
  'noodles & pasta': '🍝',
};

export default function CustomerHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const categories = ['Semua', 'coffe', 'sweet coffe', 'non coffe', 'light meal', 'main course', 'noodles & pasta'];

 useFocusEffect(
  useCallback(() => {
    fetchProducts();
    fetchProfile();
  }, [])
);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Gagal', 'Tidak dapat memuat produk.');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profile_umkm')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (data) setProfile(data);
    } catch (e) {
      console.error('Error fetching profile:', e.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const openWhatsApp = () => {
    if (!profile?.whatsapp) return;
    const num = profile.whatsapp.startsWith('0')
      ? '62' + profile.whatsapp.slice(1)
      : profile.whatsapp;
    Linking.openURL(`whatsapp://send?phone=${num}`);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = {};
  filteredProducts.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };

  const cols = IS_WEB ? 4 : 2;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Selamat datang di</Text>
          <Text style={styles.brand}>Kasir Digital☕</Text>
        </View>
       <View style={styles.headerButtons}>
  <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('PromoScreen')}>
    <MaterialCommunityIcons name="tag-multiple" size={20} color="#C68642" />
    <Text style={styles.headerBtnLabel}>Promo</Text>
  </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('StoreProfile')}>
    <MaterialCommunityIcons name="store-outline" size={20} color="#C68642" />
    <Text style={styles.headerBtnLabel}>Profile</Text>
  </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
    <MaterialCommunityIcons name="cart-outline" size={22} color="#FFF" />
    <Text style={[styles.headerBtnLabel, { color: '#FFF' }]}>Keranjang</Text>
  </TouchableOpacity>
        </View>
      </View>
      

      {/* ── Store Info Banner ── */}
      {!loadingProfile && profile && (
        <View style={styles.storeBanner}>
          <View style={styles.storeLeft}>
            <View style={styles.storeIconWrap}>
              <MaterialCommunityIcons name="store" size={20} color="#C68642" />
            </View>
            <View style={{ flex: 1 }}>
              {profile.name ? (
                <Text style={styles.storeName} numberOfLines={1}>{profile.name}</Text>
              ) : null}
              {profile.address ? (
                <Text style={styles.storeAddress} numberOfLines={1}>
                  📍 {profile.address}
                </Text>
              ) : null}
              {profile.description ? (
                <Text style={styles.storeDesc} numberOfLines={1}>
                  {profile.description}
                </Text>
              ) : null}
            </View>
          </View>
          {profile.whatsapp && (
            <TouchableOpacity style={styles.waChip} onPress={openWhatsApp}>
              <MaterialCommunityIcons name="whatsapp" size={15} color="#25D366" />
              <Text style={styles.waChipText}>Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <MaterialCommunityIcons name="magnify" size={20} color="#C68642" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari menu favoritmu..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#C4A882"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#C4A882" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category chips ── */}
      <View style={{ height: 44, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {categories.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedCategory(c)}
              style={[styles.catChip, selectedCategory === c && styles.catChipActive]}
            >
              <Text style={[styles.catChipText, selectedCategory === c && styles.catChipTextActive]}>
                {categoryEmoji[c] || '✨'} {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Product list ── */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}>

        {Object.keys(grouped).length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialCommunityIcons name="coffee-off" size={64} color="#D4B896" />
            <Text style={{ color: '#B89070', marginTop: 12, fontSize: 15 }}>Menu tidak ditemukan</Text>
          </View>
        )}

        {Object.keys(grouped).map(category => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>
                {categoryEmoji[category] || '🍴'} {category}
              </Text>
              <Text style={styles.categoryCount}>{grouped[category].length} item</Text>
            </View>

            {chunkArray(grouped[category], cols).map((row, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {row.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('Detail', { product: item })}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.image_url }} style={styles.cardImg} />
                    <View style={styles.cardBody}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardPrice}>Rp {item.price.toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {row.length < cols && [...Array(cols - row.length)].map((_, i) => (
                  <View key={`empty-${i}`} style={[styles.card, { backgroundColor: 'transparent', borderWidth: 0, elevation: 0 }]} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF5EC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FBF5EC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CF',
  },
  headerSub: {
    fontSize: 11,
    color: '#B89070',
    letterSpacing: 0.5,
  },
  headerButtons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
headerBtn: {
  width: 52,
  height: 52,
  borderRadius: 14,
  backgroundColor: '#FFF5E9',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#EDE0CF',
},
headerBtnLabel: {
  fontSize: 9,
  color: '#C68642',
  fontWeight: 'bold',
  marginTop: 2,
},
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B1F0E',
  },
  cartBtn: {
  width: 52,
  height: 52,
  borderRadius: 14,
  backgroundColor: '#C68642',
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 5,
},
  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF5E9',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CF',
    gap: 10,
  },
  storeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  storeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE0CF',
  },
  storeName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3B1F0E',
  },
  storeAddress: {
    fontSize: 11,
    color: '#8B6344',
    marginTop: 1,
  },
  storeDesc: {
    fontSize: 11,
    color: '#B89070',
    fontStyle: 'italic',
    marginTop: 1,
  },
  waChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  waChipText: {
    fontSize: 12,
    color: '#25D366',
    fontWeight: 'bold',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EDE0CF',
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#3B1F0E',
    fontSize: 13,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDE0CF',
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: '#C68642',
    borderColor: '#C68642',
  },
  catChipText: {
    color: '#8B6344',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  catChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C68642',
    paddingLeft: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B1F0E',
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 12,
    color: '#B89070',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  card: {
    width: CARD_WIDTH,
    margin: 6,
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0E4D0',
  },
  cardImg: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 8,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3B1F0E',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  cardPrice: {
    color: '#4A7C59',
    fontWeight: 'bold',
    fontSize: 14,
  },
});