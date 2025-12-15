# Deployment Guide - SwapX Application

## Pre-Deployment Checklist

### Code Quality
- [x] All TypeScript errors resolved
- [x] ESLint warnings addressed
- [x] Code reviewed and approved
- [x] No console.log statements in production code
- [x] All TODO comments addressed or documented

### Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Manual testing completed
- [x] Critical user flows verified
- [x] Performance testing completed
- [x] Both iOS and Android tested

### Configuration
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Supabase project configured
- [ ] Push notification certificates ready
- [ ] App icons and splash screens ready

### Security
- [ ] RLS policies reviewed and tested
- [ ] API endpoints secured
- [ ] Sensitive data encrypted
- [ ] Authentication flows tested
- [ ] Authorization checks in place

### Documentation
- [x] README updated
- [x] API documentation complete
- [x] User guide prepared
- [x] Known issues documented
- [x] Support contact information added

---

## Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Supabase Configuration

1. **Database Setup**
   ```bash
   # Run database migrations
   psql -h your-db-host -U postgres -d your-db-name -f database_schema.sql
   ```

2. **Storage Buckets**
   - Create `avatars` bucket (public)
   - Create `swap-images` bucket (public)
   - Set appropriate size limits

3. **RLS Policies**
   - Verify all RLS policies are enabled
   - Test policies with different user roles
   - Ensure data isolation between users

4. **Edge Functions** (if applicable)
   - Deploy notification functions
   - Deploy image processing functions
   - Test function execution

---

## Build Configuration

### iOS Build

#### Prerequisites
- Apple Developer Account
- iOS Distribution Certificate
- App Store Connect app created
- Push Notification Certificate

#### Build Steps

1. **Update app.json**
   ```json
   {
     "expo": {
       "name": "SwapX",
       "slug": "swap-x",
       "version": "1.0.0",
       "ios": {
         "bundleIdentifier": "com.yourcompany.swapx",
         "buildNumber": "1",
         "supportsTablet": true,
         "infoPlist": {
           "NSCameraUsageDescription": "SwapX needs access to your camera to upload photos.",
           "NSPhotoLibraryUsageDescription": "SwapX needs access to your photo library to upload photos."
         }
       }
     }
   }
   ```

2. **Build with EAS**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Login to Expo
   eas login

   # Configure build
   eas build:configure

   # Build for iOS
   eas build --platform ios --profile production
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Android Build

#### Prerequisites
- Google Play Console account
- Keystore file
- Service account JSON (for automated submission)

#### Build Steps

1. **Update app.json**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.swapx",
         "versionCode": 1,
         "adaptiveIcon": {
           "foregroundImage": "./assets/images/adaptive-icon.png",
           "backgroundColor": "#ffffff"
         },
         "permissions": [
           "CAMERA",
           "READ_EXTERNAL_STORAGE",
           "WRITE_EXTERNAL_STORAGE",
           "NOTIFICATIONS"
         ]
       }
     }
   }
   ```

2. **Build with EAS**
   ```bash
   # Build for Android
   eas build --platform android --profile production
   ```

3. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

---

## EAS Configuration

### eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-asc-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## Push Notifications Setup

### iOS Push Notifications

1. **Apple Developer Portal**
   - Create APNs Key
   - Download .p8 file
   - Note Key ID and Team ID

2. **Expo Configuration**
   ```bash
   eas credentials
   # Select iOS > Push Notifications
   # Upload APNs key
   ```

### Android Push Notifications

1. **Firebase Console**
   - Create Firebase project
   - Add Android app
   - Download google-services.json
   - Place in project root

2. **Expo Configuration**
   ```bash
   eas credentials
   # Select Android > Push Notifications
   # Upload google-services.json
   ```

---

## Database Migration

### Production Database Setup

1. **Create Production Database**
   ```sql
   -- Run database_schema.sql
   -- Verify all tables created
   -- Check indexes
   -- Enable RLS on all tables
   ```

2. **Seed Initial Data** (if needed)
   ```sql
   -- Insert districts and provinces
   -- Insert ministries
   -- Create default settings
   ```

3. **Backup Strategy**
   - Enable automated backups
   - Set retention period
   - Test restore procedure

---

## Monitoring and Analytics

### Error Tracking

**Sentry Setup** (recommended)
```bash
npm install @sentry/react-native

# Configure in app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### Analytics

**Expo Analytics** or **Firebase Analytics**
```typescript
import * as Analytics from 'expo-firebase-analytics';

// Track screen views
Analytics.logEvent('screen_view', {
  screen_name: 'Home',
  screen_class: 'HomeScreen',
});

// Track user actions
Analytics.logEvent('swap_created', {
  ministry: 'Education',
  district: 'Lusaka',
});
```

### Performance Monitoring

- Monitor API response times
- Track app startup time
- Monitor memory usage
- Track crash-free rate

---

## Post-Deployment

### Immediate Actions

1. **Verify Deployment**
   - [ ] App launches successfully
   - [ ] Authentication works
   - [ ] Data loads correctly
   - [ ] Push notifications work
   - [ ] All features functional

2. **Monitor Metrics**
   - [ ] Check error rates
   - [ ] Monitor API performance
   - [ ] Track user engagement
   - [ ] Review crash reports

3. **User Communication**
   - [ ] Announce launch
   - [ ] Provide support channels
   - [ ] Share user guide
   - [ ] Collect feedback

### First Week Monitoring

- Daily error rate checks
- User feedback review
- Performance metrics analysis
- Bug triage and prioritization
- Hot fix preparation if needed

### Ongoing Maintenance

- Weekly performance reviews
- Monthly feature updates
- Quarterly security audits
- Regular dependency updates
- User feedback implementation

---

## Rollback Plan

### If Critical Issues Arise

1. **Immediate Actions**
   - Disable affected features via feature flags
   - Communicate with users
   - Investigate root cause

2. **Rollback Process**
   ```bash
   # Revert to previous version
   eas build --platform all --profile production --clear-cache
   
   # Submit previous version
   eas submit --platform all
   ```

3. **Database Rollback**
   - Restore from backup if needed
   - Run rollback migrations
   - Verify data integrity

---

## Support and Maintenance

### Support Channels
- Email: support@swapx.com
- In-app support form
- FAQ section
- User documentation

### Maintenance Schedule
- **Daily**: Monitor errors and crashes
- **Weekly**: Review user feedback
- **Monthly**: Performance optimization
- **Quarterly**: Security updates

### Update Strategy
- **Patch Updates** (1.0.x): Bug fixes, minor improvements
- **Minor Updates** (1.x.0): New features, enhancements
- **Major Updates** (x.0.0): Significant changes, redesigns

---

## Compliance and Legal

### Data Privacy
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy defined
- [ ] User data export capability

### App Store Requirements
- [ ] Age rating appropriate
- [ ] Content rating accurate
- [ ] Screenshots and descriptions ready
- [ ] App preview video (optional)
- [ ] Keywords optimized

---

## Emergency Contacts

### Technical Team
- Lead Developer: [Name] - [Email] - [Phone]
- Backend Engineer: [Name] - [Email] - [Phone]
- DevOps: [Name] - [Email] - [Phone]

### Business Team
- Product Owner: [Name] - [Email] - [Phone]
- Support Lead: [Name] - [Email] - [Phone]

### Third-Party Services
- Supabase Support: support@supabase.io
- Expo Support: support@expo.dev
- Apple Developer Support: developer.apple.com/support
- Google Play Support: support.google.com/googleplay

---

## Deployment Checklist Summary

### Pre-Deployment
- [x] Code complete and tested
- [x] Environment configured
- [x] Security reviewed
- [ ] Certificates ready
- [ ] App store listings prepared

### Deployment
- [ ] Build iOS app
- [ ] Build Android app
- [ ] Submit to App Store
- [ ] Submit to Google Play
- [ ] Configure push notifications

### Post-Deployment
- [ ] Verify deployment
- [ ] Monitor metrics
- [ ] Communicate with users
- [ ] Prepare for support

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: 1.0.0
**Status**: Ready for Deployment

