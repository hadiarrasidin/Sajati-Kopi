import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C0A00" />
      
      {/* Background decorative circles */}
      <View style={styles.circleBig} />
      <View style={styles.circleSmall} />

      {/* Logo area */}
      <View style={styles.logoWrapper}>
        <Image 
          source={{ uri: 'https://img.sanishtech.com/u/6ed38cf8a10873d991639c0926c526ac.png' }} 
          style={styles.logo} 
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Sajati Kopi</Text>
      <Text style={styles.subtitle}>Selamat Datang ☕</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Buttons */}
      <View style={styles.btnWrapper}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('CustomerHome')}>
          <Text style={styles.btnPrimaryText}>☕  Saya Pelanggan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('LoginOwner')}>
          <Text style={styles.btnSecondaryText}>🔑  Pemilik Usaha</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Sajati Kopi © 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C0A00',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    overflow: 'hidden',
  },

  // Decorative background circles
  circleBig: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#2C1503',
    top: -80,
    right: -80,
  },
  circleSmall: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2C1503',
    bottom: -50,
    left: -50,
  },

  // Logo
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2C1503',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#C68642',
    shadowColor: '#C68642',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  // Text
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E8D5B7',
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B6344',
    marginBottom: 30,
    letterSpacing: 1,
  },

  // Divider
  divider: {
    width: 50,
    height: 2,
    backgroundColor: '#C68642',
    borderRadius: 2,
    marginBottom: 35,
  },

  // Buttons
  btnWrapper: {
    width: '100%',
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: '#C68642',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#C68642',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#FDF6ED',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4A3728',
  },
  btnSecondaryText: {
    color: '#8B6344',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#4A3728',
    fontSize: 12,
  },
});