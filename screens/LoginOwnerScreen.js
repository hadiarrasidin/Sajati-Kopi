import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginOwnerScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (email === 'sajatikopi@gmail.com' && password === '12345678') {
      navigation.navigate('AdminDashboard');
    } else {
      Alert.alert("Login Gagal", "Email atau password salah!");
    }
  };

  return (
    <View style={styles.pageWrapper}>
      <View style={styles.circleBig} />
      <View style={styles.circleSmall} />

      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="shield-lock" size={40} color="#C68642" />
        </View>

        <Text style={styles.title}>Login Admin</Text>
        <Text style={styles.subtitle}>Masuk ke dashboard pemilik usaha</Text>

        <View style={styles.divider} />

        {/* Email */}
        <Text style={styles.label}>Email Owner</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={18} color="#C68642" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="sajatikopi@gmail.com"
            placeholderTextColor="#C4A882"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-outline" size={18} color="#C68642" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholder="••••••••"
            placeholderTextColor="#C4A882"
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <MaterialCommunityIcons
              name={showPass ? "eye-off" : "eye"}
              size={18}
              color="#C4A882"
            />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <MaterialCommunityIcons name="login" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Masuk ke Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali ke halaman utama</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: '#D4B896',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circleBig: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(198,134,66,0.15)',
    top: -60,
    right: -60,
  },
  circleSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(198,134,66,0.1)',
    bottom: -40,
    left: -40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FBF5EC',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2CDB0',
    shadowColor: '#6B3F1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#E2CDB0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3B1F0E',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B6344',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2CDB0',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B3F1F',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2CDB0',
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    height: 46,
    color: '#3B1F0E',
    fontSize: 14,
  },
  btn: {
    backgroundColor: '#C68642',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#C68642',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#8B6344',
    fontSize: 13,
  },
});