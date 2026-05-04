import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView, SafeAreaView, Alert, TextInput, Dimensions } from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

export default function CustomerHomeScreen({ navigation }) {
  const [products, setproducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['Semua', 'coffe', 'sweet coffe', 'non coffe', 'light meal', 'main course', 'noodles & pasta'];

  useEffect(() => { fetchproducts(); }, []);

  const fetchproducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
      if (error) throw error;
      setproducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Gagal', 'Tidak dapat memuat produk.');
    }
  };

  const filteredproducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Selamat datang di</Text>
          <Text style={styles.brand}>Sajati Kopi ☕</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <MaterialCommunityIcons name="cart-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
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

      {/* Category chips */}
      <View style={{ height: 44, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {categories.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedCategory(c)}
              style={[styles.catChip, selectedCategory === c && styles.catChipActive]}
            >
              <Text style={[styles.catChipText, selectedCategory === c && styles.catChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'Semua' ? '✨ Semua Menu' : selectedCategory}
        </Text>
        <Text style={styles.sectionCount}>{filteredproducts.length} item</Text>
      </View>

      {/* Product grid */}
      <FlatList
        data={filteredproducts}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialCommunityIcons name="coffee-off" size={64} color="#D4B896" />
            <Text style={{ color: '#B89070', marginTop: 12, fontSize: 15 }}>Menu tidak ditemukan</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Detail', { product: item })}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.image_url }} style={styles.cardImg} />
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{item.category}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardPrice}>Rp {item.price.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B1F0E',
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C68642',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C68642',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
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
  },
  catChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B1F0E',
    textTransform: 'capitalize',
  },
  sectionCount: {
    fontSize: 12,
    color: '#B89070',
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
    height: CARD_WIDTH,
    resizeMode: 'cover',
  },
  cardBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(198,134,66,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: 8,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#3B1F0E',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  cardPrice: {
    color: '#4A7C59',
    fontWeight: 'bold',
    fontSize: 11,
  },
});