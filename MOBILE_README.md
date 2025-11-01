# 📱 LearnFlow Mobile App - Quick Start

LearnFlow is now configured as a native mobile application! This guide will get you started quickly.

## 🚀 Quick Start (For Testing on Your Computer)

1. **Export to GitHub** (in Lovable, click "Export to Github")
2. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   npm install
   ```

3. **Add platforms:**
   ```bash
   npx cap add ios      # Mac only - requires Xcode
   npx cap add android  # Requires Android Studio
   ```

4. **Build and run:**
   ```bash
   npm run build
   npx cap sync
   npx cap run ios      # or: npx cap run android
   ```

## 📖 Complete Documentation

See **MOBILE_SETUP.md** for:
- Detailed prerequisites
- Platform-specific setup (iOS & Android)
- Native features usage (camera, sharing, etc.)
- Troubleshooting guide
- App Store submission process

## ✨ Features Enabled

Your app now has access to:
- ✅ Native status bar styling
- ✅ Custom splash screen
- ✅ Camera access (profile pictures)
- ✅ Photo library
- ✅ Native sharing
- ✅ Network status monitoring
- ✅ Keyboard management
- ✅ Hot reload during development

## 🔥 Hot Reload Development

While developing:
- Make changes in Lovable
- Changes automatically appear in your mobile app
- No constant rebuilding needed!

## 📝 Important Commands

```bash
npm run build        # Build web assets
npx cap sync         # Sync to native platforms
npx cap open ios     # Open in Xcode
npx cap open android # Open in Android Studio
```

## 💡 After Git Pull

Always run after pulling updates:
```bash
npm install
npm run build
npx cap sync
```

## 🆘 Need Help?

- **Full Guide:** See MOBILE_SETUP.md
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Lovable Mobile Docs:** https://docs.lovable.dev/tips-tricks/capacitor

## 🎯 Next Steps

1. **Test on Emulator/Simulator** - Use the commands above
2. **Test on Physical Device** - Connect via USB (see MOBILE_SETUP.md)
3. **Prepare for App Stores** - See production build section in MOBILE_SETUP.md

---

**Ready to deploy to app stores?** Check MOBILE_SETUP.md for complete App Store and Play Store submission guides!
