import { useState } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useExams } from '@/hooks/use-exams';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { format } from 'date-fns';
import type { ExamScheduleItem } from '@/lib/types';

const examTypeLabel: Record<string, string> = {
  unit_test: 'Unit Test',
  mid_term: 'Mid Term',
  final: 'Final',
  practical: 'Practical',
  assignment: 'Assignment',
  project: 'Project',
};

const examTypeColor: Record<string, string> = {
  unit_test: 'bg-blue-50 text-blue-600',
  mid_term: 'bg-amber-50 text-amber-600',
  final: 'bg-danger-light text-danger',
  practical: 'bg-success-light text-success',
  assignment: 'bg-purple-50 text-purple-600',
  project: 'bg-primary-light text-primary',
};

function ExamCard({ exam }: { exam: ExamScheduleItem }) {
  const typeColor = examTypeColor[exam.examType] ?? 'bg-primary-light text-muted-foreground';
  const typeLabel = examTypeLabel[exam.examType] ?? exam.examType;

  const dateStr = exam.examDate
    ? format(new Date(exam.examDate), 'EEE, dd MMM yyyy')
    : 'Date TBD';

  const daysUntil = exam.examDate
    ? Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-foreground leading-5">{exam.title}</Text>
          {!exam.isMultiSubject && exam.subjectName && (
            <Text className="text-xs text-muted-foreground">{exam.subjectName}</Text>
          )}
        </View>
        <View className={`px-2 py-0.5 rounded-full ${typeColor}`}>
          <Text className={`text-xs font-semibold ${typeColor.split(' ')[1]}`}>{typeLabel}</Text>
        </View>
      </View>

      <View className="h-px bg-border my-2.5" />

      {exam.isMultiSubject && exam.subjects.length > 0 ? (
        <View className="gap-1.5">
          {exam.subjects.map((s, idx) => (
            <View key={idx} className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground flex-1">{s.subjectName}</Text>
              <Text className="text-xs text-muted-foreground">
                {s.examDate ? format(new Date(s.examDate), 'dd MMM') : 'TBD'} · {s.totalMarks}M
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-muted-foreground">📅 {dateStr}</Text>
            {exam.startTime && (
              <Text className="text-xs text-muted-foreground">⏰ {exam.startTime}</Text>
            )}
          </View>
          {exam.totalMarks && (
            <Text className="text-xs text-muted-foreground">{exam.totalMarks} marks</Text>
          )}
        </View>
      )}

      {daysUntil !== null && daysUntil >= 0 && (
        <View className="mt-2">
          <Text className={`text-xs font-medium ${daysUntil <= 3 ? 'text-danger' : daysUntil <= 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </Text>
        </View>
      )}
    </Card>
  );
}

export default function ExamsScreen() {
  const { studentId } = useAuthStore();
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');
  const { data, loading, error, refetch } = useExams(studentId, filter);

  if (loading && !data) return <Loading fullScreen message="Loading exam schedule..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;

  if (!studentId) return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Exam Schedule" />
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-4xl">📝</Text>
        <Text className="text-muted-foreground text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  const exams = data?.exams ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Exam Schedule" subtitle={data?.session.displayName} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {/* Filter toggle */}
          <View className="flex-row bg-primary-light rounded-xl p-1 gap-1">
            {(['upcoming', 'all'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                className={`flex-1 py-2 rounded-lg items-center ${filter === f ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setFilter(f)}
              >
                <Text className={`text-xs font-semibold ${filter === f ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {f === 'upcoming' ? 'Upcoming' : 'All Exams'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {exams.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <Text className="text-4xl">📋</Text>
              <Text className="text-muted-foreground text-base">
                {filter === 'upcoming' ? 'No upcoming exams' : 'No exams found'}
              </Text>
            </View>
          ) : (
            exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
