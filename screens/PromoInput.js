import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  TextInput, Modal, Alert, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PromoInput({ navigation }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ id: null, title: '', description: '', discount_pct: '0', is_active: true });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPromos(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title) return Alert.alert("Error", "Judul promo wajib diisi");
    const payload = {
      title: form.title,
      description: form.description,
      discount_pct: parseInt(form.discount_pct || 0),
      is_active: form.is_active
    };
    if (isAdding) {
      await supabase.from('promos').insert([payload]);
    } else {
      await supabase.from('promos').update(payload).eq('id', form.id);
    }
    setModalVisible(false);
    fetchPromos();
  };

  const confirmDelete = (id) => {
    Alert.alert("Hapus Promo", "Yakin ingin menghapus promo ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => { await supabase.from('promos').delete().eq('id', id); fetchPromos(); } }
    ]);
  };

  const toggleStatus = async (id, currentStatus) => {
    await supabase.from('promos').update({ is_active: !currentStatus }).eq('id', id);
    fetchPromos();
  };

  const openModal = (item = null) => {
    if (item) {
      setForm({ ...item, discount_pct: item.discount_pct.toString() });
      setIsAdding(false);
    } else {
      setForm({ id: null, title: '', description: '', discount_pct: '0', is_active: true });
      setIsAdding(true);
    }
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#3E2723" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Promo</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tombol tambah */}
      <TouchableOpacity style={styles.btnAdd} onPress={() => openModal()}>
        <MaterialCommunityIcons name="tag-plus" size={20} color="#FFF" />
        <Text style={styles.btnText}> Tambah Promo Baru</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#B58255" />
        </View>
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.loadingCenter}>
              <MaterialCommunityIcons name="tag-off" size={60} color="#DDD" />
              <Text style={{ color: '#999', marginTop: 10 }}>Belum ada promo</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.is_active && { opacity: 0.5 }]}>
              <View style={styles.promoIconContainer}>
                <MaterialCommunityIcons name="ticket-percent" size={30} color="#B58255" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>DISKON {item.discount_pct}%</Text>
                </View>
              </View>
              <View style={styles.actionCol}>
                <TouchableOpacity onPress={() => toggleStatus(item.id, item.is_active)}>
                  <MaterialCommunityIcons
                    name={item.is_active ? "toggle-switch" : "toggle-switch-off"}
                    size={36}
                    color={item.is_active ? "#3A4534" : "#BDC3C7"}
                  />
                </TouchableOpacity>
                <View style={styles.miniActionRow}>
                  <TouchableOpacity onPress={() => openModal(item)} style={styles.miniBtn}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#2980B9" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.miniBtn}>
                    <MaterialCommunityIcons name="trash-can" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal tambah/edit */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isAdding ? 'Buat' : 'Edit'} Promo Sajati</Text>

            <Text style={styles.label}>Judul Promo</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Promo Awal Bulan"
              value={form.title}
              onChangeText={t => setForm({ ...form, title: t })}
            />

            <Text style={styles.label}>Keterangan</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Jelaskan detail promonya..."
              multiline
              value={form.description}
              onChangeText={t => setForm({ ...form, description: t })}
            />

            <Text style={styles.label}>Persentase Diskon (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Angka saja (0-100)"
              keyboardType="numeric"
              value={form.discount_pct}
              onChangeText={t => setForm({ ...form, discount_pct: t })}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Simpan Promo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelTxt}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F0E6DD'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3E2723' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnAdd: {
    backgroundColor: '#3A4534', margin: 15, padding: 15, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 15,
    marginBottom: 12, padding: 15, borderRadius: 18, borderWidth: 1,
    borderColor: '#F0E6DD', alignItems: 'center', elevation: 2
  },
  promoIconContainer: { backgroundColor: '#FDF2E9', padding: 10, borderRadius: 12 },
  promoTitle: { fontSize: 16, fontWeight: 'bold', color: '#3E2723' },
  promoDesc: { fontSize: 13, color: '#7F8C8D', marginTop: 4, marginBottom: 8 },
  badge: {
    backgroundColor: '#FDF2E9', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: '#B58255'
  },
  badgeText: { fontSize: 11, color: '#B58255', fontWeight: 'bold' },
  actionCol: { alignItems: 'center', paddingLeft: 10, borderLeftWidth: 1, borderColor: '#F0E6DD' },
  miniActionRow: { flexDirection: 'row', marginTop: 10 },
  miniBtn: { marginHorizontal: 5 },
  modalBg: { flex: 1, backgroundColor: 'rgba(26,20,18,0.8)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#3E2723' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#3E2723', marginBottom: 5 },
  input: {
    backgroundColor: '#F9F9F9', borderRadius: 10, padding: 12,
    marginBottom: 15, borderWidth: 1, borderColor: '#EEE'
  },
  saveBtn: { backgroundColor: '#B58255', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  cancelBtn: { marginTop: 15, padding: 10 },
  cancelTxt: { color: '#7F8C8D', textAlign: 'center', fontWeight: 'bold' }
});