import { useState } from 'react';
import { ScrollView, View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { useProfileUpdate } from '@/hooks/use-profile-update';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { update, loading, error, reset } = useProfileUpdate();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (phone && !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
      errors.phone = 'Invalid phone number';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    reset();
    if (!validate()) return;
    const payload: Record<string, string> = {};
    if (phone.trim()) payload.phone = phone.trim();
    if (email.trim()) payload.email = email.trim();
    if (address.trim()) payload.address = address.trim();
    if (Object.keys(payload).length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Nothing to update',
        text2: 'Fill in at least one field to update.',
      });
      return;
    }
    try {
      await update(payload);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully.',
      });
      router.back();
    } catch {
      // error already set in hook
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FAF9F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F5' }}>
        <ScreenHeader title="Edit Profile" showBack />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 py-4 gap-4">
            <View className="rounded-xl px-4 py-3 border" style={{ backgroundColor: '#F5EBD1', borderColor: '#F5EBD1' }}>
              <Text className="text-xs" style={{ color: '#C89B3C' }}>Only phone, email, and address can be updated. Leave a field empty to keep the current value.</Text>
            </View>

            <Input
              label="Phone Number"
              placeholder="Enter new phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={fieldErrors.phone}
            />
            <Input
              label="Email"
              placeholder="Enter new email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.email}
            />
            <Input
              label="Address"
              placeholder="Enter new address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />

            {error ? (
              <Text className="text-sm text-red-500 text-center">{error}</Text>
            ) : null}

            <Button title="Save Changes" onPress={handleSave} loading={loading} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
