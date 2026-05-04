import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  StyleSheet, Linking, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { supabase } from './supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CartScreen({ route, navigation }) {
  const [cart, setCart] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  useEffect(() => {
    if (route.params?.addItem) {
      const item = route.params.addItem;
      setCart(prev => {
        const exist = prev.find(i => i.id === item.id);
        if (exist) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { ...item, quantity: 1 }];
      });
    }
  }, [route.params?.addItem]);

  // --- FUNGSI UPDATE QTY (+ / -) ---
  const updateQty = (id, action) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = action === 'plus' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // --- FUNGSI HAPUS ITEM ---
  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (!buyerName || !buyerPhone) return Alert.alert("Perhatian", "Mohon isi nama dan nomor WA");
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const { error } = await supabase.from('orders').insert([
      { 
        customer_name: buyerName, 
        phone_number: buyerPhone, 
        items: cart, 
        total_price: total, 
        status: 'Baru' 
      }
    ]);

    if (!error) {
      const message = `Halo Owner, saya ${buyerName}. Pesanan saya:\n` + 
                      cart.map(i => `- ${i.name} (${i.quantity}x)`).join('\n') + 
                      `\nTotal: Rp ${total.toLocaleString()}`;
      
      const phoneNumber = "6285723515034";
      const url = `https://wa.me/6285900304820  ?text=${encodeURIComponent(message)}`;

          try {
        await Linking.openURL(url);
        setCart([]);
        navigation.navigate('CustomerHome');
      } catch (error) {
        Alert.alert("Error", "Tidak dapat membuka WhatsApp");
      }
    } else {
      Alert.alert("Error", "Gagal menyimpan pesanan");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* BAGIAN INPUT NAMA & WA (Dipisah dari FlatList agar tidak loncat) */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Nama Penerima</Text>
        <TextInput 
          style={styles.input} 
          value={buyerName} 
          onChangeText={setBuyerName} 
          placeholder="Nama Lengkap"
        />
        <Text style={styles.label}>Nomor WhatsApp</Text>
        <TextInput 
          style={styles.input} 
          value={buyerPhone} 
          onChangeText={setBuyerPhone} 
          placeholder="0812..." 
          keyboardType="phone-pad"
        />
      </View>

      <FlatList 
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>Rp {(item.price * item.quantity).toLocaleString()}</Text>
            </View>
            
            <View style={styles.qtyContainer}>
              <TouchableOpacity onPress={() => updateQty(item.id, 'minus')} style={styles.qtyBtn}>
                <MaterialCommunityIcons name="minus" size={18} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, 'plus')} style={styles.qtyBtn}>
                <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
              <MaterialCommunityIcons name="trash-can" size={26} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="cart-off" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Keranjang Anda Kosong</Text>
          </View>
        )}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bayar</Text>
            <Text style={styles.totalPrice}>Rp {cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.btnText}>Checkout via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  formSection: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#D4C4B7' }, // Pakai border Latte Beige
  label: { fontWeight: 'bold', marginBottom: 5, fontSize: 14, color: '#1A1412' }, // Teks label Espresso Black
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D4C4B7', color: '#1A1412' }, // Border Latte Beige, Teks Espresso
  cartItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderColor: '#D4C4B7', alignItems: 'center' }, // Border bawah Latte Beige
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#1A1412' }, // Nama produk Espresso Black
  itemPrice: { color: '#B58255', fontWeight: 'bold' }, // Harga produk Caramel Brown
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D4C4B7', borderRadius: 10, padding: 5 }, // Kotak Qty dikasih border Latte Beige
  qtyBtn: { backgroundColor: '#B58255', padding: 5, borderRadius: 8 }, // Tombol + dan - Caramel Brown
  qtyText: { marginHorizontal: 15, fontWeight: 'bold', fontSize: 16, color: '#1A1412' }, // Angka Qty Espresso Black
  deleteBtn: { marginLeft: 15 },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#3A4534', marginTop: 10, fontSize: 16, fontStyle: 'italic' }, // Teks keranjang kosong Dark Green
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#D4C4B7', backgroundColor: '#FFF' }, // Border atas footer Latte Beige
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 16, color: '#1A1412', fontWeight: 'bold' }, // Label Total Espresso Black
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#B58255' }, // Harga Total Caramel Brown
  checkoutBtn: { backgroundColor: '#3A4534', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, // Tombol Checkout WA Dark Green
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 } // Teks tombol tetap putih biar kontras
});