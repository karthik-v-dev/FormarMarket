import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkOrderCutoff } from '../../utils/timeCutoff';

export const DeliveryCutoffBanner: React.FC = () => {
  const cutoff = checkOrderCutoff();

  return (
    <View
      style={[
        styles.container,
        cutoff.isOpen ? styles.openContainer : styles.closedContainer,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{cutoff.isOpen ? '⏰' : '🌙'}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.titleText,
            cutoff.isOpen ? styles.openTitle : styles.closedTitle,
          ]}
        >
          {cutoff.isOpen
            ? 'NEXT-DAY MORNING HARVEST (8 AM – 11:59 AM)'
            : 'ORDERS CLOSED AFTER 10:00 PM IST'}
        </Text>
        <Text style={styles.subText}>{cutoff.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  openContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  closedContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  openTitle: {
    color: '#065F14',
  },
  closedTitle: {
    color: '#991B1B',
  },
  subText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginTop: 1,
  },
});
