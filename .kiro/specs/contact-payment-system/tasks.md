# Implementation Plan

- [x] 1. Set up database tables and types








  - [x] 1.1 Create SQL migration for transactions table


    - Create transactions table with id, user_id, amount, payment_type, phone_number, status, created_at, updated_at
    - Add indexes on user_id and status
    - _Requirements: 6.1, 6.2_

  - [x] 1.2 Create SQL migration for contact_access table

    - Create contact_access table with id, user_id, swap_id, granted_at, payment_method
    - Add unique constraint on (user_id, swap_id)
    - Add index on (user_id, swap_id)
    - _Requirements: 4.1, 4.3_

  - [x] 1.3 Create SQL migration to extend profiles table

    - Add views_remaining INTEGER DEFAULT 0
    - Add subscription_expires_at TIMESTAMP
    - _Requirements: 5.1, 7.1_

  - [x] 1.4 Create TypeScript types in lib/payment.types.ts

    - Define PaymentType, SubscriptionStatus, PaymentResult, ContactDetails interfaces
    - _Requirements: 6.2_

- [x] 2. Implement payment service functions





  - [x] 2.1 Create lib/payment.utils.ts with checkContactAccess function


    - Query contact_access table for user_id and swap_id match
    - Return boolean indicating access
    - _Requirements: 4.2, 4.3_

  - [ ]* 2.2 Write property test for contact access check
    - **Property 1: Paid users get contact access**
    - **Validates: Requirements 1.3, 4.2**

  - [x] 2.3 Create checkSubscriptionStatus function

    - Compare subscription_expires_at to current date
    - Return isActive, expiresAt, daysRemaining
    - _Requirements: 7.2, 7.3_
  - [ ]* 2.4 Write property test for subscription status
    - **Property 2: Active subscription grants unlimited access**
    - **Validates: Requirements 2.4, 4.4, 7.3**

  - [x] 2.5 Create getUserViewBalance function

    - Query profiles table for views_remaining
    - Return integer count
    - _Requirements: 5.4_

  - [x] 2.6 Create updateViewBalance function

    - Decrement views_remaining by specified amount
    - _Requirements: 5.2_
  - [ ]* 2.7 Write property test for view balance decrement
    - **Property 5: Package view decrement invariant**
    - **Validates: Requirements 5.2**

  - [x] 2.8 Create grantContactAccess function

    - Insert record into contact_access table
    - _Requirements: 4.1_
  - [ ]* 2.9 Write property test for contact access persistence
    - **Property 7: Contact access persistence**
    - **Validates: Requirements 4.1, 4.3**

- [x] 3. Implement payment processing





  - [x] 3.1 Create processPayment function (placeholder)


    - Accept userId, amount, phoneNumber, paymentType
    - Create transaction record with pending status
    - Simulate payment processing (placeholder for real integration)
    - Update transaction status to completed/failed
    - Return PaymentResult
    - _Requirements: 3.3, 6.1_
  - [ ]* 3.2 Write property test for transaction recording
    - **Property 6: Payment creates transaction record**
    - **Validates: Requirements 6.1**
  - [ ]* 3.3 Write property test for transaction status
    - **Property 4: Transaction status reflects payment outcome**
    - **Validates: Requirements 6.3, 6.4**

  - [x] 3.4 Create handlePackagePurchase function

    - Process payment and add views to user balance
    - _Requirements: 3.3, 5.1_

  - [x] 3.5 Create handleSubscriptionPurchase function

    - Process payment and set subscription_expires_at to 30 days from now
    - _Requirements: 7.1_
  - [ ]* 3.6 Write property test for subscription expiry
    - **Property 8: Subscription expiry is 30 days**
    - **Validates: Requirements 7.1**

- [x] 4. Checkpoint - Ensure all service tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create UI components





  - [x] 5.1 Create ContactOptionsModal component


    - Bottom modal with "Message in App" and "View Contact Details" buttons
    - Handle option selection callbacks
    - _Requirements: 1.1, 1.2_
  - [x] 5.2 Create PaymentModal component


    - Display payment options: K2, K5, K10, K15, K50
    - Show "Best Value" badge on K50 option
    - Show remaining views if user has balance
    - Handle option selection
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  - [x] 5.3 Create MobileMoneyModal component


    - Phone number input field
    - Display selected amount
    - Pay button with loading state
    - Error message display
    - _Requirements: 3.1, 3.2, 3.4_
  - [x] 5.4 Create ContactDetailsView component


    - Display phone number and email
    - Copy to clipboard functionality
    - _Requirements: 1.3_

- [x] 6. Integrate payment flow into swap-details screen







  - [x] 6.1 Add state management for modals




    - Track which modal is open
    - Track selected payment option
    - Track payment processing state
    - _Requirements: 1.1_


  - [x] 6.2 Replace current Contact button with new flow

    - On tap, check if own swap (show details directly)
    - Otherwise open ContactOptionsModal
    - _Requirements: 1.1, 1.5_

  - [x] 6.3 Implement "Message in App" flow

    - Navigate to chat screen with swap poster
    - _Requirements: 1.2_

  - [x] 6.4 Implement "View Contact Details" flow

    - Check access via checkContactAccess
    - Check subscription via checkSubscriptionStatus
    - If access granted, show ContactDetailsView
    - If no access, open PaymentModal
    - _Requirements: 1.3, 1.4, 2.4_

  - [x] 6.5 Implement payment option selection

    - On option select, open MobileMoneyModal with amount
    - _Requirements: 3.1_

  - [x] 6.6 Implement payment submission

    - Call processPayment with phone number
    - On success, grant access and show contact details
    - On failure, show error and allow retry
    - _Requirements: 3.3, 3.5, 3.6_
  - [ ]* 6.7 Write property test for successful payment flow
    - **Property 3: Successful payment reveals contact**
    - **Validates: Requirements 3.5, 8.4**

- [ ] 7. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Add subscription and balance management
  - [ ] 8.1 Add subscription status display to settings
    - Show active/expired status
    - Show days remaining if active
    - _Requirements: 5.3, 7.5_
  - [ ] 8.2 Add view balance display to payment modal
    - Show "You have X views remaining" when balance > 0
    - Offer to use one view instead of paying
    - _Requirements: 5.4_
  - [ ] 8.3 Implement use-view-from-balance flow
    - Decrement balance and grant access
    - _Requirements: 5.2, 5.3_
  - [ ]* 8.4 Write property test for expired subscription
    - **Property 9: Expired subscription requires payment**
    - **Validates: Requirements 7.4**

- [ ] 9. Add transaction query functionality
  - [ ] 9.1 Create getTransactionHistory function
    - Query transactions by user_id
    - Return sorted by created_at descending
    - _Requirements: 6.5_
  - [ ]* 9.2 Write property test for transaction query
    - **Property 10: Transaction query returns user's records only**
    - **Validates: Requirements 6.5**
  - [ ]* 9.3 Write property test for payment type validation
    - **Property 11: Valid payment types only**
    - **Validates: Requirements 6.2**

- [ ] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
