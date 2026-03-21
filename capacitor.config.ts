import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.kivara',
  appName: 'Kivara',
  webDir: 'dist',
  server: {
    url: 'https://18620ef5-321f-449f-8aeb-b24fba50d28b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1a3a5c'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a3a5c',
      showSpinner: false
    }
  }
};

export default config;
