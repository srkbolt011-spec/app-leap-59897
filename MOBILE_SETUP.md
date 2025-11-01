# LearnFlow Mobile App Setup Guide

This guide will help you set up and run LearnFlow as a native mobile application on iOS and Android.

## Prerequisites

### For iOS Development (macOS only)
- macOS (Monterey or later recommended)
- Xcode 14 or later
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account (for physical device testing and App Store distribution)

### For Android Development (Any OS)
- Android Studio (latest version)
- Android SDK (API level 22 or higher)
- Java Development Kit (JDK) 17 or higher
- Google Play Developer Account (for Play Store distribution)

### General Requirements
- Node.js (v18 or later)
- npm or yarn package manager
- Git

## Initial Setup

### 1. Export and Clone Repository

1. In Lovable, click the **"Export to Github"** button
2. Clone your repository to your local machine:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Native Platforms

```bash
# Add iOS platform (macOS with Xcode required)
npx cap add ios

# Add Android platform
npx cap add android
```

### 4. Update Native Platform Dependencies

```bash
# For iOS
npx cap update ios

# For Android
npx cap update android
```

## Development Workflow

### Hot Reload Development

During development, the app is configured to connect to the Lovable sandbox for hot reload:
- Make changes in Lovable
- Changes will automatically reflect in your mobile app
- No need to rebuild constantly

### Building for Testing

When you want to test the latest changes:

1. **Build the web assets:**
   ```bash
   npm run build
   ```

2. **Sync to native platforms:**
   ```bash
   npx cap sync
   ```

3. **Run on device/emulator:**
   ```bash
   # For iOS
   npx cap run ios

   # For Android
   npx cap run android
   ```

### After Pulling Updates from Git

Whenever you pull new changes from GitHub:

```bash
npm install           # Install any new dependencies
npm run build        # Build the latest web assets
npx cap sync         # Sync changes to native platforms
```

## Running the App

### iOS Simulator

```bash
npx cap run ios
```

This will:
- Open Xcode
- Build the project
- Launch in iOS Simulator

Alternatively, you can open the project manually:
```bash
npx cap open ios
```
Then run from Xcode (⌘+R)

### iOS Physical Device

1. Connect your iOS device via USB
2. Open the project in Xcode: `npx cap open ios`
3. Select your device from the device dropdown
4. Click the Run button (⌘+R)
5. First time: Trust the developer certificate on your device (Settings > General > Device Management)

### Android Emulator

```bash
npx cap run android
```

This will:
- Open Android Studio
- Build the project
- Launch in Android Emulator (if running)

Or open manually:
```bash
npx cap open android
```
Then run from Android Studio (Shift+F10)

### Android Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Run: `npx cap run android`
5. Select your device when prompted

## Native Features Implemented

LearnFlow includes the following native capabilities:

### Status Bar
- Adaptive styling that matches the app theme
- Configured in `capacitor.config.ts`

### Splash Screen
- Custom splash screen displays while app loads
- Auto-hides after initialization
- Configured in `capacitor.config.ts`

### Keyboard
- Smart keyboard management
- Accessory bar for better form navigation
- Configured in `capacitor.config.ts`

### Camera
- Take photos for profile pictures
- Pick from photo library
- Uses: `src/lib/mobileCapabilities.ts`

### Share
- Share certificates and course links
- Native share sheet integration
- Uses: `src/lib/mobileCapabilities.ts`

### Network
- Monitor connectivity status
- Handle offline scenarios
- Uses: `src/lib/mobileCapabilities.ts`

## Using Native Features in Code

### Taking Photos

```typescript
import { takePhoto, pickPhoto } from '@/lib/mobileCapabilities';

// Take a photo with camera
const photoDataUrl = await takePhoto();

// Pick from photo library
const photoDataUrl = await pickPhoto();
```

### Sharing Content

```typescript
import { shareContent } from '@/lib/mobileCapabilities';

await shareContent(
  'My Certificate',
  'Check out my certificate from LearnFlow!',
  'https://example.com/certificate'
);
```

### Checking Platform

```typescript
import { isNativePlatform, getPlatform } from '@/lib/mobileCapabilities';

if (isNativePlatform()) {
  console.log(`Running on native platform: ${getPlatform()}`);
}
```

### Network Status

```typescript
import { getNetworkStatus } from '@/lib/mobileCapabilities';

const status = await getNetworkStatus();
console.log('Connected:', status?.connected);
console.log('Connection Type:', status?.connectionType);
```

## Building for Production

### iOS Production Build

1. Open project in Xcode: `npx cap open ios`
2. Select "Any iOS Device (arm64)" as target
3. Product > Archive
4. Follow Xcode's distribution wizard for App Store or Ad Hoc distribution

**Requirements:**
- Apple Developer Program membership ($99/year)
- App Store Connect setup
- Provisioning profiles and certificates configured

### Android Production Build

1. Open project in Android Studio: `npx cap open android`
2. Build > Generate Signed Bundle / APK
3. Follow the wizard to create a release build
4. Upload to Google Play Console

**Requirements:**
- Google Play Developer account ($25 one-time fee)
- Keystore for signing the app
- Privacy policy and app content declarations

## Configuration Files

### capacitor.config.ts
Main Capacitor configuration including:
- App ID and name
- Plugin configurations
- Hot reload server settings (development)

### android/app/src/main/AndroidManifest.xml
Android-specific permissions and configurations:
- Camera permission
- Network state permission
- Storage permissions

### ios/App/App/Info.plist
iOS-specific configurations:
- Camera usage description
- Photo library usage description
- URL schemes

## Troubleshooting

### iOS Issues

**Error: "No code signing identity found"**
- Solution: Set up a team in Xcode (Project Settings > Signing & Capabilities)

**Error: "Could not launch <app>"**
- Solution: Trust the developer certificate on device (Settings > General > Device Management)

**CocoaPods issues**
- Solution: 
  ```bash
  cd ios/App
  pod repo update
  pod install
  cd ../..
  ```

### Android Issues

**Gradle build fails**
- Solution: Check Java version (should be JDK 17)
- Update Android Studio and SDK tools

**Device not detected**
- Solution: 
  - Enable USB Debugging
  - Install device drivers (Windows)
  - Run `adb devices` to verify connection

**App crashes on startup**
- Solution: Check Android Logcat in Android Studio for error messages

### General Issues

**Hot reload not working**
- Ensure the server URL in `capacitor.config.ts` is accessible from your device
- Try rebuilding: `npm run build && npx cap sync`

**Changes not appearing**
- Always run `npx cap sync` after building
- Clear app data on device and reinstall

**Native features not working**
- Check permissions in AndroidManifest.xml and Info.plist
- Verify plugin installation: `npm list @capacitor/<plugin-name>`

## App Store Submission

### iOS App Store

1. **Prepare Assets:**
   - App icons (all required sizes)
   - Screenshots for all device sizes
   - App preview videos (optional)

2. **Configure App Store Connect:**
   - Create app listing
   - Add description, keywords, screenshots
   - Set pricing and availability

3. **Submit for Review:**
   - Upload build via Xcode or Transporter
   - Submit for App Review
   - Respond to any feedback

**Review Time:** Typically 1-3 days

### Google Play Store

1. **Prepare Assets:**
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Screenshots for phone and tablet
   - Privacy policy URL

2. **Create Play Console Listing:**
   - Complete store listing
   - Add content ratings
   - Set pricing and distribution

3. **Submit for Review:**
   - Upload AAB file
   - Complete app content declarations
   - Submit for review

**Review Time:** Typically 1-3 days for first submission, faster for updates

## Support and Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Development:** https://developer.apple.com
- **Android Development:** https://developer.android.com
- **Lovable Docs:** https://docs.lovable.dev/features/mobile-apps

## Important Notes

- Always test on physical devices before production release
- Keep Capacitor and plugins updated regularly
- Monitor crash reports and user feedback after release
- Plan for regular updates and maintenance
- Consider implementing analytics and crash reporting (Firebase, Sentry)
