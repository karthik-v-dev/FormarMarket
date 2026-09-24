import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile, Address } from '../../types';
import { saveUserAddress, setActiveAddress } from '../../services/firebaseRtdb';

interface AddressScreenProps {
  user: UserProfile;
  onBack: () => void;
}

export const AddressScreen: React.FC<AddressScreenProps> = ({ user, onBack }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flatNumber, setFlatNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('560034');
  const [city, setCity] = useState('Bengaluru');

  const addressesList = Object.values(user.addresses || {});

  const handleSelectActive = async (addressId: string) => {
    try {
      await setActiveAddress(user.uid, addressId);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAutoDetectLocation = () => {
    // Simulates instant auto-geolocation detection for quick-commerce
    setFlatNumber('Tower B, Flat 604');
    setStreet('Green Glen Layout, Bellandur');
    setLandmark('Near Lake View Jogging Track');
    setPincode('560103');
    setCity('Bengaluru');
    setModalVisible(true);
  };

  const handleSaveNewAddress = async () => {
    if (!flatNumber.trim() || !street.trim() || !pincode.trim()) {
      Alert.alert('Incomplete Address', 'Please fill Flat/House number, Street, and Pincode.');
      return;
    }

    const newId = `addr_${Date.now()}`;
    const newAddress: Address = {
      id: newId,
      tag,
      line1: `${flatNumber.trim()}, ${street.trim()}`,
      line2: landmark.trim() ? `Landmark: ${landmark.trim()}` : undefined,
      landmark: landmark.trim(),
      city: city.trim() || 'Bengaluru',
      state: 'Karnataka',
      pincode: pincode.trim(),
      isCurrentForDelivery: true, // Mark newly added as active for delivery
    };

    try {
      await saveUserAddress(user.uid, newAddress);
      setModalVisible(false);
      setFlatNumber('');
      setStreet('');
      setLandmark('');
      Alert.alert('Address Saved', 'New delivery address has been set as primary.');
    } catch (err: any) {
      Alert.alert('Error Saving Address', err.message);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 40 + Math.max(insets.bottom, 12) },
        ]}
      >
        {/* Auto Detect Location Card */}
        <Pressable style={styles.autoDetectCard} onPress={handleAutoDetectLocation}>
          <View style={styles.gpsIconCircle}>
            <Text style={styles.gpsIcon}>🎯</Text>
          </View>
          <View style={styles.gpsTextContainer}>
            <Text style={styles.gpsTitle}>Use Current Location (GPS)</Text>
            <Text style={styles.gpsSub}>Auto-fetch sector, society & PIN code</Text>
          </View>
          <Text style={styles.autoDetectArrow}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>

        {addressesList.map(addr => {
          const isActive = user.activeAddressId === addr.id || addr.isCurrentForDelivery;
          return (
            <Pressable
              key={addr.id}
              style={[styles.addressCard, isActive && styles.addressCardActive]}
              onPress={() => handleSelectActive(addr.id)}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.tagRow}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{addr.tag.toUpperCase()}</Text>
                  </View>
                  {isActive && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>PRIMARY FOR DELIVERY</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.line1}>{addr.line1}</Text>
                {addr.line2 ? <Text style={styles.line2}>{addr.line2}</Text> : null}
                <Text style={styles.cityPincode}>
                  {addr.city}, {addr.state} – {addr.pincode}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          style={styles.addNewAddressBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addNewAddressText}>+ Add New Address</Text>
        </Pressable>
      </ScrollView>

      {/* Add New Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView>
              {/* Tag Selector */}
              <Text style={styles.fieldLabel}>Save As</Text>
              <View style={styles.tagSelectorRow}>
                {(['Home', 'Work', 'Other'] as const).map(t => (
                  <Pressable
                    key={t}
                    style={[styles.tagOption, tag === t && styles.tagOptionSelected]}
                    onPress={() => setTag(t)}
                  >
                    <Text
                      style={[
                        styles.tagOptionText,
                        tag === t && styles.tagOptionTextSelected,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Form Fields */}
              <Text style={styles.fieldLabel}>Flat / House / Apartment No. *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Flat 302, Palm Heights"
                placeholderTextColor="#9CA3AF"
                value={flatNumber}
                onChangeText={setFlatNumber}
              />

              <Text style={styles.fieldLabel}>Street / Area / Sector *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5th Main, Koramangala 4th Block"
                placeholderTextColor="#9CA3AF"
                value={street}
                onChangeText={setStreet}
              />

              <Text style={styles.fieldLabel}>Nearby Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Opp. Water Tank / Near City Mart"
                placeholderTextColor="#9CA3AF"
                value={landmark}
                onChangeText={setLandmark}
              />

              <View style={styles.twoColumnRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Pincode *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>

              <Pressable style={styles.saveBtn} onPress={handleSaveNewAddress}>
                <Text style={styles.saveBtnText}>Save and Deliver Here</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  autoDetectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 18,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsIcon: {
    fontSize: 18,
  },
  gpsTextContainer: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C831F',
  },
  gpsSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  autoDetectArrow: {
    fontSize: 20,
    color: '#0C831F',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  addressCardActive: {
    borderColor: '#0C831F',
    backgroundColor: '#F0FDF4',
  },
  radioContainer: {
    marginRight: 10,
    paddingTop: 2,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#0C831F',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0C831F',
  },
  addressInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#374151',
  },
  primaryBadge: {
    backgroundColor: '#E8F7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0C831F',
  },
  line1: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  line2: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  cityPincode: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  addNewAddressBtn: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  addNewAddressText: {
    color: '#0C831F',
    fontWeight: '800',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tagOption: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  tagOptionSelected: {
    borderColor: '#0C831F',
    backgroundColor: '#E8F7EC',
  },
  tagOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tagOptionTextSelected: {
    color: '#0C831F',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 12,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
