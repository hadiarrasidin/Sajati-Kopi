import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Linking, Alert, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartManager } from './cartStore';

const { width } = Dimensions.get('window');
const IS_WEB = width > 600;

export default function CartScreen({ route, navigation }) {
  const [cart, setCart] = useState(CartManager.getItems());
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  useEffect(() => {
    if (route.params?.addItem) {
      CartManager.add(route.params.addItem);
      setCart([...CartManager.getItems()]);
      navigation.setParams({ addItem: null });
    }
  }, [route.params?.addItem]);

  const updateQty = (id, action) => {
    CartManager.updateQty(id, action);
    setCart([...CartManager.getItems()]);
  };

  const removeItem = (id) => {
    CartManager.remove(id);
    setCart([...CartManager.getItems()]);
  };

  const handleCheckout = async () => {
    if (!buyerName || !buyerPhone) return Alert.alert("Perhatian", "Mohon isi nama dan nomor WA");
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const { error } = await supabase.from('orders').insert([{
      customer_name: buyerName,
      phone_number: buyerPhone,
      items: cart,
      total_price: total,
      status: 'Baru'
    }]);
    if (!error) {
      const message = `Halo Owner, saya ${buyerName}. Pesanan saya:\n` +
        cart.map(i => `- ${i.name} (${i.quantity}x)`).join('\n') +
        `\nTotal: Rp ${total.toLocaleString()}`;
      const url = `https://wa.me/6285900304820?text=${encodeURIComponent(message)}`;
      try {
        await Linking.openURL(url);
        CartManager.clear();
        setCart([]);
        navigation.navigate('CustomerHome');
      } catch {
        Alert.alert("Error", "Tidak dapat membuka WhatsApp");
      }
    } else {
      Alert.alert("Error", "Gagal menyimpan pesanan");
    }
  };

  const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);

  return (
    <View style={styles.pageWrapper}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={IS_WEB ? styles.webCard : styles.mobileCard}>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>📋 Data Pemesan</Text>
            <Text style={styles.label}>Nama Penerima</Text>
            <TextInput
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Nama Lengkap"
              placeholderTextColor="#C4A882"
            />
            <Text style={styles.label}>Nomor WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              placeholder="0812..."
              placeholderTextColor="#C4A882"
              keyboardType="phone-pad"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Cart Items */}
          <Text style={styles.sectionTitle2}>🛒 Pesanan Kamu</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rp {(item.price * item.quantity).toLocaleString()}</Text>
                </View>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity onPress={() => updateQty(item.id, 'minus')} style={styles.qtyBtn}>
                    <MaterialCommunityIcons name="minus" size={14} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.id, 'plus')} style={styles.qtyBtn}>
                    <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="cart-off" size={64} color="#D4B896" />
                <Text style={styles.emptyText}>Keranjang kamu kosong</Text>
                <TouchableOpacity
                  style={styles.shopBtn}
                  onPress={() => navigation.navigate('CustomerHome')}
                >
                  <Text style={styles.shopBtnText}>Lihat Menu</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Footer */}
          {cart.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bayar</Text>
                <Text style={styles.totalPrice}>Rp {total.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                <MaterialCommunityIcons name="whatsapp" size={22} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.checkoutText}>Checkout via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: '#D4B896',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  webCard: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#FBF5EC',
    borderRadius: 20,
    marginVertical: 32,
    borderWidth: 1,
    borderColor: '#E2CDB0',
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  mobileCard: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FBF5EC',
  },

  // Form
  formSection: {
    padding: 20,
    backgroundColor: '#FBF5EC',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B1F0E',
    marginBottom: 14,
  },
  sectionTitle2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B1F0E',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
    color: '#6B3F1F',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2CDB0',
    color: '#3B1F0E',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2CDB0',
    marginHorizontal: 20,
  },

  // Cart item
  cartItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F0E4D0',
    alignItems: 'center',
    backgroundColor: '#FBF5EC',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3B1F0E',
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  itemPrice: {
    color: '#C68642',
    fontWeight: 'bold',
    fontSize: 13,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2CDB0',
    borderRadius: 10,
    padding: 3,
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  qtyBtn: {
    backgroundColor: '#C68642',
    padding: 6,
    borderRadius: 7,
  },
  qtyText: {
    marginHorizontal: 12,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3B1F0E',
  },
  deleteBtn: {
    padding: 4,
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#B89070',
    marginTop: 12,
    fontSize: 15,
    fontStyle: 'italic',
  },
  shopBtn: {
    marginTop: 16,
    backgroundColor: '#C68642',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E2CDB0',
    backgroundColor: '#FFF5E9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    color: '#6B3F1F',
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C68642',
  },
  checkoutBtn: {
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
