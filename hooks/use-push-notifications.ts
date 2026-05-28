import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

const isExpoGo = Constants.appOwnership === 'expo';

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const registered = useRef(false);

  useEffect(() => {
    if (isExpoGo) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(app)/notifications');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isExpoGo || !isAuthenticated || registered.current) return;

    async function register() {
      if (!Device.isDevice) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#CC785C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        (Constants as any).easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      await api.post('/api/portal/notifications/register-device', {
        token: tokenData.data,
        platform: Platform.OS,
      });

      registered.current = true;
    }

    register().catch(() => {});
  }, [isAuthenticated]);
}
