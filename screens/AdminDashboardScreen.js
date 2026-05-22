import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Linking, TextInput, Modal, ScrollView,
  ActivityIndicator, Dimensions, Platform
} from 'react-native';
import { supabase } from '../supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB_LARGE = Platform.OS === 'web' && SCREEN_WIDTH >= 768;

const BAR_COLORS = [
  '#C68642', '#4A7C59', '#E74C3C', '#3B82F6', '#9B59B6',
  '#E67E22', '#1ABC9C', '#E91E63', '#607D8B', '#FF9800',
];

const formatLabel = (dateStr, mode) => {
  const d = new Date(dateStr);
  if (mode === 'daily')   return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  if (mode === 'weekly')  return `W${getWeekNumber(d)}`;
  if (mode === 'monthly') return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
  return dateStr;
};

const getWeekNumber = (d) => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

const groupKey = (dateStr, mode) => {
  const d = new Date(dateStr);
  if (mode === 'daily')   return d.toISOString().split('T')[0];
  if (mode === 'weekly')  return `${d.getFullYear()}-W${getWeekNumber(d)}`;
  if (mode === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return dateStr;
};

function SimpleCalendar({ selectedDate, onSelectDate, onClose }) {
  const [viewYear, setViewYear] = useState(selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? new Date(selectedDate).getMonth() : new Date().getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const monthName  = new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={calStyles.container}>
      <View style={calStyles.header}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#C68642" />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#C68642" />
        </TouchableOpacity>
      </View>
      <View style={calStyles.dayRow}>
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
          <Text key={d} style={calStyles.dayName}>{d}</Text>
        ))}
      </View>
      <View style={calStyles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`e-${idx}`} style={calStyles.cell} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isSelected = dateStr === selectedDate;
          const isToday    = dateStr === todayStr;
          return (
            <TouchableOpacity key={dateStr} style={[calStyles.cell, isSelected && calStyles.cellSelected, isToday && !isSelected && calStyles.cellToday]} onPress={() => onSelectDate(dateStr)}>
              <Text style={[calStyles.cellText, isSelected && { color: '#FFF', fontWeight: 'bold' }, isToday && !isSelected && { color: '#C68642', fontWeight: 'bold' }]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={onClose} style={calStyles.closeBtn}>
        <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>Tutup</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab]             = useState('home');
  const [products, setProducts]               = useState([]);
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [modalVisible, setModalVisible]       = useState(false);
  const [editingProduct, setEditingProduct]   = useState({});
  const [isAdding, setIsAdding]               = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [editingOrder, setEditingOrder]       = useState({});

  const [chartMode, setChartMode]             = useState('daily');
  const [chartType, setChartType]             = useState('sales');
  const [selectedDate, setSelectedDate]       = useState(null);
  const [showCalendar, setShowCalendar]       = useState(false);
  const [salesChartData, setSalesChartData]   = useState(null);
  const [productChartData, setProductChartData] = useState(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { buildChartData(); }, [orders, chartMode, selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: prod, error: prodError } = await supabase.from('products').select('*').order('id', { ascending: false });
      const { data: ord, error: ordError }   = await supabase.from('orders').select('*').order('id', { ascending: true });
      if (prodError) Alert.alert('Error Products', JSON.stringify(prodError));
      if (ordError)  Alert.alert('Error Orders', JSON.stringify(ordError));
      setProducts(prod || []);
      setOrders(ord || []);
    } catch (e) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = useCallback(() => {
    if (!orders.length) { setSalesChartData(null); setProductChartData(null); return; }

    let filtered = orders;
    if (selectedDate) {
      filtered = orders.filter(o => {
        if (!o.created_at) return false;
        return new Date(o.created_at).toISOString().split('T')[0] === selectedDate;
      });
    }

    const salesGrouped = {};
    filtered.forEach(o => {
      if (!o.created_at) return;
      const key = groupKey(o.created_at, chartMode);
      salesGrouped[key] = (salesGrouped[key] || 0) + (o.total_price || 0);
    });

    const salesKeys = Object.keys(salesGrouped).sort();
    const slicedSales = salesKeys.slice(-7);
    if (slicedSales.length) {
      setSalesChartData({
        labels: slicedSales.map(k => {
          if (chartMode === 'daily')   return formatLabel(k, 'daily');
          if (chartMode === 'weekly')  return k.replace(/\d+-W/, 'W');
          if (chartMode === 'monthly') return formatLabel(k + '-01', 'monthly');
          return k;
        }),
        datasets: [{ data: slicedSales.map(k => salesGrouped[k] / 1000) }],
      });
    } else {
      setSalesChartData(null);
    }

    const productGrouped = {};
    filtered.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach(item => {
        if (!item?.name) return;
        productGrouped[item.name] = (productGrouped[item.name] || 0) + (item.qty || 1);
      });
    });

    const productEntries = Object.entries(productGrouped).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (productEntries.length) {
      setProductChartData({
        labels: productEntries.map(([name]) => name.length > 8 ? name.slice(0, 7) + '…' : name),
        fullLabels: productEntries.map(([name]) => name),
        datasets: [{
          data: productEntries.map(([, qty]) => qty),
          colors: productEntries.map((_, i) => () => BAR_COLORS[i % BAR_COLORS.length]),
        }],
      });
    } else {
      setProductChartData(null);
    }
  }, [orders, chartMode, selectedDate]);

  const handleSaveProduct = async () => {
    if (!editingProduct.name || !editingProduct.price || !editingProduct.category)
      return Alert.alert('Lengkapi Data', 'Nama, Harga, dan Kategori wajib diisi');
    const payload = {
      name:      editingProduct.name,
      price:     parseInt(editingProduct.price),
      category:  editingProduct.category,
      image_url: editingProduct.image_url || 'https://via.placeholder.com/150',
    };
    if (isAdding) await supabase.from('products').insert([{ ...payload, is_active: true }]);
    else          await supabase.from('products').update(payload).eq('id', editingProduct.id);
    setModalVisible(false);
    fetchData();
  };

  const toggleStatus = async (id, cur) => {
    await supabase.from('products').update({ is_active: !cur }).eq('id', id);
    fetchData();
  };

 const deleteProduct = async (id) => {
  const konfirmasi = Platform.OS === 'web' 
    ? window.confirm("Hapus produk ini permanen?") 
    : await new Promise(resolve => Alert.alert("Hapus", "Hapus produk ini permanen?", [
        { text: "Batal", onPress: () => resolve(false) },
        { text: "Hapus", onPress: () => resolve(true), style: 'destructive' }
      ]));

  if (!konfirmasi) return;
  
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) Alert.alert("Error", error.message);
  else fetchData();
};
  const updateOrderStatus = async (id) => {await supabase.from('orders').update({ status: 'Selesai' }).eq('id', id);
    fetchData();
  };

  const deleteOrder = async (id) => {
  const konfirmasi = Platform.OS === 'web'
    ? window.confirm("Hapus data pesanan ini?")
    : await new Promise(resolve => Alert.alert("Hapus Riwayat", "Hapus data pesanan ini?", [
        { text: "Batal", onPress: () => resolve(false) },
        { text: "Hapus", onPress: () => resolve(true), style: 'destructive' }
      ]));

  if (!konfirmasi) return;

  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) Alert.alert("Error", error.message);
  else fetchData();
};

  const handleSaveOrder = async () => {const extra    = parseInt(editingOrder.extra_charge) || 0;
    const original = editingOrder._originalPrice || editingOrder.total_price;
    await supabase.from('orders').update({
      extra_charge: extra,
      notes:        editingOrder.notes || '',
      total_price:  original + extra,
    }).eq('id', editingOrder.id);
    setOrderModalVisible(false);
    fetchData();
  };

  const chatCustomer = (phone) => {const formatted = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    Linking.openURL(`whatsapp://send?phone=${formatted}`);
  };

  const totalPendapatan = orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + (o.total_price || 0), 0);
  const uniqueCustomers = orders.reduce((acc, o) => {
    if (!acc.find(c => c.phone_number === o.phone_number))
      acc.push({ customer_name: o.customer_name, phone_number: o.phone_number });
    return acc;
  }, []);
  const avgPesanan = orders.length ? Math.round(orders.reduce((s, o) => s + (o.total_price || 0), 0) / orders.length) : 0;

  const baseChartConfig = {
    backgroundColor:        '#FBF5EC',
    backgroundGradientFrom: '#FBF5EC',
    backgroundGradientTo:   '#FBF5EC',
    decimalPlaces:           0,
    labelColor:              () => '#8B6344',
    style:                   { borderRadius: 12 },
    propsForBackgroundLines: { stroke: '#F0E4D0', strokeWidth: 1 },
  };

  const salesChartConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(74, 124, 89, ${opacity})`,
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#4A7C59' },
  };

  // ─── RENDER: grafik ──────────────────────────────────────────────────────────
  const renderChartSection = () => (
    <View style={[s.chartCard, IS_WEB_LARGE && s.chartCardWeb]}>
      <View style={s.chartControlRow}>
        <View style={s.toggleGroup}>
          {[
            { key: 'sales',    label: '📈 Penjualan' },
            { key: 'products', label: '🏆 Terlaris' },
          ].map(t => (
            <TouchableOpacity key={t.key} style={[s.toggleBtn, chartType === t.key && s.toggleBtnActive]} onPress={() => setChartType(t.key)}>
              <Text style={[s.toggleText, chartType === t.key && s.toggleTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.rightControls}>
          <View style={s.toggleGroup}>
            {[
              { key: 'daily',   label: 'H' },
              { key: 'weekly',  label: 'M' },
              { key: 'monthly', label: 'B' },
            ].map(t => (
              <TouchableOpacity key={t.key} style={[s.periodBtn, chartMode === t.key && s.periodBtnActive]} onPress={() => setChartMode(t.key)}>
                <Text style={[s.periodText, chartMode === t.key && s.periodTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.calBtn, selectedDate && s.calBtnActive]} onPress={() => setShowCalendar(true)}>
            <MaterialCommunityIcons name="calendar" size={16} color={selectedDate ? '#FFF' : '#C68642'} />
            {selectedDate && <Text style={{ color: '#FFF', fontSize: 11, marginLeft: 4 }}>{selectedDate}</Text>}
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={s.clearDateBtn}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flexDirection: IS_WEB_LARGE ? 'row' : 'column', gap: 16, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.chartTitle}>📈 Penjualan {chartMode === 'daily' ? 'Harian' : chartMode === 'weekly' ? 'Mingguan' : 'Bulanan'}</Text>
          <Text style={s.chartSubtitle}>dalam ribuan rupiah (Rp×1000)</Text>
          {salesChartData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={salesChartData}
                width={Math.max(IS_WEB_LARGE ? (SCREEN_WIDTH * 0.45) : (SCREEN_WIDTH - 80), (salesChartData.labels.length * 70))}
                height={200} fromZero chartConfig={salesChartConfig} bezier
                style={{ borderRadius: 12, marginTop: 8 }}
              />
            </ScrollView>
          ) : (
            <View style={s.emptyChart}>
              <MaterialCommunityIcons name="chart-line-variant" size={40} color="#D4B896" />
              <Text style={s.emptyChartText}>Belum ada data penjualan</Text>
            </View>
          )}
        </View>

        <View style={{ width: IS_WEB_LARGE ? 1 : '100%', height: IS_WEB_LARGE ? 'auto' : 1, backgroundColor: '#E2CDB0' }} />

        <View style={{ flex: 1 }}>
          <Text style={s.chartTitle}>🏆 Produk Terlaris</Text>
          <Text style={s.chartSubtitle}>berdasarkan jumlah item terjual</Text>
          {productChartData ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{ labels: productChartData.labels, datasets: productChartData.datasets }}
                  width={Math.max(IS_WEB_LARGE ? (SCREEN_WIDTH * 0.45) : (SCREEN_WIDTH - 80), (productChartData.labels.length * 72))}
                  height={200} fromZero showValuesOnTopOfBars withCustomBarColorFromData flatColor
                  chartConfig={{
                    ...baseChartConfig,
                    color: (opacity = 1, index) => {
                      if (typeof index === 'number') return BAR_COLORS[index % BAR_COLORS.length];
                      return `rgba(198,134,66,${opacity})`;
                    },
                    barPercentage: 0.65,
                  }}
                  style={{ borderRadius: 12, marginTop: 8 }}
                />
              </ScrollView>
              <View style={s.legendRow}>
                {productChartData.fullLabels.map((name, i) => (
                  <View key={i} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
                    <Text style={s.legendText} numberOfLines={1}>{name}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={s.emptyChart}>
              <MaterialCommunityIcons name="chart-bar" size={40} color="#D4B896" />
              <Text style={s.emptyChartText}>Belum ada data produk terjual</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ─── RENDER: Home ────────────────────────────────────────────────────────────
  const renderHome = () => (
    <ScrollView style={{ padding: IS_WEB_LARGE ? 28 : 16 }} showsVerticalScrollIndicator={false}>
      <Text style={s.sectionTitle}>📊 Ringkasan Bisnis</Text>
      <View style={[s.statsGrid, IS_WEB_LARGE && s.statsGridWeb]}>
        {[
          { icon: 'package-variant',        color: '#C68642', bg: '#FFF5E9', border: '#F0D4A8', value: products.filter(p => p.is_active).length,          label: 'Produk Aktif' },
          { icon: 'package-variant-closed', color: '#E74C3C', bg: '#FFF0F0', border: '#F0C4C4', value: products.filter(p => !p.is_active).length,         label: 'Non-Aktif'    },
          { icon: 'clipboard-text-outline', color: '#E67E22', bg: '#FFFBF0', border: '#F0E4C4', value: orders.filter(o => o.status !== 'Selesai').length,  label: 'Pesanan Baru' },
          { icon: 'check-circle',           color: '#4A7C59', bg: '#F0FFF4', border: '#C4E4D0', value: orders.filter(o => o.status === 'Selesai').length,  label: 'Selesai'      },
        ].map((item, i) => (
          <View key={i} style={[s.statsCard, { backgroundColor: item.bg, borderColor: item.border }]}>
            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            <Text style={[s.statsValue, { color: item.color }]}>{item.value}</Text>
            <Text style={s.statsLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      {[
        { icon: 'cash-multiple', color: '#C68642', value: `Rp ${totalPendapatan.toLocaleString()}`, label: 'Total Pendapatan'        },
        { icon: 'chart-line',    color: '#4A7C59', value: `Rp ${avgPesanan.toLocaleString()}`,      label: 'Rata-rata Nilai Pesanan' },
        { icon: 'account-group', color: '#8B6344', value: uniqueCustomers.length,                   label: 'Total Pelanggan Unik'    },
      ].map((item, i) => (
        <View key={i} style={s.statsCardFull}>
          <View style={s.statsIcon}>
            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={[s.statsValue, { color: '#3B1F0E', fontSize: 18 }]}>{item.value}</Text>
            <Text style={s.statsLabel}>{item.label}</Text>
          </View>
        </View>
      ))}
      {renderChartSection()}
      <TouchableOpacity style={s.refreshBtn} onPress={fetchData}>
        <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
        <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 10 }}>Perbarui Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── RENDER: Customers ───────────────────────────────────────────────────────
  const renderCustomers = () => (
    <FlatList
      data={uniqueCustomers}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={{ padding: 16 }}
      numColumns={IS_WEB_LARGE ? 2 : 1}
      key={IS_WEB_LARGE ? 'web' : 'mobile'}
      ListHeaderComponent={<Text style={s.sectionTitle}>👥 Data Pelanggan ({uniqueCustomers.length})</Text>}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <MaterialCommunityIcons name="account-off" size={64} color="#D4B896" />
          <Text style={{ color: '#B89070', marginTop: 12 }}>Belum ada data pelanggan</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[s.customerCard, IS_WEB_LARGE && { flex: 0.48, margin: 6 }]}>
          <View style={s.customerAvatar}>
            <Text style={s.customerAvatarText}>{item.customer_name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.custName}>{item.customer_name}</Text>
            <Text style={{ color: '#8B6344', fontSize: 13 }}>{item.phone_number}</Text>
            <Text style={{ color: '#C68642', fontSize: 12, marginTop: 2 }}>
              {orders.filter(o => o.phone_number === item.phone_number).length} pesanan
            </Text>
          </View>
          <TouchableOpacity style={s.waBtn} onPress={() => chatCustomer(item.phone_number)}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    />
  );

  // ─── RENDER: Products & Orders ───────────────────────────────────────────────
  const renderProductsOrders = () => (
    <FlatList
      data={activeTab === 'products' ? products : orders}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
      numColumns={IS_WEB_LARGE && activeTab === 'products' ? 2 : 1}
      key={`${activeTab}-${IS_WEB_LARGE}`}
      ListHeaderComponent={() => activeTab === 'products' && (
        <TouchableOpacity style={s.btnAdd} onPress={() => { setEditingProduct({}); setIsAdding(true); setModalVisible(true); }}>
          <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 8 }}>Tambah Produk Baru</Text>
        </TouchableOpacity>
      )}
      renderItem={({ item }) => activeTab === 'products' ? (
        <View style={[s.productCard, IS_WEB_LARGE && { flex: 0.48, margin: 6 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.nameText, !item.is_active && { color: '#B89070' }]}>
              {item.name} {!item.is_active && <Text style={{ fontSize: 11, color: '#E74C3C' }}>(Non-aktif)</Text>}
            </Text>
            <View style={s.categoryPill}>
              <Text style={s.categoryPillText}>{item.category || 'Tanpa Kategori'}</Text>
            </View>
            <Text style={s.priceText}>Rp {item.price?.toLocaleString()}</Text>
          </View>
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: item.is_active ? '#F0FFF4' : '#FFF0F0' }]} onPress={() => toggleStatus(item.id, item.is_active)}>
              <MaterialCommunityIcons name={item.is_active ? 'eye' : 'eye-off'} size={20} color={item.is_active ? '#4A7C59' : '#E74C3C'} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#F0F5FF' }]} onPress={() => { setEditingProduct(item); setIsAdding(false); setModalVisible(true); }}>
              <MaterialCommunityIcons name="pencil" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FFF0F0' }]} onPress={() => deleteProduct(item.id)}>
              <MaterialCommunityIcons name="trash-can" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.orderCard}>
          <View style={s.orderHeader}>
            <View style={s.customerAvatar}>
              <Text style={s.customerAvatarText}>{item.customer_name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.custName}>{item.customer_name}</Text>
              <Text style={{ color: '#8B6344', fontSize: 13 }}>{item.phone_number}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteOrder(item.id)}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#E74C3C" />
            </TouchableOpacity>
          </View>
          <View style={s.orderDivider} />
          <Text style={s.orderTotal}>Rp {item.total_price?.toLocaleString()}</Text>
          {item.extra_charge > 0 && (
            <Text style={{ color: '#E67E22', fontSize: 13, marginBottom: 4 }}>
              + Biaya tambahan: Rp {item.extra_charge?.toLocaleString()}
            </Text>
          )}
          {item.notes ? <Text style={{ color: '#8B6344', fontSize: 13, fontStyle: 'italic', marginBottom: 4 }}>📝 {item.notes}</Text> : null}
          {Array.isArray(item.items) && item.items.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              {item.items.map((itm, idx) => (
                <Text key={idx} style={{ color: '#8B6344', fontSize: 12 }}>
                  • {itm.name} {itm.qty ? `×${itm.qty}` : ''} — Rp {itm.price?.toLocaleString()}
                </Text>
              ))}
            </View>
          )}
          <View style={[s.statusBadge, { backgroundColor: item.status === 'Selesai' ? '#F0FFF4' : '#FFFBF0', borderColor: item.status === 'Selesai' ? '#4A7C59' : '#E67E22' }]}>
            <Text style={{ color: item.status === 'Selesai' ? '#4A7C59' : '#E67E22', fontWeight: 'bold', fontSize: 13 }}>
              {item.status === 'Selesai' ? '✅ Selesai' : '🔔 Baru'}
            </Text>
          </View>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnWA} onPress={() => chatCustomer(item.phone_number)}>
              <MaterialCommunityIcons name="whatsapp" size={16} color="#FFF" />
              <Text style={s.btnText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnEdit} onPress={() => { setEditingOrder({ ...item, _originalPrice: item.total_price - (item.extra_charge || 0) }); setOrderModalVisible(true); }}>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
              <Text style={s.btnText}>Edit</Text>
            </TouchableOpacity>
            {item.status !== 'Selesai' && (
              <TouchableOpacity style={s.btnDone} onPress={() => updateOrderStatus(item.id)}>
                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                <Text style={s.btnText}>Selesai</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  );

  // ─── RENDER: Lainnya ─────────────────────────────────────────────────────────
  const renderMore = () => (
    <ScrollView contentContainerStyle={{ padding: IS_WEB_LARGE ? 28 : 16 }}>
      <Text style={s.sectionTitle}>⚙️ Pengaturan & Fitur</Text>
      {[
        {
          icon: 'store-edit',
          color: '#3498DB',
          bg: '#EBF5FB',
          border: '#AED6F1',
          label: 'Profil UMKM',
          sub: 'Kelola nama, alamat & info toko',
          screen: 'ProfileUMKM',
        },
        {
          icon: 'tag-multiple',
          color: '#9B59B6',
          bg: '#F5EEF8',
          border: '#D2B4DE',
          label: 'Promo',
          sub: 'Atur diskon & promosi',
          screen: 'Promo',
        },
        {
          icon: 'file-chart',
          color: '#C68642',
          bg: '#FFF5E9',
          border: '#F0D4A8',
          label: 'Laporan',
          sub: 'Lihat laporan penjualan',
          screen: 'Laporan',
        },
      ].map((item, i) => (
        <TouchableOpacity
          key={i}
          style={[s.moreCard, { backgroundColor: item.bg, borderColor: item.border }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.8}
        >
          <View style={[s.moreIconWrap, { borderColor: item.border }]}>
            <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.moreLabel}>{item.label}</Text>
            <Text style={s.moreSub}>{item.sub}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#B89070" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ─── MAIN RETURN ─────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Tab Bar */}
      <View style={[s.tabBar, IS_WEB_LARGE && s.tabBarWeb]}>
        {[
          { key: 'home',      icon: 'home-outline',                  label: 'Home'      },
          { key: 'products',  icon: 'package-variant-closed',        label: 'Katalog'   },
          { key: 'orders',    icon: 'clipboard-text-outline',        label: 'Pesanan'   },
          { key: 'customers', icon: 'account-group-outline',         label: 'Pelanggan' },
          { key: 'more',      icon: 'dots-horizontal-circle-outline',label: 'Lainnya'   },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
          >
            <MaterialCommunityIcons name={tab.icon} size={IS_WEB_LARGE ? 24 : 22} color={activeTab === tab.key ? '#C68642' : '#B89070'} />
            <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#C68642" style={{ marginTop: 20 }} />}

      {activeTab === 'home'      && renderHome()}
      {activeTab === 'customers' && renderCustomers()}
      {(activeTab === 'products' || activeTab === 'orders') && renderProductsOrders()}
      {activeTab === 'more'      && renderMore()}

      {/* Modal Kalender */}
      <Modal visible={showCalendar} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <SimpleCalendar
            selectedDate={selectedDate}
            onSelectDate={(d) => { setSelectedDate(d); setShowCalendar(false); }}
            onClose={() => setShowCalendar(false)}
          />
        </View>
      </Modal>

      {/* Modal Produk */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{isAdding ? '➕ Tambah' : '✏️ Edit'} Produk</Text>
            <ScrollView>
              {['Nama Produk', 'Harga', 'Kategori', 'URL Gambar'].map((label, i) => {
                const keys = ['name', 'price', 'category', 'image_url'];
                return (
                  <View key={i}>
                    <Text style={s.inputLabel}>{label}</Text>
                    <TextInput
                      style={s.modalInput}
                      placeholder={label}
                      placeholderTextColor="#C4A882"
                      value={editingProduct[keys[i]]?.toString()}
                      onChangeText={t => setEditingProduct({ ...editingProduct, [keys[i]]: t })}
                      keyboardType={i === 1 ? 'numeric' : 'default'}
                    />
                  </View>
                );
              })}
              <TouchableOpacity style={s.btnSave} onPress={handleSaveProduct}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Simpan Produk</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Edit Pesanan */}
      <Modal visible={orderModalVisible} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>✏️ Edit Pesanan</Text>
            <Text style={{ color: '#8B6344', textAlign: 'center', marginBottom: 20 }}>{editingOrder.customer_name}</Text>
            <Text style={s.inputLabel}>Biaya Tambahan (Rp)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Contoh: 5000"
              placeholderTextColor="#C4A882"
              value={editingOrder.extra_charge?.toString()}
              onChangeText={t => setEditingOrder({ ...editingOrder, extra_charge: t })}
              keyboardType="numeric"
            />
            <Text style={s.inputLabel}>Catatan</Text>
            <TextInput
              style={[s.modalInput, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Catatan untuk pesanan..."
              placeholderTextColor="#C4A882"
              value={editingOrder.notes}
              onChangeText={t => setEditingOrder({ ...editingOrder, notes: t })}
              multiline
            />
            <View style={s.totalPreview}>
              <Text style={{ color: '#8B6344' }}>Total baru:</Text>
              <Text style={{ color: '#C68642', fontWeight: 'bold', fontSize: 16 }}>
                Rp {((editingOrder._originalPrice || 0) + (parseInt(editingOrder.extra_charge) || 0)).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity style={s.btnSave} onPress={handleSaveOrder}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Simpan Perubahan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOrderModalVisible(false)} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF5EC' },

  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2CDB0', elevation: 4, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  tabBarWeb: { paddingHorizontal: 40 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderColor: '#C68642' },
  tabLabel: { fontSize: 10, color: '#B89070', marginTop: 3 },
  tabLabelActive: { color: '#C68642', fontWeight: 'bold' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#3B1F0E', marginBottom: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  statsGridWeb: { flexWrap: 'wrap' },
  statsCard: { width: '48%', padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, elevation: 2, marginBottom: 10, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  statsCardFull: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2CDB0', backgroundColor: '#FBF5EC', elevation: 2, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  statsIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF5E9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2CDB0' },
  statsValue: { fontSize: 22, fontWeight: 'bold', color: '#3B1F0E', marginTop: 6 },
  statsLabel: { fontSize: 12, color: '#8B6344', marginTop: 4 },

  chartCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2CDB0', elevation: 3, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  chartCardWeb: { padding: 24 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#3B1F0E', marginTop: 12 },
  chartSubtitle: { fontSize: 11, color: '#B89070', marginBottom: 4 },
  emptyChart: { alignItems: 'center', paddingVertical: 40 },
  emptyChartText: { color: '#B89070', marginTop: 10, textAlign: 'center' },

  chartControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#F5EDE0', borderRadius: 10, padding: 3 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#C68642' },
  toggleText: { fontSize: 12, color: '#8B6344', fontWeight: '600' },
  toggleTextActive: { color: '#FFF' },
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#4A7C59' },
  periodText: { fontSize: 12, color: '#8B6344', fontWeight: 'bold' },
  periodTextActive: { color: '#FFF' },
  calBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E9', borderWidth: 1, borderColor: '#E2CDB0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  calBtnActive: { backgroundColor: '#C68642', borderColor: '#C68642' },
  clearDateBtn: { padding: 4 },

  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { fontSize: 11, color: '#8B6344', maxWidth: 80 },

  refreshBtn: { backgroundColor: '#C68642', padding: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3, marginBottom: 40 },

  btnAdd: { backgroundColor: '#C68642', marginBottom: 12, padding: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  productCard: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F0E4D0', elevation: 2, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
  nameText: { fontWeight: 'bold', fontSize: 15, color: '#3B1F0E', marginBottom: 4 },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: '#FFF5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#E2CDB0', marginBottom: 4 },
  categoryPillText: { fontSize: 11, color: '#8B6344', textTransform: 'capitalize' },
  priceText: { color: '#4A7C59', fontWeight: 'bold', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2CDB0' },

  orderCard: { backgroundColor: '#FFF', marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0E4D0', elevation: 2, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
  orderHeader: { flexDirection: 'row', alignItems: 'center' },
  orderDivider: { height: 1, backgroundColor: '#F0E4D0', marginVertical: 12 },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#3B1F0E', marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },
  btnWA: { backgroundColor: '#25D366', padding: 10, borderRadius: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnEdit: { backgroundColor: '#3B82F6', padding: 10, borderRadius: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnDone: { backgroundColor: '#C68642', padding: 10, borderRadius: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

  customerCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFF', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F0E4D0', elevation: 2 },
  customerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C68642', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  customerAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  custName: { fontWeight: 'bold', fontSize: 15, color: '#3B1F0E' },
  waBtn: { backgroundColor: '#25D366', padding: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Lainnya tab
  moreCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, elevation: 2, shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
  moreIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1 },
  moreLabel: { fontWeight: 'bold', fontSize: 16, color: '#3B1F0E', marginBottom: 3 },
  moreSub: { fontSize: 13, color: '#8B6344' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(59,31,14,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FBF5EC', width: IS_WEB_LARGE ? '50%' : '88%', padding: 24, borderRadius: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#E2CDB0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#3B1F0E' },
  inputLabel: { fontWeight: '600', marginBottom: 6, color: '#6B3F1F', fontSize: 13 },
  modalInput: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E2CDB0', color: '#3B1F0E', fontSize: 14 },
  totalPreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF5E9', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2CDB0', marginBottom: 16 },
  btnSave: { backgroundColor: '#C68642', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4, elevation: 3 },
});

const calStyles = StyleSheet.create({
  container: { backgroundColor: '#FBF5EC', borderRadius: 20, padding: 20, width: IS_WEB_LARGE ? 340 : 300, borderWidth: 1, borderColor: '#E2CDB0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn: { padding: 6, borderRadius: 8, backgroundColor: '#FFF5E9' },
  monthTitle: { fontWeight: 'bold', fontSize: 15, color: '#3B1F0E' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayName: { width: 36, textAlign: 'center', fontSize: 11, color: '#B89070', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginBottom: 2 },
  cellSelected: { backgroundColor: '#C68642' },
  cellToday: { borderWidth: 1.5, borderColor: '#C68642' },
  cellText: { fontSize: 13, color: '#3B1F0E' },
  closeBtn: { marginTop: 16, alignItems: 'center', padding: 8 },
});