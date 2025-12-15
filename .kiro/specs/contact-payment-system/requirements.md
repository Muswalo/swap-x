# Requirements Document

## Introduction

This document specifies the requirements for a contact viewing payment system within the swap application. Users pay to view contact details of swap posters. The payment flow uses bottom modals for a smooth, direct experience. Pricing is straightforward: K2 for one contact, packages up to K15 for multiple contacts, and K50/month for unlimited viewing. The system uses mobile money for payments and stores data in two tables: one for transactions and one for contact access records.

## Glossary

- **Contact_Payment_System**: The system handling payment verification and contact access
- **Contact Options Modal**: Bottom modal showing options to message via app or view contact details
- **Payment Modal**: Bottom modal displaying payment options (K2, packages, K50/month)
- **Mobile Money Modal**: Bottom modal for entering phone number to process payment
- **transactions**: Database table storing all payment records
- **contact_access**: Database table storing which users have paid to view which contacts
- **K**: Zambian Kwacha currency unit

## Requirements

### Requirement 1

**User Story:** As a user, I want to tap "Contact" on a swap and choose how to reach the poster, so that I can decide between messaging in-app or viewing their contact details.

#### Acceptance Criteria

1. WHEN a user taps the "Contact" button on a swap THEN the Contact_Payment_System SHALL display a bottom modal with two options: "Message in App" and "View Contact Details"
2. WHEN a user selects "Message in App" THEN the Contact_Payment_System SHALL navigate to the chat screen with that user
3. WHEN a user selects "View Contact Details" and has paid for this contact THEN the Contact_Payment_System SHALL display the contact information
4. WHEN a user selects "View Contact Details" and has not paid THEN the Contact_Payment_System SHALL display the payment modal
5. IF a user views their own swap THEN the Contact_Payment_System SHALL show contact details without payment

### Requirement 2

**User Story:** As a user, I want to see simple payment options without confusing terms, so that I can quickly choose and pay.

#### Acceptance Criteria

1. WHEN the payment modal opens THEN the Contact_Payment_System SHALL display options in plain language: "K2 - View this contact", package options showing price and number of contacts, and "K50/month - View unlimited contacts"
2. WHEN displaying package options THEN the Contact_Payment_System SHALL show: "K5 - View 3 contacts", "K10 - View 6 contacts", "K15 - View 10 contacts"
3. WHEN displaying the K50 option THEN the Contact_Payment_System SHALL label it as "Best Value" and show "K50/month - View unlimited contacts"
4. WHEN a user has an active K50 subscription THEN the Contact_Payment_System SHALL skip the payment modal and show contact details directly
5. WHEN a user has remaining views from a package THEN the Contact_Payment_System SHALL show their balance and offer to use one view

### Requirement 3

**User Story:** As a user, I want to pay using mobile money, so that I can complete the transaction with my phone.

#### Acceptance Criteria

1. WHEN a user selects a payment option THEN the Contact_Payment_System SHALL display a bottom modal with a phone number input field
2. WHEN the mobile money modal opens THEN the Contact_Payment_System SHALL show the selected amount and a field to enter the mobile money number
3. WHEN a user enters their number and taps "Pay" THEN the Contact_Payment_System SHALL process the payment (placeholder for actual integration)
4. WHEN payment processing starts THEN the Contact_Payment_System SHALL display a loading state with "Processing payment..."
5. WHEN payment succeeds THEN the Contact_Payment_System SHALL close the modal and reveal the contact details
6. IF payment fails THEN the Contact_Payment_System SHALL display an error message and allow retry

### Requirement 4

**User Story:** As a user, I want contacts I've paid for to remain accessible, so that I don't pay twice for the same contact.

#### Acceptance Criteria

1. WHEN a user pays to view a contact THEN the Contact_Payment_System SHALL create a record in the contact_access table linking user_id to swap_id
2. WHEN a user opens a swap they have previously paid for THEN the Contact_Payment_System SHALL check the contact_access table and grant access
3. WHEN checking access THEN the Contact_Payment_System SHALL query contact_access for matching user_id and swap_id
4. WHEN a user has an active K50 subscription THEN the Contact_Payment_System SHALL grant access to all contacts without checking contact_access

### Requirement 5

**User Story:** As a user with a package, I want to track how many contacts I can still view, so that I know when to buy more.

#### Acceptance Criteria

1. WHEN a user purchases a package THEN the Contact_Payment_System SHALL store the number of views in the user's profile or a dedicated field
2. WHEN a user uses a view from their package THEN the Contact_Payment_System SHALL decrement their remaining views by one
3. WHEN a user's remaining views reach zero THEN the Contact_Payment_System SHALL require new payment for additional contacts
4. WHEN displaying the payment modal THEN the Contact_Payment_System SHALL show "You have X views remaining" if balance is greater than zero

### Requirement 6

**User Story:** As a system, I need to record all transactions, so that payments can be tracked and verified.

#### Acceptance Criteria

1. WHEN a payment is processed THEN the Contact_Payment_System SHALL insert a record into the transactions table with: id, user_id, amount, payment_type, phone_number, status, created_at
2. WHEN recording a transaction THEN the Contact_Payment_System SHALL set payment_type to one of: "single", "package_3", "package_6", "package_10", "subscription"
3. WHEN a payment succeeds THEN the Contact_Payment_System SHALL set transaction status to "completed"
4. IF a payment fails THEN the Contact_Payment_System SHALL set transaction status to "failed"
5. WHEN querying transactions THEN the Contact_Payment_System SHALL return records filtered by user_id

### Requirement 7

**User Story:** As a subscriber, I want my K50 subscription to last 30 days, so that I have unlimited access for a full month.

#### Acceptance Criteria

1. WHEN a user purchases the K50 subscription THEN the Contact_Payment_System SHALL set subscription_expires_at to 30 days from now
2. WHEN checking subscription status THEN the Contact_Payment_System SHALL compare current date to subscription_expires_at
3. WHEN subscription_expires_at is in the future THEN the Contact_Payment_System SHALL grant unlimited contact access
4. WHEN subscription_expires_at is in the past THEN the Contact_Payment_System SHALL require payment for contact views
5. WHEN displaying subscription status THEN the Contact_Payment_System SHALL show days remaining until expiry

### Requirement 8

**User Story:** As a user, I want the payment flow to be fast and not chase me away, so that I can complete my purchase without frustration.

#### Acceptance Criteria

1. WHEN displaying payment options THEN the Contact_Payment_System SHALL show all options on one screen without scrolling
2. WHEN a user taps a payment option THEN the Contact_Payment_System SHALL immediately show the mobile money input modal
3. WHEN processing payment THEN the Contact_Payment_System SHALL complete within 10 seconds or show a timeout message
4. WHEN payment completes THEN the Contact_Payment_System SHALL automatically show the contact details without extra taps
5. WHEN a user dismisses any modal THEN the Contact_Payment_System SHALL return to the swap details screen

