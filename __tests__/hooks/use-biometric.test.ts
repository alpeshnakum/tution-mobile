import { checkBiometricAvailable, authenticateWithBiometric } from '@/hooks/use-biometric';

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('@/lib/secure-storage', () => ({
  secureStorage: {
    getToken: jest.fn(),
  },
}));

import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '@/lib/secure-storage';

describe('use-biometric', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('checkBiometricAvailable', () => {
    it('returns false when no hardware', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      expect(await checkBiometricAvailable()).toBe(false);
    });

    it('returns false when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);
      expect(await checkBiometricAvailable()).toBe(false);
    });

    it('returns false when no saved token', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (secureStorage.getToken as jest.Mock).mockResolvedValue(null);
      expect(await checkBiometricAvailable()).toBe(false);
    });

    it('returns true when hardware + enrolled + token saved', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (secureStorage.getToken as jest.Mock).mockResolvedValue('token123');
      expect(await checkBiometricAvailable()).toBe(true);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('returns true on success', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
      expect(await authenticateWithBiometric()).toBe(true);
    });

    it('returns false on cancel/failure', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false, error: 'user_cancel' });
      expect(await authenticateWithBiometric()).toBe(false);
    });
  });
});
