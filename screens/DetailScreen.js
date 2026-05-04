import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartManager } from './cartStore';

const { width } = Dimensions.get('window');
const IS_WEB = width > 600;

export default function DetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    CartManager.add({ ...product, quantity });
    window.alert(`${quantity}x ${product.name} berhasil ditambahkan ke keranjang! 🛒`);
  };

  return (
    <View style={styles.pageWrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {IS_WEB ? (
          <View style={styles.webLayout}>
            {/* Kiri: Foto */}
            <View style={styles.webLeft}>
              <Image source={{ uri: product.image_url }} style={styles.webImage} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.category}</Text>
              </View>
            </View>

            {/* Kanan: Info */}
            <View style={styles.webRight}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>Rp {product.price.toLocaleString()}</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>📋 Deskripsi</Text>
              <Text style={styles.desc}>{product.description || "Produk UMKM berkualitas tinggi dari Sajati Kopi."}</Text>
              <View style={styles.divider} />
              <View style={styles.qtyRow}>
                <Text style={styles.label}>Jumlah</Text>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                    <MaterialCommunityIcons name="minus" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
                    <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>Rp {(product.price * quantity).toLocaleString()}</Text>
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={addToCart}>
                  <MaterialCommunityIcons name="cart-plus" size={18} color="#C68642" style={{ marginRight: 6 }} />
                  <Text style={styles.btnSecondaryText}>Tambah</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => { CartManager.add({ ...product, quantity }); navigation.navigate('Cart'); }}>
                  <Text style={styles.btnPrimaryText}>Beli Sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        ) : (
          <View>
            <Image source={{ uri: product.image_url }} style={styles.mobileImage} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.category}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>Rp {product.price.toLocaleString()}</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>📋 Deskripsi</Text>
              <Text style={styles.desc}>{product.description || "Produk UMKM berkualitas tinggi dari Sajati Kopi."}</Text>
              <View style={styles.divider} />
              <View style={styles.qtyRow}>
                <Text style={styles.label}>Jumlah</Text>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                    <MaterialCommunityIcons name="minus" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
                    <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>Rp {(product.price * quantity).toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={addToCart}>
                <MaterialCommunityIcons name="cart-plus" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>Tambah ke Keranjang</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10 }]} onPress={() => navigation.navigate('Cart')}>
                <MaterialCommunityIcons name="cart-outline" size={20} color="#C68642" style={{ marginRight: 8 }} />
                <Text style={styles.btnSecondaryText}>Lihat Keranjang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: '#D4B896',
  },

  // Web layout
  webLayout: {
    flexDirection: 'row',
    padding: 32,
    gap: 40,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#FBF5EC',
    borderRadius: 20,
    marginVertical: 32,
    marginHorizontal: 'auto',
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2CDB0',
  },
  webLeft: {
    width: 400,
    position: 'relative',
  },
  webImage: {
    width: '100%',
    height: 400,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  webRight: {
    flex: 1,
    paddingTop: 8,
  },

  // Mobile layout
  mobileImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  info: {
    padding: 22,
    backgroundColor: '#FBF5EC',
  },

  // Shared
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(198,134,66,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B1F0E',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    color: '#C68642',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE0CF',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B1F0E',
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: '#8B6344',
    lineHeight: 22,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE0CF',
    borderRadius: 10,
    padding: 4,
    backgroundColor: '#FFF',
  },
  qtyBtn: {
    backgroundColor: '#C68642',
    padding: 8,
    borderRadius: 8,
  },
  qtyText: {
    marginHorizontal: 18,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3B1F0E',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5E9',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2CDB0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#8B6344',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C68642',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#C68642',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#C68642',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C68642',
  },
  btnSecondaryText: {
    color: '#C68642',
    fontWeight: 'bold',
    fontSize: 15,
  },
});