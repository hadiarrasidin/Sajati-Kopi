import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Image source={{ uri: 'https://img.sanishtech.com/u/6ed38cf8a10873d991639c0926c526ac.png' }} style={styles.logo} />
      <Text style={styles.title}>SAJATI KOPI</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('CustomerHome')}>
        <Text style={styles.btnText}>Pelanggan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, {backgroundColor:'#1A1412'}]} onPress={() => navigation.navigate('LoginOwner')}>
        <Text style={styles.btnText}>Pemilik Usaha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: '#F4EFEA' },
  logo: { width: 200, height: 250, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  btn: { backgroundColor: '#B58255', padding: 10, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});