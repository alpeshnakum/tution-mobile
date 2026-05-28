import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { getErrorMessage } from '@/lib/api';
import { checkBiometricAvailable, authenticateWithBiometric } from '@/hooks/use-biometric';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GradCapIcon } from '@/components/icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loadFromStorage } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailable().then(setBiometricAvailable).catch(() => {});
  }, []);

  const handleBiometric = async () => {
    setBiometricLoading(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        await loadFromStorage();
        router.replace('/(app)');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Biometric Error',
        text2: getErrorMessage(err),
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = 'Username or email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      router.replace('/(app)');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FAF9F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Logo / Branding */}
          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{ backgroundColor: '#CC785C' }}
            >
              <GradCapIcon size={36} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">Student Portal</Text>
            <Text className="text-slate-500 text-base mt-1">Sign in to your account</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Input
              label="Username or Email"
              placeholder="Enter your username or email"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={errors.identifier}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mt-2"
            />
            <TouchableOpacity
              className="items-center py-2"
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text className="text-sm font-medium" style={{ color: '#CC785C' }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            {biometricAvailable && (
              <TouchableOpacity
                className="items-center py-3 gap-2"
                onPress={handleBiometric}
                disabled={biometricLoading}
                activeOpacity={0.7}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#F5F4EE' }}
                >
                  <GradCapIcon size={24} color="#CC785C" />
                </View>
                <Text className="text-sm text-slate-500">
                  {biometricLoading ? 'Authenticating...' : 'Sign in with biometrics'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View className="flex-1 justify-end items-center">
            <Text className="text-slate-400 text-sm text-center">
              Contact your school administrator{'\n'}if you need help logging in.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
