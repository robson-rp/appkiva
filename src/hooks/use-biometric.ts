import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Dynamic import to avoid errors on web
let NativeBiometric: any = null;
if (Capacitor.isNativePlatform()) {
  import('capacitor-native-biometric').then(mod => {
    NativeBiometric = mod.NativeBiometric;
  });
}

const BIOMETRIC_ENABLED_KEY = 'kivara-biometric-enabled';
const BIOMETRIC_SERVER = 'kivara-app';

export type BiometricAction = 'login' | 'transaction' | 'vault';

const REASON_MAP: Record<BiometricAction, Record<string, string>> = {
  login: {
    pt: 'Confirma a tua identidade para entrar',
    en: 'Confirm your identity to sign in',
  },
  transaction: {
    pt: 'Confirma a tua identidade para autorizar a transacção',
    en: 'Confirm your identity to authorize the transaction',
  },
  vault: {
    pt: 'Confirma a tua identidade para aceder ao cofre',
    en: 'Confirm your identity to access the vault',
  },
};

export function useBiometric() {
  const isNative = Capacitor.isNativePlatform();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('biometric');

  useEffect(() => {
    if (!isNative) return;

    const check = async () => {
      try {
        if (!NativeBiometric) {
          const mod = await import('capacitor-native-biometric');
          NativeBiometric = mod.NativeBiometric;
        }
        
        const result = await NativeBiometric.isAvailable();
        setIsAvailable(result.isAvailable);
        
        // Determine type for display
        if (result.biometryType === 1) setBiometryType('Touch ID');
        else if (result.biometryType === 2) setBiometryType('Face ID');
        else if (result.biometryType === 3) setBiometryType('Iris');
        else setBiometryType('Biometria');
      } catch {
        setIsAvailable(false);
      }
    };

    check();
    setIsEnabled(localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true');
  }, [isNative]);

  /** Prompt user for biometric verification */
  const verify = useCallback(async (action: BiometricAction, lang = 'pt'): Promise<boolean> => {
    if (!isNative || !isAvailable || !NativeBiometric) return true; // pass-through on web

    try {
      await NativeBiometric.verifyIdentity({
        reason: REASON_MAP[action]?.[lang] || REASON_MAP[action]?.pt || 'Confirma a tua identidade',
        title: 'Kivara',
        subtitle: '',
        description: '',
      });
      return true;
    } catch {
      return false;
    }
  }, [isNative, isAvailable]);

  /** Save credentials to device secure storage */
  const saveCredentials = useCallback(async (username: string, password: string) => {
    if (!isNative || !NativeBiometric) return;

    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: BIOMETRIC_SERVER,
      });
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      setIsEnabled(true);
    } catch (e) {
      console.error('[biometric] Failed to save credentials:', e);
    }
  }, [isNative]);

  /** Retrieve saved credentials */
  const getCredentials = useCallback(async (): Promise<{ username: string; password: string } | null> => {
    if (!isNative || !NativeBiometric) return null;

    try {
      const credentials = await NativeBiometric.getCredentials({ server: BIOMETRIC_SERVER });
      return credentials;
    } catch {
      return null;
    }
  }, [isNative]);

  /** Remove saved credentials */
  const clearCredentials = useCallback(async () => {
    if (!isNative || !NativeBiometric) return;

    try {
      await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
      localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(false);
    } catch (e) {
      console.error('[biometric] Failed to clear credentials:', e);
    }
  }, [isNative]);

  const toggleEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
    setIsEnabled(enabled);
  }, []);

  return {
    isNative,
    isAvailable,
    isEnabled,
    biometryType,
    verify,
    saveCredentials,
    getCredentials,
    clearCredentials,
    toggleEnabled,
  };
}
