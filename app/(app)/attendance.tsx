import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useAttendance } from '@/hooks/use-attendance';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { format } from 'date-fns';

const statusConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'default'; label: string }> = {
  present: { variant: 'success', label: 'Present' },
  absent: { variant: 'danger', label: 'Absent' },
  late: { variant: 'warning', label: 'Late' },
  excused: { variant: 'default', label: 'Excused' },
};

export default function AttendanceScreen() {
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch } = useAttendance(studentId);

  if (loading && !data) return <Loading fullScreen message="Loading attendance..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;
  if (!studentId) return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Attendance" />
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-4xl">📅</Text>
        <Text className="text-slate-500 text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Attendance" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-4">
          {/* Summary */}
          {data?.summary && (
            <Card>
              <Text className="text-base font-semibold text-slate-900 mb-3">Summary</Text>
              <View className="flex-row gap-2">
                <View className="flex-1 bg-indigo-50 rounded-xl p-3 items-center">
                  <Text className="text-xl font-bold text-indigo-600">{data.summary.percentage}%</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Rate</Text>
                </View>
                <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                  <Text className="text-xl font-bold text-green-600">{data.summary.present}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Present</Text>
                </View>
                <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                  <Text className="text-xl font-bold text-red-500">{data.summary.absent}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Absent</Text>
                </View>
                <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                  <Text className="text-xl font-bold text-amber-500">{data.summary.late}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Late</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Records */}
          <Card>
            <Text className="text-base font-semibold text-slate-900 mb-3">Records</Text>
            {(!data?.records || data.records.length === 0) ? (
              <Text className="text-slate-400 text-sm text-center py-4">No attendance records found</Text>
            ) : (
              <View className="gap-2">
                {data.records.map((record) => (
                  <View key={record.date} className="flex-row items-center justify-between py-2 border-b border-slate-50">
                    <Text className="text-sm font-medium text-slate-800">
                      {format(new Date(record.date), 'EEE, dd MMM yyyy')}
                    </Text>
                    <Badge
                      label={statusConfig[record.status]?.label || record.status}
                      variant={statusConfig[record.status]?.variant || 'default'}
                    />
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
