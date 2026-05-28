import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { api, getErrorMessage } from '@/lib/api';
import { ScreenHeader } from '@/components/shared/screen-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LEAVE_TYPES = ['sick', 'personal', 'family', 'other'];

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const { studentId } = useAuthStore();

  const [leaveType, setLeaveType] = useState('sick');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      setError('All fields are required');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      setError('Dates must be in YYYY-MM-DD format');
      return;
    }
    if (fromDate > toDate) {
      setError('From date cannot be after to date');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/api/portal/student/leaves', {
        studentId,
        leaveType,
        fromDate,
        toDate,
        reason: reason.trim(),
      });
      Alert.alert('Success', 'Leave request submitted successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScreenHeader title="Apply for Leave" showBack />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-4 py-4 gap-4">
            <Card>
              <Text className="text-sm font-medium text-slate-700 mb-2">Leave Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {LEAVE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setLeaveType(type)}
                    className={`px-4 py-2 rounded-xl border ${leaveType === type ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-200'}`}
                  >
                    <Text className={`text-sm font-semibold capitalize ${leaveType === type ? 'text-white' : 'text-slate-700'}`}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card>
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Text className="text-sm font-medium text-slate-700">From Date</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 bg-white"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={fromDate}
                    onChangeText={setFromDate}
                  />
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="text-sm font-medium text-slate-700">To Date</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 bg-white"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={toDate}
                    onChangeText={setToDate}
                  />
                </View>
              </View>
            </Card>

            <Card>
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Reason</Text>
              <TextInput
                className="border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 bg-white"
                placeholder="Describe the reason for leave (min. 10 characters)"
                placeholderTextColor="#94a3b8"
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </Card>

            {error && <Text className="text-red-500 text-sm">{error}</Text>}

            <Button title="Submit Leave Request" onPress={handleSubmit} loading={submitting} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
