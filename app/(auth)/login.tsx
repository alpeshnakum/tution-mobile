import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

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
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err?.response?.data?.message || err?.message || 'Invalid credentials',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Logo / Branding */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-indigo-500 rounded-3xl items-center justify-center mb-4 shadow-lg">
              <Text className="text-4xl">🎓</Text>
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
