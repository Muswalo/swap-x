# Manual Testing Checklist

## Critical User Flow 1: Complete Signup to Swap Creation

### Authentication Flow
- [ ] Open app and see onboarding screens
- [ ] Navigate through onboarding successfully
- [ ] Tap "Get Started" and reach sign up screen
- [ ] Enter valid email and password
- [ ] Successfully create account
- [ ] Verify email validation works
- [ ] Test password strength requirements
- [ ] Test error handling for existing email

### Profile Setup Flow
- [ ] After signup, reach profile setup screen
- [ ] Fill in all required fields (name, job title, ministry, district)
- [ ] Upload profile photo successfully
- [ ] Test photo picker functionality
- [ ] Verify all form validations work
- [ ] Save profile and proceed to next step

### Swap Creation Flow
- [ ] Reach swap creation screen
- [ ] Fill in current location details
- [ ] Fill in desired location details
- [ ] Add additional details and reason for swap
- [ ] Upload swap photos (optional)
- [ ] Submit swap successfully
- [ ] Verify swap appears on home screen
- [ ] Check swap status is "active"

### Expected Results
✅ User can complete entire flow from signup to seeing their swap on home screen
✅ All data persists correctly in database
✅ Profile photo displays correctly
✅ Swap appears in search results

---

## Critical User Flow 2: Messaging Functionality End-to-End

### Starting a Conversation
- [ ] Browse swaps on home screen
- [ ] Tap on a swap card
- [ ] View swap details screen
- [ ] Tap "Message" button
- [ ] Verify conversation is created
- [ ] Navigate to chat screen

### Sending Messages
- [ ] Type a message in the input field
- [ ] Send message successfully
- [ ] Verify message appears in chat
- [ ] Send multiple messages
- [ ] Test message ordering (chronological)
- [ ] Verify sender/receiver bubble styling

### Receiving Messages
- [ ] Have another user send a message
- [ ] Verify real-time message appears
- [ ] Check notification is received
- [ ] Tap notification to open chat
- [ ] Verify unread count updates
- [ ] Mark messages as read

### Messages List
- [ ] Navigate to Messages tab
- [ ] View all conversations
- [ ] Check conversation preview shows last message
- [ ] Verify unread indicators work
- [ ] Tap conversation to open chat
- [ ] Test search/filter functionality

### Real-time Features
- [ ] Test typing indicators appear
- [ ] Verify read receipts work
- [ ] Check message delivery status
- [ ] Test real-time updates without refresh

### Expected Results
✅ Messages send and receive in real-time
✅ Notifications work correctly
✅ Conversation list updates automatically
✅ Read status tracking works
✅ No message loss or duplication

---

## Critical User Flow 3: Profile Management and Settings

### Viewing Profile
- [ ] Tap avatar on home screen
- [ ] Navigate to profile screen
- [ ] Verify all profile data displays correctly
- [ ] Check profile photo loads
- [ ] View all profile sections (personal info, job details, bio)

### Editing Profile
- [ ] Tap "Edit Profile" button
- [ ] Modify first name
- [ ] Modify last name
- [ ] Update bio
- [ ] Change profile photo
- [ ] Save changes successfully
- [ ] Verify changes persist after app restart
- [ ] Check updated data appears everywhere

### Settings Navigation
- [ ] Navigate to Settings tab
- [ ] View all settings categories
- [ ] Tap each category to verify navigation
- [ ] Test back navigation works

### Notification Settings
- [ ] Open notification settings
- [ ] Toggle push notifications on/off
- [ ] Toggle message notifications
- [ ] Toggle match notifications
- [ ] Save settings
- [ ] Verify settings persist
- [ ] Test that notifications respect settings

### Account Settings
- [ ] Open account settings
- [ ] View account information
- [ ] Test password change flow
- [ ] Test email update flow
- [ ] View account deletion option
- [ ] Test logout functionality

### Help & Support
- [ ] Open help section
- [ ] View FAQ items
- [ ] Check contact information displays
- [ ] View app version
- [ ] Check legal information links

### Expected Results
✅ Profile updates save correctly
✅ Settings changes persist
✅ All navigation works smoothly
✅ Data consistency across app
✅ Settings affect app behavior correctly

---

## Additional Test Scenarios

### Swap Management
- [ ] View "My Swaps" screen
- [ ] Edit own swap
- [ ] Pause a swap
- [ ] Reactivate a swap
- [ ] Delete a swap with confirmation
- [ ] View swap interests received

### Swap Discovery
- [ ] Search for swaps by keyword
- [ ] Filter by ministry
- [ ] Filter by district
- [ ] Filter by area type
- [ ] View search results
- [ ] Clear filters

### Notifications
- [ ] Receive notification for new message
- [ ] Receive notification for swap interest
- [ ] Tap notification to navigate
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] View notification history

### Error Scenarios
- [ ] Test offline mode
- [ ] Test poor network conditions
- [ ] Test session expiration
- [ ] Test invalid data submission
- [ ] Test image upload failures
- [ ] Verify error messages are user-friendly

### Performance
- [ ] Test with 50+ swaps on home screen
- [ ] Test with 100+ messages in chat
- [ ] Test with 20+ conversations
- [ ] Check app responsiveness
- [ ] Monitor memory usage
- [ ] Check battery consumption

---

## Platform-Specific Testing

### iOS Testing
- [ ] Test on iPhone (various models)
- [ ] Test on iPad
- [ ] Verify iOS-specific UI elements
- [ ] Test push notifications on iOS
- [ ] Check keyboard behavior
- [ ] Test image picker on iOS
- [ ] Verify safe area handling

### Android Testing
- [ ] Test on various Android devices
- [ ] Test different Android versions
- [ ] Verify Android-specific UI elements
- [ ] Test push notifications on Android
- [ ] Check keyboard behavior
- [ ] Test image picker on Android
- [ ] Verify back button behavior

---

## Regression Testing

### After Each Change
- [ ] Verify authentication still works
- [ ] Check navigation doesn't break
- [ ] Test data persistence
- [ ] Verify real-time features work
- [ ] Check UI consistency

---

## Sign-off Criteria

All critical flows must pass:
- ✅ Signup to swap creation flow works end-to-end
- ✅ Messaging works with real-time updates
- ✅ Profile and settings management works correctly
- ✅ No critical bugs or crashes
- ✅ Performance is acceptable
- ✅ Works on both iOS and Android

## Notes
- Document any bugs found during testing
- Take screenshots of issues
- Note device/OS version for any platform-specific issues
- Record steps to reproduce any problems
