import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api, getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!username.trim()) { setError('Username or email is required'); return; }
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { username: username.trim() });
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp.trim()) { setError('OTP is required'); return; }
    if (!/^\d+$/.test(otp.trim())) { setError('OTP must contain digits only'); return; }
    if (newPassword.trim().length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword.trim() !== confirmPassword.trim()) { setError('Passwords do not match'); return; }
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        username: username.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      Alert.alert('Success', 'Password reset successfully. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScreenHeader title="Forgot Password" showBack />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6 gap-5">
            {step === 1 ? (
              <>
                <View className="bg-indigo-50 rounded-xl px-4 py-3">
                  <Text className="text-sm text-indigo-700">Enter your username or email. We'll send an OTP to your registered email address.</Text>
                </View>
                <Input
                  label="Username or Email"
                  placeholder="Enter your username or email"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {error && <Text className="text-sm text-red-500">{error}</Text>}
                <Button title="Send OTP" onPress={handleSendOtp} loading={loading} />
              </>
            ) : (
              <>
                <View className="bg-green-50 rounded-xl px-4 py-3">
                  <Text className="text-sm text-green-700">OTP sent to your registered email. Enter it below along with your new password.</Text>
                </View>
                <Input
                  label="OTP Code"
                  placeholder="Enter OTP from email"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />
                <Input
                  label="New Password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {error && <Text className="text-sm text-red-500">{error}</Text>}
                <Button title="Reset Password" onPress={handleReset} loading={loading} />
                <Button title="Resend OTP" variant="ghost" onPress={() => { setStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(null); }} />
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
