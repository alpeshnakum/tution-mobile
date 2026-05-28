import { Tabs, useRouter } from 'expo-router';
import { View, Text, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { LightColors, DarkColors } from '@/constants/colors';
import { useAuthStore } from '@/lib/auth-store';
import { NoInternetBanner } from '@/components/shared/no-internet-banner';
import { usePushNotifications } from '@/hooks/use-push-notifications';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppLayout() {
  const { user, studentId, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? DarkColors : LightColors;

  useEffect(() => {
    if (user?.role === 'parent' && !studentId) {
      router.replace('/(app)/select-child');
    }
  }, [user?.role, user, studentId]);

  usePushNotifications(isAuthenticated);

  return (
    <View className="flex-1">
      <NoInternetBanner />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: C.card,
          borderTopColor: C.border,
          paddingBottom: 8,
          paddingTop: 4,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💳" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📝" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{ href: null, title: 'Exam Schedule' }}
      />
      <Tabs.Screen
        name="notices"
        options={{ href: null, title: 'Notices' }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null, title: 'Notifications' }}
      />
      <Tabs.Screen
        name="homework"
        options={{ href: null, title: 'Homework' }}
      />
      <Tabs.Screen
        name="timetable"
        options={{ href: null, title: 'Timetable' }}
      />
      <Tabs.Screen
        name="change-password"
        options={{ href: null, title: 'Change Password' }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{ href: null, title: 'Edit Profile' }}
      />
      <Tabs.Screen
        name="select-child"
        options={{ href: null, title: 'Select Child' }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
    </View>
  );
}
