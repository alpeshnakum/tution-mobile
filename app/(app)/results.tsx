import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useResults } from '@/hooks/use-results';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { format } from 'date-fns';

export default function ResultsScreen() {
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch } = useResults(studentId);

  if (loading && !data.length) return <Loading fullScreen message="Loading results..." />;
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Exam Results" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <Text className="text-4xl">📊</Text>
              <Text className="text-slate-500 text-base">No results published yet</Text>
            </View>
          ) : (
            data.map((result) => (
              <Card key={result.examId}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">{result.examTitle}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">{result.subject}</Text>
                    <Text className="text-xs text-slate-400 mt-1">
                      {format(new Date(result.examDate), 'dd MMM yyyy')}
                    </Text>
                  </View>
                  <View className="items-end gap-1.5">
                    <Text className="text-lg font-bold text-slate-900">
                      {result.marksObtained}/{result.totalMarks}
                    </Text>
                    <Text className="text-xs text-slate-500">{result.percentage}%</Text>
                    <Badge
                      label={result.grade}
                      variant={result.isPassed ? 'success' : 'danger'}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
