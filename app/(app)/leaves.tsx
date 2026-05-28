import { useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { useLeaves } from '@/hooks/use-leaves';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { getErrorMessage } from '@/lib/api';
import { format } from 'date-fns';

const statusVariant: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'default',
};

export default function LeavesScreen() {
  const router = useRouter();
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch, cancelLeave } = useLeaves(studentId);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

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
          <Card>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => router.push('/(app)/leaves/apply')}
              activeOpacity={0.7}
            >
              <View>
                <Text className="text-base font-semibold text-slate-900">Apply for Leave</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Submit a new leave request</Text>
              </View>
              <View className="bg-indigo-500 px-4 py-2 rounded-xl">
                <Text className="text-white text-sm font-semibold">Apply</Text>
              </View>
            </TouchableOpacity>
          </Card>

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
