import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '../components/Icons';
import apiClient, { BASE_URL_STORAGE_KEY } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scheduleDaily7AMExpiryNotification } from '../services/notificationService';

export default function PantryScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Server Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiClient.get('/pantry');
      const loadedItems = res.data?.items || res.data?.data;
      if (res.data?.success && Array.isArray(loadedItems)) {
        setItems(loadedItems);
        scheduleDaily7AMExpiryNotification(loadedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('[Fetch Pantry Error]', err.message);
      setItems([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    loadCustomUrl();
  }, [fetchItems]);

  const loadCustomUrl = async () => {
    const saved = await AsyncStorage.getItem(BASE_URL_STORAGE_KEY);
    if (saved) setCustomServerUrl(saved);
  };

  const handleSaveServerUrl = async () => {
    if (!customServerUrl.trim()) {
      await AsyncStorage.removeItem(BASE_URL_STORAGE_KEY);
      Alert.alert('Reset', 'Server URL reset to default.');
    } else {
      await AsyncStorage.setItem(BASE_URL_STORAGE_KEY, customServerUrl.trim());
      Alert.alert('Saved', 'Server endpoint updated.');
    }
    setIsSettingsOpen(false);
    fetchItems();
  };

  const markUsed = async (id, name) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
    try {
      await apiClient.post(`/pantry/${id}/use`);
      Alert.alert('Saved! 🥗', `Marked "${name}" as consumed.`);
    } catch (e) {
      console.warn('[Mark used error]', e);
    }
  };

  const deleteItem = async (id, name) => {
    const executeDelete = async () => {
      setItems((prev) => prev.filter((i) => i._id !== id));
      try {
        await apiClient.delete(`/pantry/${id}`);
      } catch (e) {
        console.warn('[Delete item error]', e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to discard "${name}"?`)) {
        await executeDelete();
      }
    } else {
      Alert.alert('Discard Item', `Are you sure you want to remove "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  const getStatusBadge = (item) => {
    if (!item.expiryDate) return { label: 'Active', bg: COLORS.mintBg, color: COLORS.mintText };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(item.expiryDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', bg: COLORS.rust, color: '#FFFFFF' };
    if (diffDays === 0) return { label: 'Expires today', bg: COLORS.rust, color: '#FFFFFF' };
    if (diffDays <= 2) return { label: `${diffDays}d left`, bg: COLORS.rust, color: '#FFFFFF' };
    if (diffDays <= 5) return { label: `${diffDays}d left`, bg: COLORS.butterBg, color: COLORS.butterText };
    return { label: `${diffDays}d left`, bg: COLORS.mintBg, color: COLORS.mintText };
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>My Kitchen Pantry</Text>
          <Text style={styles.userSub}>
            {items.length} items logged • {user?.email || 'Demo Chef'}
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsSettingsOpen(true)}
            activeOpacity={0.8}
          >
            <Feather name="settings" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={17} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pantry items..."
            placeholderTextColor={COLORS.textSubtle}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading pantry items...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                fetchItems();
              }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🧺</Text>
              <Text style={styles.emptyTitle}>Pantry is Empty</Text>
              <Text style={styles.emptySub}>
                Use the "Scan" tab below to take a photo of groceries or expiry dates!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item);
            return (
              <View style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>
                      {item.category} • {item.quantity || '1 item'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                {item.notes ? (
                  <Text style={styles.itemNotes} numberOfLines={1}>
                    {item.notes}
                  </Text>
                ) : null}

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.useBtn}
                    onPress={() => markUsed(item._id, item.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.useBtnText}>✓ Mark Used</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => deleteItem(item._id, item.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.delBtnText}>✕ Discard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backend Connection</Text>
            <Text style={styles.modalSub}>
              Configure server API endpoint if testing over LAN or tunnel.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="https://schema-pro-crowd-she.trycloudflare.com/api"
              value={customServerUrl}
              onChangeText={setCustomServerUrl}
              autoCapitalize="none"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsSettingsOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveServerUrl}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getFallbackItems = () => [];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
  },
  greeting: {
    fontFamily: FONTS.serif,
    fontSize: 27,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  userSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  itemCategory: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  itemNotes: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  useBtn: {
    backgroundColor: COLORS.mintBg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
  },
  useBtnText: {
    color: COLORS.mintText,
    fontSize: 12.5,
    fontWeight: '700',
  },
  delBtn: {
    backgroundColor: COLORS.peachBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.peachBorder,
  },
  delBtnText: {
    color: COLORS.rust,
    fontSize: 12.5,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.rust,
    fontWeight: '700',
    fontSize: 13.5,
  },
});
