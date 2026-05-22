import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PromoScreen() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {fetchActivePromos();
  }, []);

  const fetchActivePromos = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  Alert.alert('Debug', `data: ${JSON.stringify(data)}, error: ${JSON.stringify(error)}`);
  
  if (!error) setPromos(data);
  setLoading(false);
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promo Santuy 🏷️</Text>
        <Text style={styles.headerSub}>Nikmati tawaran spesial hari ini</Text>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#B58255" />
        </View>
      ) : promos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>Belum ada promo aktif saat ini.</Text>
        </View>
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.promoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount_pct}% OFF</Text>
                </View>
                <MaterialCommunityIcons name="star" size={20} color="#B58255" />
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoDesc}>{item.description}</Text>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.dottedLine} />
                <View style={styles.voucherDesign}>
                    <Text style={styles.copyText}>Gunakan saat checkout di kasir/WA</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: { padding: 25, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#3E2723' },
  headerSub: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  promoCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#F0E6DD',
    overflow: 'hidden',
    elevation: 3
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15,
    backgroundColor: '#FDF8F2' 
  },
  discountBadge: { backgroundColor: '#3A4534', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  discountText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardBody: { padding: 20 },
  promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#3E2723' },
  promoDesc: { fontSize: 14, color: '#555', marginTop: 8, lineHeight: 20 },
  cardFooter: { paddingBottom: 15 },
  dottedLine: { borderStyle: 'dashed', borderBottomWidth: 1, borderColor: '#D4C4B7', marginVertical: 10, marginHorizontal: 15 },
  voucherDesign: { alignItems: 'center' },
  copyText: { fontSize: 11, color: '#B58255', fontWeight: 'bold', fontStyle: 'italic' }
});