import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';

export const initializeMobileCapabilities = async () => {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set initial status bar based on current theme
    await updateStatusBarForTheme();

    // Hide splash screen after app loads
    await SplashScreen.hide();

    // Configure keyboard behavior
    await Keyboard.setAccessoryBarVisible({ isVisible: true });
    
    // Listen for keyboard events to adjust layout
    Keyboard.addListener('keyboardWillShow', info => {
      console.log('Keyboard will show with height:', info.keyboardHeight);
      // Adjust layout if needed by adding a CSS class
      document.body.classList.add('keyboard-open');
      // Set CSS variable for keyboard height
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
      // Reset layout
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    });

    // Monitor network status
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      
      // Dispatch custom event for network status changes
      window.dispatchEvent(new CustomEvent('networkStatusChange', { 
        detail: status 
      }));
      
      // Update online/offline status
      if (status.connected) {
        window.dispatchEvent(new Event('online'));
      } else {
        window.dispatchEvent(new Event('offline'));
      }
    });

    // Listen for theme changes
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        updateStatusBarForTheme();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

  } catch (error) {
    console.error('Error initializing mobile capabilities:', error);
  }
};

export const updateStatusBarForTheme = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const isDark = document.documentElement.classList.contains('dark');
    
    // Make status bar overlay content for edge-to-edge experience
    await StatusBar.setOverlaysWebView({ overlay: true });
    
    // Set status bar style based on theme
    await StatusBar.setStyle({ 
      style: isDark ? Style.Dark : Style.Light 
    });
    
    // For Android, set background color based on theme
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ 
        color: isDark ? '#1a0f2e' : '#ffffff' 
      });
    }
  } catch (error) {
    console.error('Error updating status bar:', error);
  }
};

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Camera utilities
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return image.dataUrl;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const pickPhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    return image.dataUrl;
  } catch (error) {
    console.error('Error picking photo:', error);
    return null;
  }
};

// Share utilities
import { Share } from '@capacitor/share';

export const shareContent = async (title: string, text: string, url?: string) => {
  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share',
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

// Network utilities
export const getNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Error getting network status:', error);
    return null;
  }
};
