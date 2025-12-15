/**
 * Payment Service Utilities
 * 
 * Service functions for the contact payment system.
 * Handles contact access checks, subscription status, view balance management,
 * and contact access granting.
 */

import type { PaymentMethod, PaymentResult, PaymentType, SubscriptionStatus } from './payment.types';
import { isValidPaymentType } from './payment.types';
import { supabase } from './supabase';

/**
 * Check if a user has access to view contact details for a specific swap.
 * Queries the contact_access table for a matching user_id and swap_id.
 * 
 * Requirements: 4.2, 4.3
 * 
 * @param userId - The ID of the user requesting access
 * @param swapId - The ID of the swap to check access for
 * @returns Promise<boolean> - True if user has access, false otherwise
 */
export async function checkContactAccess(
  userId: string,
  swapId: string
): Promise<boolean> {
  if (!userId || !swapId) {
    return false;
  }

  const { data, error } = await supabase
    .from('contact_access')
    .select('id')
    .eq('user_id', userId)
    .eq('swap_id', swapId)
    .maybeSingle();

  if (error) {
    console.error('Error checking contact access:', error);
    return false;
  }

  return data !== null;
}


/**
 * Check the subscription status for a user.
 * Compares subscription_expires_at to the current date.
 * 
 * Requirements: 7.2, 7.3
 * 
 * @param userId - The ID of the user to check subscription for
 * @returns Promise<SubscriptionStatus> - Object containing isActive, expiresAt, and daysRemaining
 */
export async function checkSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    expiresAt: null,
    daysRemaining: 0,
  };

  if (!userId) {
    return defaultStatus;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking subscription status:', error);
    return defaultStatus;
  }

  if (!data || !data.subscription_expires_at) {
    return defaultStatus;
  }

  const expiresAt = new Date(data.subscription_expires_at);
  const now = new Date();
  const timeDiff = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  const isActive = timeDiff > 0;

  return {
    isActive,
    expiresAt,
    daysRemaining,
  };
}


/**
 * Get the remaining view balance for a user.
 * Queries the profiles table for views_remaining.
 * 
 * Requirements: 5.4
 * 
 * @param userId - The ID of the user to get balance for
 * @returns Promise<number> - The number of views remaining (0 if none or error)
 */
export async function getUserViewBalance(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('views_remaining')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error getting user view balance:', error);
    return 0;
  }

  return data?.views_remaining ?? 0;
}


/**
 * Update the view balance for a user by decrementing it.
 * Decrements views_remaining by the specified amount.
 * 
 * Requirements: 5.2
 * 
 * @param userId - The ID of the user to update balance for
 * @param amount - The amount to decrement (default: 1)
 * @returns Promise<boolean> - True if update succeeded, false otherwise
 */
export async function updateViewBalance(
  userId: string,
  amount: number = 1
): Promise<boolean> {
  if (!userId || amount < 0) {
    return false;
  }

  // First get current balance
  const currentBalance = await getUserViewBalance(userId);
  
  if (currentBalance < amount) {
    console.error('Insufficient view balance');
    return false;
  }

  const newBalance = currentBalance - amount;

  const { error } = await supabase
    .from('profiles')
    .update({ 
      views_remaining: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating view balance:', error);
    return false;
  }

  return true;
}


/**
 * Grant contact access to a user for a specific swap.
 * Inserts a record into the contact_access table.
 * 
 * Requirements: 4.1
 * 
 * @param userId - The ID of the user to grant access to
 * @param swapId - The ID of the swap to grant access for
 * @param paymentMethod - The payment method used ('single', 'package', or 'subscription')
 * @returns Promise<boolean> - True if access was granted, false otherwise
 */
export async function grantContactAccess(
  userId: string,
  swapId: string,
  paymentMethod: PaymentMethod = 'single'
): Promise<boolean> {
  if (!userId || !swapId) {
    return false;
  }

  // Check if access already exists
  const hasAccess = await checkContactAccess(userId, swapId);
  if (hasAccess) {
    return true; // Already has access
  }

  const { error } = await supabase
    .from('contact_access')
    .insert({
      user_id: userId,
      swap_id: swapId,
      payment_method: paymentMethod,
      granted_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error granting contact access:', error);
    return false;
  }

  return true;
}


/**
 * Process a payment for contact viewing.
 * Creates a transaction record with pending status, simulates payment processing,
 * and updates the transaction status based on the outcome.
 * 
 * Requirements: 3.3, 6.1
 * 
 * @param userId - The ID of the user making the payment
 * @param amount - The payment amount in Kwacha
 * @param phoneNumber - The mobile money phone number
 * @param paymentType - The type of payment (single, package_3, package_6, package_10, subscription)
 * @returns Promise<PaymentResult> - Object containing success status, transactionId, and error message
 */
export async function processPayment(
  userId: string,
  amount: number,
  phoneNumber: string,
  paymentType: PaymentType
): Promise<PaymentResult> {
  // Validate inputs
  if (!userId || !phoneNumber || amount <= 0) {
    return {
      success: false,
      transactionId: null,
      error: 'Invalid payment parameters',
    };
  }

  if (!isValidPaymentType(paymentType)) {
    return {
      success: false,
      transactionId: null,
      error: 'Invalid payment type',
    };
  }

  // Validate phone number format (basic validation for Zambian numbers)
  const phoneRegex = /^(\+?26)?0?[79]\d{8}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
    return {
      success: false,
      transactionId: null,
      error: 'Please enter a valid mobile money number',
    };
  }

  try {
    // Step 1: Create transaction record with pending status
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        payment_type: paymentType,
        phone_number: phoneNumber,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !transaction) {
      console.error('Error creating transaction:', insertError);
      return {
        success: false,
        transactionId: null,
        error: 'Failed to create transaction record',
      };
    }

    const transactionId = transaction.id;

    // Step 2: Simulate payment processing (placeholder for real mobile money integration)
    // In production, this would integrate with MTN Mobile Money, Airtel Money, etc.
    const paymentSuccess = await simulatePaymentProcessing(phoneNumber, amount);

    // Step 3: Update transaction status based on outcome
    const newStatus = paymentSuccess ? 'completed' : 'failed';
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      // Transaction was created but status update failed
      // Return success based on payment outcome, but log the error
    }

    if (!paymentSuccess) {
      return {
        success: false,
        transactionId: transactionId,
        error: 'Payment failed. Please check your balance and try again.',
      };
    }

    return {
      success: true,
      transactionId: transactionId,
      error: null,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      transactionId: null,
      error: 'An unexpected error occurred during payment processing',
    };
  }
}


/**
 * Simulate payment processing (placeholder for real mobile money integration).
 * In production, this would be replaced with actual API calls to payment providers.
 * 
 * @param phoneNumber - The mobile money phone number
 * @param amount - The payment amount
 * @returns Promise<boolean> - True if payment succeeded, false otherwise
 */
async function simulatePaymentProcessing(
  phoneNumber: string,
  amount: number
): Promise<boolean> {
  // Simulate network delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // For development/testing: always succeed
  // In production, this would be replaced with actual payment provider integration
  // e.g., MTN Mobile Money API, Airtel Money API, etc.
  return true;
}


/**
 * Handle a package purchase.
 * Processes the payment and adds views to the user's balance.
 * 
 * Requirements: 3.3, 5.1
 * 
 * @param userId - The ID of the user making the purchase
 * @param phoneNumber - The mobile money phone number
 * @param paymentType - The package type (package_3, package_6, or package_10)
 * @returns Promise<PaymentResult> - Object containing success status, transactionId, and error message
 */
export async function handlePackagePurchase(
  userId: string,
  phoneNumber: string,
  paymentType: 'package_3' | 'package_6' | 'package_10'
): Promise<PaymentResult> {
  // Validate payment type is a package
  if (!['package_3', 'package_6', 'package_10'].includes(paymentType)) {
    return {
      success: false,
      transactionId: null,
      error: 'Invalid package type',
    };
  }

  // Determine amount and views based on package type
  const packageConfig: Record<string, { amount: number; views: number }> = {
    package_3: { amount: 5, views: 3 },
    package_6: { amount: 10, views: 6 },
    package_10: { amount: 15, views: 10 },
  };

  const { amount, views } = packageConfig[paymentType];

  // Process the payment
  const paymentResult = await processPayment(userId, amount, phoneNumber, paymentType);

  if (!paymentResult.success) {
    return paymentResult;
  }

  // Add views to user's balance
  try {
    // Get current balance
    const currentBalance = await getUserViewBalance(userId);
    const newBalance = currentBalance + views;

    // Update the balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        views_remaining: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating view balance after package purchase:', updateError);
      // Payment succeeded but balance update failed
      // This is a critical error that should be logged for manual resolution
      return {
        success: true,
        transactionId: paymentResult.transactionId,
        error: 'Payment successful but views not added. Please contact support.',
      };
    }

    return {
      success: true,
      transactionId: paymentResult.transactionId,
      error: null,
    };
  } catch (error) {
    console.error('Error in handlePackagePurchase:', error);
    return {
      success: true,
      transactionId: paymentResult.transactionId,
      error: 'Payment successful but views not added. Please contact support.',
    };
  }
}


/**
 * Handle a subscription purchase.
 * Processes the payment and sets subscription_expires_at to 30 days from now.
 * 
 * Requirements: 7.1
 * 
 * @param userId - The ID of the user making the purchase
 * @param phoneNumber - The mobile money phone number
 * @returns Promise<PaymentResult> - Object containing success status, transactionId, and error message
 */
export async function handleSubscriptionPurchase(
  userId: string,
  phoneNumber: string
): Promise<PaymentResult> {
  const amount = 50; // K50 for subscription
  const paymentType: PaymentType = 'subscription';

  // Process the payment
  const paymentResult = await processPayment(userId, amount, phoneNumber, paymentType);

  if (!paymentResult.success) {
    return paymentResult;
  }

  // Set subscription expiry to 30 days from now
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating subscription expiry:', updateError);
      // Payment succeeded but subscription update failed
      // This is a critical error that should be logged for manual resolution
      return {
        success: true,
        transactionId: paymentResult.transactionId,
        error: 'Payment successful but subscription not activated. Please contact support.',
      };
    }

    return {
      success: true,
      transactionId: paymentResult.transactionId,
      error: null,
    };
  } catch (error) {
    console.error('Error in handleSubscriptionPurchase:', error);
    return {
      success: true,
      transactionId: paymentResult.transactionId,
      error: 'Payment successful but subscription not activated. Please contact support.',
    };
  }
}
