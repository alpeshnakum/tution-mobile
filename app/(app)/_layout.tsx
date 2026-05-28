import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuthStore } from '@/lib/auth-store';
import { NoInternetBanner } from '@/components/shared/no-internet-banner';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import {
  HomeIcon, FeesIcon, AttendanceIcon, ResultsIcon, LeavesIcon,
  HomeworkIcon, TimetableIcon, ExamIcon, NoticesIcon, NotificationsIcon,
  ProfileIcon, SignOutIcon,
} from '@/components/icons';

const NAV_ITEMS = [
  { route: 'index',         label: 'Home',          Icon: HomeIcon },
  { route: 'fees',          label: 'Fees',           Icon: FeesIcon },
  { route: 'attendance',    label: 'Attendance',     Icon: AttendanceIcon },
  { route: 'results',       label: 'Results',        Icon: ResultsIcon },
  { route: 'leaves',        label: 'Leaves',         Icon: LeavesIcon },
  { route: 'homework',      label: 'Homework',       Icon: HomeworkIcon },
  { route: 'timetable',     label: 'Timetable',      Icon: TimetableIcon },
  { route: 'exams',         label: 'Exam Schedule',  Icon: ExamIcon },
  { route: 'notices',       label: 'Notices',        Icon: NoticesIcon },
  { route: 'notifications', label: 'Notifications',  Icon: NotificationsIcon },
  { route: 'profile',       label: 'Profile',        Icon: ProfileIcon },
] as const;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const activeRoute = props.state.routes[props.state.index]?.name ?? '';

  const handleNav = (route: string) => {
    props.navigation.closeDrawer();
    if (route === 'index') {
      router.push('/(app)/');
    } else {
      router.push(`/(app)/${route}` as any);
    }
  };

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View
        className="px-5 pt-12 pb-6"
        style={{ backgroundColor: '#CC785C' }}
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <HomeIcon size={28} color="#FFFFFF" />
        </View>
        <Text className="text-lg font-bold text-white mt-3">Student Portal</Text>
        {user && (
          <Text className="text-sm mt-0.5" style={{ color: '#FFFFFF' }}>
            {user.firstName} {user.lastName}
          </Text>
        )}
        {user?.role && (
          <View
            className="self-start rounded-full px-2.5 py-0.5 mt-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Text className="text-white text-xs font-medium capitalize">
              {user.role}
            </Text>
          </View>
        )}
      </View>

      {/* Nav items */}
      <ScrollView
        className="flex-1 px-3 py-3"
        style={{ backgroundColor: '#FFFFFF' }}
        showsVerticalScrollIndicator={false}
      >
        {NAV_ITEMS.map(({ route, label, Icon }) => {
          const isActive = activeRoute === route;
          return (
            <TouchableOpacity
              key={route}
              className="flex-row items-center gap-3 px-3 py-3 rounded-xl mb-0.5"
              style={isActive ? { backgroundColor: '#F5F4EE' } : { backgroundColor: 'transparent' }}
              onPress={() => handleNav(route)}
              activeOpacity={0.7}
            >
              <Icon size={20} color={isActive ? '#CC785C' : '#6B6862'} />
              <Text
                className="flex-1 text-sm"
                style={
                  isActive
                    ? { color: '#B8684F', fontWeight: '600' }
                    : { color: '###1F1E1D', fontWeight: '500' }
                }
              >
                {label}
              </Text>
              {isActive && (
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#CC785C' }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View
        className="border-t border-slate-100 px-3 py-4"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <TouchableOpacity
          className="flex-row items-center gap-3 px-3 py-3 rounded-xl"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <SignOutIcon size={20} color="#C44536" />
          <Text className="text-sm font-medium text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { user, studentId, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'parent' && !studentId) {
      router.replace('/(app)/select-child');
    }
  }, [user?.role, studentId]);

  usePushNotifications(isAuthenticated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NoInternetBanner />
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: 280 },
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="fees" />
        <Drawer.Screen name="attendance" />
        <Drawer.Screen name="results" />
        <Drawer.Screen name="leaves" />
        <Drawer.Screen name="profile" />
        <Drawer.Screen name="homework" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="timetable" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="notifications" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="notices" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="exams" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="edit-profile" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="change-password" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="select-child" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="receipt/[receiptNumber]" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
