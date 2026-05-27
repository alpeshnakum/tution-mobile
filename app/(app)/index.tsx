import { useEffect } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useDashboard } from '@/hooks/use-dashboard';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { user, studentId, setStudentMeta } = useAuthStore();
  const { data, loading, error, refetch } = useDashboard(studentId);

  useEffect(() => {
    if (data?.student?.classId && data?.session?.id && user?.branchId) {
      setStudentMeta(data.student.classId, '', data.session.id);
    }
  }, [data?.student?.classId, data?.session?.id]);

  if (loading && !data) return <Loading fullScreen message="Loading dashboard..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;

  const dashboard = data;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-slate-500 text-sm">Welcome back,</Text>
          <Text className="text-2xl font-bold text-slate-900">
            {dashboard?.student.name || `${user?.firstName} ${user?.lastName}`}
          </Text>
          {dashboard?.student.className && (
            <Text className="text-slate-500 text-sm mt-0.5">{dashboard.student.className}</Text>
          )}
        </View>

        <View className="px-4 pb-6 gap-4 mt-2">
          {/* Attendance Card */}
          {dashboard?.attendance && (
            <Card>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-slate-900">Attendance</Text>
                <Text className="text-xs text-slate-500">{dashboard.attendance.month}</Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-slate-50 rounded-xl p-3 items-center">
                  <Text className="text-2xl font-bold text-indigo-600">
                    {dashboard.attendance.percentage}%
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Overall</Text>
                </View>
                <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                  <Text className="text-2xl font-bold text-green-600">{dashboard.attendance.present}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Present</Text>
                </View>
                <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                  <Text className="text-2xl font-bold text-red-500">{dashboard.attendance.absent}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Absent</Text>
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
                  <Text className="font-semibold text-green-600 text-sm">
                    ₹{dashboard.fees.totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Total Due</Text>
                  <Text className={`font-semibold text-sm ${dashboard.fees.totalDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    ₹{dashboard.fees.totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View className="h-px bg-slate-100 my-1" />
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
                  <View key={exam.id} className="flex-row items-center justify-between py-2 border-b border-slate-50">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-800">{exam.title}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5">{exam.subject}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-medium text-indigo-600">
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
                  <View key={idx} className="flex-row items-center justify-between py-2 border-b border-slate-50">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-800">{result.examTitle}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5">{result.subject}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-sm font-bold text-slate-900">
                        {result.marksObtained}/{result.totalMarks}
                      </Text>
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
            <Text className="text-sm font-semibold text-slate-700 mb-2 px-1">Quick Access</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-white rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                onPress={() => router.push('/(app)/homework')}
              >
                <Text className="text-3xl">📚</Text>
                <Text className="text-xs font-semibold text-slate-700">Homework</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                onPress={() => router.push('/(app)/timetable')}
              >
                <Text className="text-3xl">🗓️</Text>
                <Text className="text-xs font-semibold text-slate-700">Timetable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white rounded-2xl p-4 items-center gap-2 border border-slate-100 active:opacity-80"
                onPress={() => router.push('/(app)/leaves')}
              >
                <Text className="text-3xl">📝</Text>
                <Text className="text-xs font-semibold text-slate-700">Leaves</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
