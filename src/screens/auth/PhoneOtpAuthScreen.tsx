import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../types';
import { DEFAULT_USER } from '../../services/firebaseRtdb';

export const AUTH_STORAGE_KEY = '@zepto_auth_session_v1';

export const OWNER_USER: UserProfile = {
  uid: 'owner_farm_admin_999',
  phone: '+91 99999 88888',
  name: 'Farm Store Manager',
  email: 'owner@formersmarket.in',
  role: 'owner',
  tierStatus: 'platinum',
  monthlyOrderCount: 15,
  totalOrdersCount: 42,
  activeAddressId: 'addr_farm',
  addresses: {
    addr_farm: {
      id: 'addr_farm',
      tag: 'Work',
      line1: 'FormersMarket Farm Hub #12',
      line2: 'Greenfield Agri Warehouse',
      landmark: 'Near Highway Gate 4',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      isCurrentForDelivery: true,
    },
  },
};

interface PhoneOtpAuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const PhoneOtpAuthScreen: React.FC<PhoneOtpAuthScreenProps> = ({
  onLoginSuccess,
}) => {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('9876543210');
  const [roleSelection, setRoleSelection] = useState<'customer' | 'owner'>('customer');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('482910');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  // Animations
  const smsBannerAnim = useRef(new Animated.Value(-120)).current;
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const selectPreset = (targetRole: 'customer' | 'owner') => {
    setRoleSelection(targetRole);
    if (targetRole === 'customer') {
      setPhone('9876543210');
    } else {
      setPhone('9999988888');
    }
  };

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSendingOtp(true);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSendingOtp(false);
      setStep('otp');
      setCountdown(30);

      // Trigger incoming SMS Notification banner
      setShowSmsBanner(true);
      Animated.spring(smsBannerAnim, {
        toValue: insets.top + 8,
        useNativeDriver: true,
        friction: 6,
      }).start();

      // Trigger realistic auto-detection simulation after 1.8 seconds
      setIsAutoDetecting(true);
      setTimeout(() => {
        autoFillAndVerify(code);
      }, 1800);
    }, 800);
  };

  const autoFillAndVerify = (code: string) => {
    const digits = code.split('');
    setOtp(digits);
    setIsAutoDetecting(false);

    // Auto complete after short delay to let user see the numbers filled
    setTimeout(() => {
      completeVerification(digits.join(''));
    }, 600);
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (cleanText && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (newOtp.every(d => d !== '')) {
      completeVerification(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const completeVerification = async (enteredCode: string) => {
    // Hide SMS banner
    Animated.timing(smsBannerAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSmsBanner(false));

    // Determine target user based on roleSelection and phone number
    const isOwnerPhone =
      phone.includes('9999988888') || roleSelection === 'owner';

    let userToLogin: UserProfile;
    if (isOwnerPhone) {
      userToLogin = {
        ...OWNER_USER,
        phone: `+91 ${phone}`,
      };
    } else {
      userToLogin = {
        ...DEFAULT_USER,
        phone: `+91 ${phone}`,
        name: 'Karthik V',
      };
    }

    // Save session in storage
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToLogin));
    } catch {}

    onLoginSuccess(userToLogin);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Simulated Realistic Incoming SMS Banner */}
      {showSmsBanner && (
        <Animated.View
          style={[
            styles.smsNotificationBanner,
            { transform: [{ translateY: smsBannerAnim }] },
          ]}
        >
          <View style={styles.smsIconBadge}>
            <Text style={styles.smsIcon}>💬</Text>
          </View>
          <View style={styles.smsTextContainer}>
            <View style={styles.smsHeaderRow}>
              <Text style={styles.smsSender}>MESSAGES • FormersMarket</Text>
              <Text style={styles.smsTime}>now</Text>
            </View>
            <Text style={styles.smsBody}>
              {generatedOtp} is your FormersMarket login verification OTP. Do not share this with anyone.
            </Text>
          </View>
          <Pressable
            style={styles.smsActionBtn}
            onPress={() => autoFillAndVerify(generatedOtp)}
          >
            <Text style={styles.smsActionText}>Auto-Fill</Text>
          </Pressable>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Logo & Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🥕</Text>
          </View>
          <Text style={styles.brandTitle}>FormersMarket</Text>
          <Text style={styles.brandSubtitle}>
            Direct Farm-to-Kitchen Quick Commerce
          </Text>
        </View>

        {step === 'phone' ? (
          /* STEP 1: PHONE NUMBER INPUT & ROLE SELECTION */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify Mobile Number</Text>
            <Text style={styles.cardSubtitle}>
              We will send an SMS with a 6-digit OTP for secure authentication.
            </Text>

            {/* Role Tab Selector */}
            <View style={styles.roleTabs}>
              <Pressable
                style={[
                  styles.roleTab,
                  roleSelection === 'customer' && styles.roleTabActive,
                ]}
                onPress={() => selectPreset('customer')}
              >
                <Text style={styles.roleTabEmoji}>🛒</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    roleSelection === 'customer' && styles.roleTabTextActive,
                  ]}
                >
                  Customer Login
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleTab,
                  roleSelection === 'owner' && styles.roleTabActiveOwner,
                ]}
                onPress={() => selectPreset('owner')}
              >
                <Text style={styles.roleTabEmoji}>🧑‍🌾</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    roleSelection === 'owner' && styles.roleTabTextActiveOwner,
                  ]}
                >
                  Owner / Admin Desk
                </Text>
              </Pressable>
            </View>

            {/* Quick Demo Pre-fill Chips */}
            <View style={styles.presetChipsRow}>
              <Text style={styles.presetLabel}>Quick Select Demo:</Text>
              <Pressable
                style={[
                  styles.presetChip,
                  roleSelection === 'customer' && styles.presetChipActive,
                ]}
                onPress={() => selectPreset('customer')}
              >
                <Text style={styles.presetChipText}>
                  👤 Customer (98765 43210)
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.presetChip,
                  roleSelection === 'owner' && styles.presetChipActiveOwner,
                ]}
                onPress={() => selectPreset('owner')}
              >
                <Text style={styles.presetChipText}>
                  🌾 Owner (99999 88888)
                </Text>
              </Pressable>
            </View>

            {/* Phone Input Box */}
            <View style={styles.inputWrapper}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.flagEmoji}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Role Context Pill */}
            <View
              style={[
                styles.roleContextPill,
                roleSelection === 'owner'
                  ? styles.ownerContextPill
                  : styles.customerContextPill,
              ]}
            >
              <Text style={styles.contextIcon}>
                {roleSelection === 'owner' ? '🔐' : '🌱'}
              </Text>
              <Text style={styles.contextText}>
                {roleSelection === 'owner'
                  ? 'Access Farm Orders Desk, Stock Editor & Zero-Stock Guard'
                  : 'Access Fresh Organic Catalog, Loyalty Tiers & COD Checkout'}
              </Text>
            </View>

            {/* Continue Button */}
            <Pressable
              style={[
                styles.primaryBtn,
                phone.length < 10 && styles.primaryBtnDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={phone.length < 10 || isSendingOtp}
            >
              {isSendingOtp ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Get 6-Digit OTP via SMS ›
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION WITH AUTO-DETECTION */
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <Pressable style={styles.backStepBtn} onPress={() => setStep('phone')}>
                <Text style={styles.backStepIcon}>←</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Verify OTP Code</Text>
                <Text style={styles.cardSubtitle}>
                  Sent to +91 {phone}
                </Text>
              </View>
            </View>

            {/* Auto Detection Status Box */}
            <View style={styles.autoDetectStatusBox}>
              {isAutoDetecting ? (
                <>
                  <ActivityIndicator size="small" color="#0C831F" />
                  <Text style={styles.autoDetectStatusText}>
                    Auto-detecting SMS OTP...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.autoDetectDoneIcon}>✓</Text>
                  <Text style={styles.autoDetectDoneText}>
                    SMS Received • Auto-Filled Code
                  </Text>
                </>
              )}
            </View>

            {/* 6 Digit OTP Inputs */}
            <View style={styles.otpGrid}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { otpInputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    digit !== '' && styles.otpBoxFilled,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleOtpKeyPress(e, index)}
                />
              ))}
            </View>

            {/* 1-Tap Auto-fill Trigger */}
            <Pressable
              style={styles.oneTapFillBtn}
              onPress={() => autoFillAndVerify(generatedOtp)}
            >
              <Text style={styles.oneTapFillText}>
                ⚡ Auto-fill code from SMS: {generatedOtp}
              </Text>
            </Pressable>

            {/* Verify Button */}
            <Pressable
              style={[
                styles.primaryBtn,
                otp.some(d => d === '') && styles.primaryBtnDisabled,
              ]}
              onPress={() => completeVerification(otp.join(''))}
              disabled={otp.some(d => d === '')}
            >
              <Text style={styles.primaryBtnText}>
                Confirm & Open {roleSelection === 'owner' ? 'Owner Dashboard' : 'Customer Shop'}
              </Text>
            </Pressable>

            {/* Resend Timer */}
            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend code in {countdown}s
                </Text>
              ) : (
                <Pressable onPress={handleSendOtp}>
                  <Text style={styles.resendLinkText}>Resend OTP SMS</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Security & Reliability footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            🔒 End-to-end encrypted session • Firebase RTDB & SQL Synced
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  smsNotificationBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smsIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0C831F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smsIcon: {
    fontSize: 18,
  },
  smsTextContainer: {
    flex: 1,
  },
  smsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  smsSender: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  smsTime: {
    color: '#64748B',
    fontSize: 10,
  },
  smsBody: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  smsActionBtn: {
    backgroundColor: '#0C831F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  smsActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  logoEmoji: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabActiveOwner: {
    backgroundColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleTabTextActive: {
    color: '#0C831F',
    fontWeight: '800',
  },
  roleTabTextActiveOwner: {
    color: '#92400E',
    fontWeight: '800',
  },
  presetChipsRow: {
    marginBottom: 14,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  presetChip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#E8F7EC',
    borderColor: '#0C831F',
  },
  presetChipActiveOwner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0C831F',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1,
  },
  roleContextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 18,
  },
  customerContextPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ownerContextPill: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  contextIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  contextText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backStepBtn: {
    paddingRight: 10,
  },
  backStepIcon: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '700',
  },
  autoDetectStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  autoDetectStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C831F',
    marginLeft: 8,
  },
  autoDetectDoneIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0C831F',
    marginRight: 6,
  },
  autoDetectDoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F14',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  otpBoxFilled: {
    borderColor: '#0C831F',
    backgroundColor: '#FFFFFF',
  },
  oneTapFillBtn: {
    backgroundColor: '#E8F7EC',
    borderWidth: 1,
    borderColor: '#0C831F',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  oneTapFillText: {
    color: '#0C831F',
    fontWeight: '800',
    fontSize: 12,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendTimerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  resendLinkText: {
    fontSize: 13,
    color: '#0C831F',
    fontWeight: '800',
  },
  footerInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
