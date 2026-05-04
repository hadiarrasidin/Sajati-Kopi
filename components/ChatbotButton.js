// ChatbotButton.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  FlatList, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, SafeAreaView
} from 'react-native';
import { supabase } from '../supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export default function ChatbotButton() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: 'Halo! Saya asisten Sajati Kopi ☕ Ada yang bisa saya bantu? Mau tanya menu, harga, atau rekomendasi?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuContext, setMenuContext] = useState('');
  const flatListRef = useRef(null);

  // Ambil data menu dari Supabase saat pertama kali dibuka
 useEffect(() => {
  fetchMenuContext();
}, []);

 const fetchMenuContext = async () => {
  console.log('fetchMenuContext dipanggil!');
  try {
     const { data, error } = await supabase
  .from('products')
  .select('name, price, category')
  .limit(50);

      console.log('Data Menu:', data);
      console.log('Error:', error);
      
      if (error) throw error;

      if (data && data.length > 0) {
        const menuText = data
          .map(item => `- ${item.name} (${item.category}): Rp${item.price?.toLocaleString('id-ID')} — ${item.description || ''}`)
          .join('\n');
        setMenuContext(menuText);
      }
    } catch (err) {
      console.log('Gagal fetch menu:', err.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Bangun history untuk Claude API
      const history = updatedMessages.slice(1).map(m => ({
        role: m.role,
        content: m.text,
      }));

      const systemPrompt = `Kamu adalah asisten virtual Sajati Kopi, sebuah kedai kopi. 
Kamu bisa membantu pelanggan dengan informasi menu, rekomendasi, dan pertanyaan umum.
Jawab dengan ramah, singkat, dan dalam bahasa Indonesia.

Berikut menu yang tersedia saat ini:
${menuContext || 'Data menu belum tersedia.'}

Jika ditanya di luar topik kopi/makanan, kamu tetap bisa menjawab sebagai asisten umum yang helpful.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile', // model gratis dari Groq
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history, // history chat yang sudah ada
    ],
  }),
});

const data = await response.json();

if (data.error) throw new Error(data.error.message);

const replyText = data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa menjawab saat ini.';
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.botText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabIcon}>☕</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>☕ Asisten Sajati Kopi</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#6B3F1F" />
                <Text style={styles.loadingText}>Sedang mengetik...</Text>
              </View>
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Ketik pesan..."
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.sendBtn, loading && { opacity: 0.5 }]}
                onPress={sendMessage}
                disabled={loading}
              >
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6B3F1F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 999,
  },
  fabIcon: { fontSize: 26 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  chatContainer: {
    height: '75%',
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6B3F1F',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { color: '#fff', fontSize: 18 },
  messageList: { padding: 12, paddingBottom: 8 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  userBubble: { backgroundColor: '#6B3F1F', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#EDE0D4', alignSelf: 'flex-start' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#3D1F0A' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  loadingText: { color: '#6B3F1F', fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0C9B3',
    backgroundColor: '#fff',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D4A97A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#3D1F0A',
  },
  sendBtn: {
    backgroundColor: '#6B3F1F',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 16 },
});