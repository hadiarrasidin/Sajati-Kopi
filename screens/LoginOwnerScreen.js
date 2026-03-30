import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginOwnerScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'sajatikopi@gmail.com' && password === '12345678') {
      navigation.navigate('AdminDashboard');
    } else {
      Alert.alert("Gagal", "Email atau Password Admin salah");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email Owner</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="" autoCapitalize="none" />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login Ke Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: 'center', backgroundColor: '#F4EFEA' },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#B58255', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  btn: { backgroundColor: '#1A1412', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});