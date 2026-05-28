import { ScrollView, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';
import { ProfileIcon } from '@/components/icons';

export default function ProfileScreen() {
  const { user, logout, clearStudentContext } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Profile" showMenu />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 gap-4">
          {/* Avatar */}
          <View className="items-center py-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: '#F5EDE8' }}
            >
              <ProfileIcon size={40} color="#CC785C" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mt-3">
              {user?.firstName} {user?.lastName}
            </Text>
            <View
              className="rounded-full px-3 py-1 self-center mt-1"
              style={{ backgroundColor: '#F5EDE8' }}
            >
              <Text className="text-xs font-medium capitalize" style={{ color: '#9E5742' }}>
                {user?.role}
              </Text>
            </View>
          </View>

          {/* Info */}
          <Card>
            <Text className="text-sm font-semibold text-slate-900 mb-3">Account Details</Text>
            <View className="gap-3">
              {[
                { label: 'Username', value: user?.username },
                { label: 'Email',    value: user?.email },
                { label: 'Role',     value: user?.role },
              ].map(({ label, value }) => (
                <View key={label} className="flex-row justify-between items-center py-3 border-b border-slate-100">
                  <Text className="text-sm text-slate-500">{label}</Text>
                  <Text className="text-sm font-medium text-slate-900">{value || '-'}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Switch Child (parent only) */}
          {user?.role === 'parent' && (
            <Button
              title="Switch Child"
              variant="outline"
              onPress={async () => {
                await clearStudentContext();
                router.replace('/(app)/select-child');
              }}
            />
          )}

          <Button
            title="Change Password"
            variant="outline"
            onPress={() => router.push('/(app)/change-password')}
          />
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => router.push('/(app)/edit-profile')}
          />
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            style={{ borderColor: '#F5DCD8' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
