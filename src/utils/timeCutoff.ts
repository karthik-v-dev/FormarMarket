import { DeliverySlotOption } from '../types';

export const ORDER_CUTOFF_HOUR = 22; // 10:00 PM IST
export const STORE_OPEN_HOUR = 6;    // 6:00 AM IST

export interface CutoffStatus {
  isOpen: boolean;
  message: string;
  currentIstTimeStr: string;
  nextOpenTimeStr: string;
  nextDeliveryDateStr: string;
  nextDeliveryIsoDate: string;
}

/**
 * Returns the current date-time adjusted to Indian Standard Time (UTC +5:30)
 */
export function getIstDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 5.5);
}

/**
 * Checks if the store ordering window is open (strictly up to 10:00 PM / 22:00 IST)
 */
export function checkOrderCutoff(): CutoffStatus {
  const istDate = getIstDate();
  const currentHours = istDate.getHours();
  const currentMinutes = istDate.getMinutes();

  const formattedHours = currentHours % 12 || 12;
  const ampm = currentHours >= 12 ? 'PM' : 'AM';
  const minutePad = currentMinutes < 10 ? `0${currentMinutes}` : `${currentMinutes}`;
  const currentIstTimeStr = `${formattedHours}:${minutePad} ${ampm} IST`;

  // Calculate Next Day Delivery Date
  const tomorrow = new Date(istDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDeliveryIsoDate = tomorrow.toISOString().split('T')[0];
  const nextDeliveryDateStr = tomorrow.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Cutoff rule: accepted only up to 22:00 (10:00 PM) IST
  // Also if before 6:00 AM IST, store is preparing harvest
  if (currentHours >= ORDER_CUTOFF_HOUR) {
    return {
      isOpen: false,
      message: 'Orders closed for today after 10:00 PM IST. Next-day morning farm dispatch ordering reopens at 6:00 AM IST.',
      currentIstTimeStr,
      nextOpenTimeStr: 'Tomorrow at 6:00 AM IST',
      nextDeliveryDateStr,
      nextDeliveryIsoDate,
    };
  }

  if (currentHours < STORE_OPEN_HOUR) {
    return {
      isOpen: false,
      message: 'Farm inventory update in progress. Daily morning ordering starts at 6:00 AM IST.',
      currentIstTimeStr,
      nextOpenTimeStr: 'Today at 6:00 AM IST',
      nextDeliveryDateStr,
      nextDeliveryIsoDate,
    };
  }

  const hoursLeft = ORDER_CUTOFF_HOUR - 1 - currentHours;
  const minutesLeft = 60 - currentMinutes;

  return {
    isOpen: true,
    message: `Order now for tomorrow morning delivery! Cutoff in ${hoursLeft}h ${minutesLeft}m (10:00 PM IST).`,
    currentIstTimeStr,
    nextOpenTimeStr: 'Open now',
    nextDeliveryDateStr,
    nextDeliveryIsoDate,
  };
}

/**
 * Strict Next-Day Morning Delivery Slots constrained between 8:00 AM and 11:59 AM
 */
export const MORNING_DELIVERY_SLOTS: DeliverySlotOption[] = [
  {
    id: 'slot_8_00_9_30',
    title: 'Early Morning Fresh Drop',
    timeRange: '8:00 AM – 9:30 AM',
    isAvailable: true,
  },
  {
    id: 'slot_9_30_10_45',
    title: 'Morning Breakfast Slot',
    timeRange: '9:30 AM – 10:45 AM',
    isAvailable: true,
  },
  {
    id: 'slot_10_45_11_59',
    title: 'Late Morning Slot',
    timeRange: '10:45 AM – 11:59 AM',
    isAvailable: true,
  },
];
