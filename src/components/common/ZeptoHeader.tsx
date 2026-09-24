import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile } from '../../types';
import { getTierInfo } from '../../utils/tierCalculator';

interface ZeptoHeaderProps {
  user: UserProfile;
  currentRole: 'customer' | 'owner';
  onLogout: () => void;
  onAddressPress?: () => void;
  onPreviewToggle?: () => void;
}

export const ZeptoHeader: React.FC<ZeptoHeaderProps> = ({
  user,
  currentRole,
  onLogout,
  onAddressPress,
  onPreviewToggle,
}) => {
  const insets = useSafeAreaInsets();
  const activeAddress =
    user.addresses[user.activeAddressId] || Object.values(user.addresses || {})[0];
  const tierInfo = getTierInfo(user.tierStatus, user.monthlyOrderCount);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      {/* Top Location & Account Row */}
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

        {/* User Account / Role Badge with Logout / Switch option */}
        <View style={styles.accountActionRow}>
          {currentRole === 'owner' ? (
            <Pressable style={styles.ownerBadge} onPress={onPreviewToggle}>
              <Text style={styles.ownerBadgeText}>🧑‍🌾 Owner Desk</Text>
            </Pressable>
          ) : (
            <View style={styles.userPhoneBadge}>
              <Text style={styles.userPhoneText}>
                {user.phone ? user.phone.slice(-5) : 'User'}
              </Text>
            </View>
          )}

          <Pressable
            style={styles.logoutBtn}
            onPress={onLogout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.logoutBtnText}>Switch</Text>
          </Pressable>
        </View>
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
  accountActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginRight: 6,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  userPhoneBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  userPhoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
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
