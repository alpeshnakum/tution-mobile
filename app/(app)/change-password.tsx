import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { api, getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async () => {
    setError(null);
    if (!currentPassword.trim()) { setError('Current password is required'); return; }
    if (newPassword.trim().length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setError('Passwords do not match'); return; }
    if (currentPassword.trim() === newPassword.trim()) { setError('New password must differ from current password'); return; }
    setLoading(true);
    try {
      await api.put('/api/auth/change-password', { currentPassword: currentPassword.trim(), newPassword: newPassword.trim() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password changed successfully.',
      });
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FAF9F5' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
        <ScreenHeader title="Change Password" showBack />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6 gap-4">
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <Input
              label="New Password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {error && <Text className="text-sm text-red-500 text-center">{error}</Text>}
            <Button title="Change Password" onPress={handleChange} loading={loading} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
