import { useEffect } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useDashboard } from '@/hooks/use-dashboard';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { ScreenHeader } from '@/components/shared/screen-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HomeworkIcon, TimetableIcon, LeavesIcon,
  ExamIcon, NoticesIcon, NotificationsIcon,
} from '@/components/icons';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { user, studentId, setStudentMeta } = useAuthStore();
  const { data, loading, error, refetch } = useDashboard(studentId);

  useEffect(() => {
    if (data?.student?.classId && data?.session?.id) {
      setStudentMeta(
        data.student.classId,
        data.student.sectionId ?? '',
        data.session.id
      );
    }
  }, [data?.student?.classId, data?.student?.sectionId, data?.session?.id]);

  if (loading && !data) return <Loading fullScreen message="Loading dashboard..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;

  const dashboard = data;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Dashboard" showMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 pb-6 gap-4 mt-4">
          {/* Welcome Card */}
          <Card>
            <Text className="text-xl font-bold text-slate-900">
              {dashboard?.student.name || `${user?.firstName} ${user?.lastName}`}
            </Text>
            {dashboard?.student.className && (
              <Text className="text-sm text-slate-500 mt-0.5">
                {dashboard.student.className}
              </Text>
            )}
          </Card>

          {/* Attendance Card */}
          {dashboard?.attendance && (
            <Card>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">Attendance</Text>
                <Text className="text-xs text-slate-500">{dashboard.attendance.month}</Text>
              </View>
              <View className="flex-row gap-3">
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-indigo-50"
                  style={{ backgroundColor: '#F5F4EE' }}
                >
                  <Text className="text-2xl font-bold" style={{ color: '#CC785C' }}>
                    {dashboard.attendance.percentage}%
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">Overall</Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-green-50"
                  style={{ backgroundColor: '#E4EEE1' }}
                >
                  <Text className="text-2xl font-bold" style={{ color: '#5C8D5C' }}>
                    {dashboard.attendance.present}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">Present</Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-3 items-center bg-red-50"
                  style={{ backgroundColor: '#F5DCD8' }}
                >
                  <Text className="text-2xl font-bold" style={{ color: '#C44536' }}>
                    {dashboard.attendance.absent}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">Absent</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Fees Card */}
          {dashboard?.fees && (
            <Card>
              <Text className="text-base font-semibold text-slate-900 mb-3">Fee Summary</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Total Paid</Text>
                  <Text className="font-semibold text-sm" style={{ color: '#5C8D5C' }}>
                    ₹{dashboard.fees.totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Total Due</Text>
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: dashboard.fees.totalDue > 0 ? '#C44536' : '#5C8D5C' }}
                  >
                    ₹{dashboard.fees.totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View className="h-px my-1" style={{ backgroundColor: '#F0EEE6' }} />
                <View className="flex-row justify-between">
                  <Text className="text-slate-700 text-sm font-medium">Total Expected</Text>
                  <Text className="font-semibold text-slate-900 text-sm">
                    ₹{dashboard.fees.totalExpected.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Upcoming Exams */}
          {(dashboard?.upcomingExams?.length ?? 0) > 0 && (
            <Card>
              <Text className="text-base font-semibold text-slate-900 mb-3">Upcoming Exams</Text>
              <View className="gap-2">
                {(dashboard?.upcomingExams ?? []).map((exam) => (
                  <View key={exam.id} className="flex-row items-center justify-between py-2 border-b border-slate-100">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-800">{exam.title}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5">{exam.subject}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-medium" style={{ color: '#CC785C' }}>
                        {format(new Date(exam.examDate), 'dd MMM')}
                      </Text>
                      <Text className="text-xs text-slate-400">{exam.totalMarks} marks</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Recent Results */}
          {(dashboard?.recentResults?.length ?? 0) > 0 && (
            <Card>
              <Text className="text-base font-semibold text-slate-900 mb-3">Recent Results</Text>
              <View className="gap-2">
                {(dashboard?.recentResults ?? []).map((result, idx) => (
                  <View key={idx} className="flex-row items-center justify-between py-2 border-b border-slate-100">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-900">{result.examTitle}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5">{result.subject}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-sm font-bold text-slate-900">
                        {result.marksObtained}/{result.totalMarks}
                      </Text>
                      <Text className="text-xs text-slate-500">{result.percentage}%</Text>
                      <Badge
                        label={result.grade}
                        variant={result.isPassed ? 'success' : 'danger'}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Quick Access */}
          <View>
            <Text className="text-sm font-semibold text-slate-900 mb-2 px-1">Quick Access</Text>
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/homework')}
              >
                <HomeworkIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Homework</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/timetable')}
              >
                <TimetableIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Timetable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/leaves')}
              >
                <LeavesIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Leaves</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/exams')}
              >
                <ExamIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Exams</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/notices')}
              >
                <NoticesIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Notices</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={() => router.push('/(app)/notifications')}
              >
                <NotificationsIcon size={28} color="#CC785C" />
                <Text className="text-xs font-semibold text-slate-700">Inbox</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
