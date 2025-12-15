/**
 * Payment System Types
 * 
 * Type definitions for the contact payment system.
 * Requirements: 6.2
 */

/**
 * Payment type options
 * - single: K2 for one contact view
 * - package_3: K5 for 3 contact views
 * - package_6: K10 for 6 contact views
 * - package_10: K15 for 10 contact views
 * - subscription: K50/month for unlimited views
 */
export type PaymentType = 'single' | 'package_3' | 'package_6' | 'package_10' | 'subscription';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Payment method used for contact access
 */
export type PaymentMethod = 'single' | 'package' | 'subscription';

/**
 * Subscription status information
 */
export interface SubscriptionStatus {
  isActive: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
}

/**
 * Result of a payment operation
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  error: string | null;
}

/**
 * Contact details for a swap poster
 */
export interface ContactDetails {
  phoneNumber: string | null;
  email: string | null;
}

/**
 * Transaction record from database
 */
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  payment_type: PaymentType;
  phone_number: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Contact access record from database
 */
export interface ContactAccess {
  id: string;
  user_id: string;
  swap_id: string;
  granted_at: string;
  payment_method: PaymentMethod;
}

/**
 * Payment option displayed in the UI
 */
export interface PaymentOption {
  type: PaymentType;
  amount: number;
  views: number | 'unlimited';
  label: string;
  description: string;
  isBestValue?: boolean;
}

/**
 * Payment tier configuration
 */
export const PAYMENT_TIERS: PaymentOption[] = [
  {
    type: 'single',
    amount: 2,
    views: 1,
    label: 'K2',
    description: 'View this contact',
  },
  {
    type: 'package_3',
    amount: 5,
    views: 3,
    label: 'K5',
    description: 'View 3 contacts',
  },
  {
    type: 'package_6',
    amount: 10,
    views: 6,
    label: 'K10',
    description: 'View 6 contacts',
  },
  {
    type: 'package_10',
    amount: 15,
    views: 10,
    label: 'K15',
    description: 'View 10 contacts',
  },
  {
    type: 'subscription',
    amount: 50,
    views: 'unlimited',
    label: 'K50/month',
    description: 'View unlimited contacts',
    isBestValue: true,
  },
];

/**
 * Get views count for a payment type
 */
export function getViewsForPaymentType(type: PaymentType): number {
  switch (type) {
    case 'single':
      return 1;
    case 'package_3':
      return 3;
    case 'package_6':
      return 6;
    case 'package_10':
      return 10;
    case 'subscription':
      return 0; // Subscription doesn't use view count
    default:
      return 0;
  }
}

/**
 * Get amount for a payment type
 */
export function getAmountForPaymentType(type: PaymentType): number {
  switch (type) {
    case 'single':
      return 2;
    case 'package_3':
      return 5;
    case 'package_6':
      return 10;
    case 'package_10':
      return 15;
    case 'subscription':
      return 50;
    default:
      return 0;
  }
}

/**
 * Check if a payment type is valid
 */
export function isValidPaymentType(type: string): type is PaymentType {
  return ['single', 'package_3', 'package_6', 'package_10', 'subscription'].includes(type);
}
