import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '@/lib/secure-storage';

export async function checkBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;
  const token = await secureStorage.getToken();
  return !!token;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Sign in with biometrics',
    fallbackLabel: 'Use password',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}
