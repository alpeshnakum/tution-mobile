import { useState } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useExams } from '@/hooks/use-exams';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { EmptyBoxIcon } from '@/components/icons';
import { format } from 'date-fns';
import type { ExamScheduleItem } from '@/lib/types';

const examTypeLabel: Record<string, string> = {
  unit_test:  'Unit Test',
  mid_term:   'Mid Term',
  final:      'Final',
  practical:  'Practical',
  assignment: 'Assignment',
  project:    'Project',
};

const examTypeBadge: Record<string, { bg: string; color: string }> = {
  unit_test:  { bg: '#E0E8F0', color: '#6B8CAE' },
  mid_term:   { bg: '#F5EBD1', color: '#C89B3C' },
  final:      { bg: '#F5DCD8', color: '#C44536' },
  practical:  { bg: '#E4EEE1', color: '#5C8D5C' },
  assignment: { bg: '#E0E8F0', color: '#6B8CAE' },
  project:    { bg: '#F5F4EE', color: '#CC785C' },
};

function ExamCard({ exam }: { exam: ExamScheduleItem }) {
  const badge = examTypeBadge[exam.examType] ?? { bg: '#F5F4EE', color: '#6B6862' };
  const typeLabel = examTypeLabel[exam.examType] ?? exam.examType;

  const dateStr = exam.examDate
    ? format(new Date(exam.examDate), 'EEE, dd MMM yyyy')
    : 'Date TBD';

  const daysUntil = exam.examDate
    ? Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000)
    : null;

  const countdownColor =
    daysUntil !== null && daysUntil <= 3
      ? '#C44536'
      : daysUntil !== null && daysUntil <= 7
      ? '#C89B3C'
      : '#6B6862';

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-slate-900 leading-5">{exam.title}</Text>
          {!exam.isMultiSubject && exam.subjectName && (
            <Text className="text-xs text-slate-500">{exam.subjectName}</Text>
          )}
        </View>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg }}>
          <Text className="text-xs font-semibold" style={{ color: badge.color }}>{typeLabel}</Text>
        </View>
      </View>

      <View className="h-px my-2.5" style={{ backgroundColor: '#F0EEE6' }} />

      {exam.isMultiSubject && exam.subjects.length > 0 ? (
        <View className="gap-1.5">
          {exam.subjects.map((s, idx) => (
            <View key={idx} className="flex-row items-center justify-between">
              <Text className="text-xs text-slate-900 flex-1">{s.subjectName}</Text>
              <Text className="text-xs text-slate-500">
                {s.examDate ? format(new Date(s.examDate), 'dd MMM') : 'TBD'} · {s.totalMarks}M
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-slate-500">{dateStr}</Text>
            {exam.startTime && (
              <Text className="text-xs text-slate-500">{exam.startTime}</Text>
            )}
          </View>
          {exam.totalMarks && (
            <Text className="text-xs text-slate-500">{exam.totalMarks} marks</Text>
          )}
        </View>
      )}

      {daysUntil !== null && daysUntil >= 0 && (
        <View className="mt-2">
          <Text className="text-xs font-medium" style={{ color: countdownColor }}>
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Exam Schedule" showMenu />
      <View className="flex-1 items-center justify-center gap-3">
        <EmptyBoxIcon size={48} color="#6B6862" />
        <Text className="text-slate-500 text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  const exams = data?.exams ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Exam Schedule" subtitle={data?.session.displayName} showMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {/* Filter toggle */}
          <View className="flex-row rounded-xl p-1 gap-1" style={{ backgroundColor: '#F0EEE6' }}>
            {(['upcoming', 'all'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                className="flex-1 py-2 rounded-lg items-center"
                style={filter === f ? { backgroundColor: '#FFFFFF' } : undefined}
                onPress={() => setFilter(f)}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: filter === f ? '###1F1E1D' : '#6B6862' }}
                >
                  {f === 'upcoming' ? 'Upcoming' : 'All Exams'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {exams.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <EmptyBoxIcon size={48} color="#6B6862" />
              <Text className="text-slate-500 text-base">
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
