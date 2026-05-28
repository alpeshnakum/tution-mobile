import { ScrollView, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';

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
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 gap-4">
          {/* Avatar */}
          <View className="items-center py-4">
            <View className="w-20 h-20 bg-primary-light rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-muted-foreground text-sm capitalize mt-0.5">{user?.role}</Text>
          </View>

          {/* Info */}
          <Card>
            <Text className="text-sm font-semibold text-foreground mb-3">Account Details</Text>
            <View className="gap-3">
              {[
                { label: 'Username', value: user?.username },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role },
              ].map(({ label, value }) => (
                <View key={label} className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">{label}</Text>
                  <Text className="text-sm font-medium text-foreground">{value || '-'}</Text>
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

          {/* Change Password */}
          <Button
            title="Change Password"
            variant="outline"
            onPress={() => router.push('/(app)/change-password')}
          />

          {/* Edit Profile */}
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => router.push('/(app)/edit-profile')}
          />

          {/* Logout */}
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            className="border-danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
