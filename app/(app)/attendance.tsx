import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useAttendance } from '@/hooks/use-attendance';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { EmptyBoxIcon } from '@/components/icons';
import { format } from 'date-fns';

const statusConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'default'; label: string }> = {
  present: { variant: 'success', label: 'Present' },
  absent:  { variant: 'danger',  label: 'Absent' },
  late:    { variant: 'warning', label: 'Late' },
  excused: { variant: 'default', label: 'Excused' },
};

export default function AttendanceScreen() {
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch } = useAttendance(studentId);

  if (loading && !data) return <Loading fullScreen message="Loading attendance..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;

  if (!studentId) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Attendance" showMenu />
      <View className="flex-1 items-center justify-center gap-3">
        <EmptyBoxIcon size={48} color="#6B6862" />
        <Text className="text-slate-500 text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Attendance" showMenu />
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
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-indigo-50"
                  style={{ backgroundColor: '#F5F4EE' }}
                >
                  <Text className="text-xl font-bold" style={{ color: '#CC785C' }}>
                    {data.summary.percentage}%
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Rate</Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-green-50"
                  style={{ backgroundColor: '#E4EEE1' }}
                >
                  <Text className="text-xl font-bold" style={{ color: '#5C8D5C' }}>
                    {data.summary.present}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Present</Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-red-50"
                  style={{ backgroundColor: '#F5DCD8' }}
                >
                  <Text className="text-xl font-bold" style={{ color: '#C44536' }}>
                    {data.summary.absent}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Absent</Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-amber-50"
                  style={{ backgroundColor: '#F5EBD1' }}
                >
                  <Text className="text-xl font-bold" style={{ color: '#C89B3C' }}>
                    {data.summary.late}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Late</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Records */}
          <Card>
            <Text className="text-base font-semibold text-slate-900 mb-3">Records</Text>
            {(!data?.records || data.records.length === 0) ? (
              <View className="py-12 items-center gap-3">
                <EmptyBoxIcon size={48} color="#6B6862" />
                <Text className="text-slate-500 text-sm">No attendance records found</Text>
              </View>
            ) : (
              <View className="gap-2">
                {data.records.map((record) => (
                  <View key={record.date} className="flex-row items-center justify-between py-3 border-b border-slate-100">
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
