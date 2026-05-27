import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useLeaves } from '@/hooks/use-leaves';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/shared/screen-header';
import { getErrorMessage } from '@/lib/api';
import { format } from 'date-fns';

const LEAVE_TYPES = ['sick', 'personal', 'family', 'other'];

const statusVariant: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'default',
};

export default function LeavesScreen() {
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch, submitLeave, cancelLeave } = useLeaves(studentId);

  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('sick');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason.trim()) {
      setFormError('All fields are required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await submitLeave({ leaveType, fromDate, toDate, reason: reason.trim() });
      setShowForm(false);
      setFromDate(''); setToDate(''); setReason(''); setLeaveType('sick');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (leaveId: string) => {
    Alert.alert('Cancel Leave', 'Cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelLeave(leaveId);
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (loading && !data.length) return <Loading fullScreen message="Loading leaves..." />;
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Leave Requests" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-4">
          {/* Apply card */}
          <Card>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setShowForm(!showForm)}
            >
              <Text className="text-base font-semibold text-slate-900">Apply for Leave</Text>
              <Text className="text-lg text-indigo-500">{showForm ? '−' : '+'}</Text>
            </TouchableOpacity>

            {showForm && (
              <View className="mt-4 gap-3">
                {/* Leave type selector */}
                <View className="gap-1.5">
                  <Text className="text-sm font-medium text-slate-700">Leave Type</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {LEAVE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setLeaveType(type)}
                        className={`px-3 py-1.5 rounded-lg border ${
                          leaveType === type
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <Text className={`text-sm font-medium capitalize ${leaveType === type ? 'text-white' : 'text-slate-700'}`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dates */}
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

                {/* Reason */}
                <View className="gap-1.5">
                  <Text className="text-sm font-medium text-slate-700">Reason</Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 bg-white"
                    placeholder="Describe the reason..."
                    placeholderTextColor="#94a3b8"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={{ minHeight: 72 }}
                  />
                </View>

                {formError && (
                  <Text className="text-xs text-red-500">{formError}</Text>
                )}

                <Button title="Submit Leave Request" onPress={handleSubmit} loading={submitting} />
              </View>
            )}
          </Card>

          {/* Leave list */}
          {data.length === 0 ? (
            <View className="py-12 items-center gap-3">
              <Text className="text-4xl">📋</Text>
              <Text className="text-slate-500 text-sm">No leave requests yet</Text>
            </View>
          ) : (
            data.map((leave) => (
              <Card key={leave._id}>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900 capitalize">{leave.leaveType} Leave</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {format(new Date(leave.fromDate), 'dd MMM yyyy')} – {format(new Date(leave.toDate), 'dd MMM yyyy')}
                      {' '}({leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''})
                    </Text>
                  </View>
                  <Badge label={leave.status} variant={statusVariant[leave.status] || 'default'} />
                </View>
                <Text className="text-xs text-slate-600">{leave.reason}</Text>
                {leave.reviewNotes && (
                  <Text className="text-xs text-slate-500 mt-1 italic">Note: {leave.reviewNotes}</Text>
                )}
                {leave.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => handleCancel(leave._id)}
                    className="mt-3 py-2 border border-red-200 rounded-xl items-center"
                  >
                    <Text className="text-xs font-semibold text-red-500">Cancel Request</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
