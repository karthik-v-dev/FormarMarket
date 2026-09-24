import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { UserProfile } from '../../types';
import { getTierInfo } from '../../utils/tierCalculator';

interface ZeptoHeaderProps {
  user: UserProfile;
  currentRole: 'customer' | 'owner';
  onToggleRole: () => void;
  onAddressPress?: () => void;
}

export const ZeptoHeader: React.FC<ZeptoHeaderProps> = ({
  user,
  currentRole,
  onToggleRole,
  onAddressPress,
}) => {
  const activeAddress = user.addresses[user.activeAddressId] || Object.values(user.addresses)[0];
  const tierInfo = getTierInfo(user.tierStatus, user.monthlyOrderCount);

  return (
    <View style={styles.container}>
      {/* Top Location & Role Switcher Row */}
      <View style={styles.topRow}>
        <Pressable style={styles.locationContainer} onPress={onAddressPress}>
          <View style={styles.locationPin}>
            <Text style={styles.pinIcon}>📍</Text>
          </View>
          <View style={styles.locationTextContainer}>
            <View style={styles.deliveryBadgeRow}>
              <Text style={styles.deliveryTitle}>DELIVERING TO</Text>
              <Text style={styles.tagBadge}>{activeAddress?.tag || 'Home'}</Text>
            </View>
            <Text style={styles.addressLine} numberOfLines={1}>
              {activeAddress
                ? `${activeAddress.line1}, ${activeAddress.city}`
                : 'Select delivery address'}
            </Text>
          </View>
          <Text style={styles.downChevron}>▾</Text>
        </Pressable>

        {/* Dual-Role Switcher Toggle */}
        <Pressable style={styles.roleToggle} onPress={onToggleRole}>
          <Text style={styles.roleToggleLabel}>
            {currentRole === 'customer' ? '🧑‍🌾 Owner Mode' : '🛒 Shop View'}
          </Text>
        </Pressable>
      </View>

      {/* Dynamic Tier Loyalty Badge Banner */}
      <View style={[styles.tierBanner, { backgroundColor: tierInfo.badgeBg }]}>
        <Text style={[styles.tierBadgeText, { color: tierInfo.badgeTextColor }]}>
          {tierInfo.badge}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pinIcon: {
    fontSize: 16,
  },
  locationTextContainer: {
    flex: 1,
  },
  deliveryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0C831F',
    letterSpacing: 0.5,
  },
  tagBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  addressLine: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  downChevron: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  roleToggle: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  tierBanner: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
