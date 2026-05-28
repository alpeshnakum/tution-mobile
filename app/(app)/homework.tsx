import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { useHomework } from '@/hooks/use-homework';
import { ErrorView } from '@/components/shared/error-view';
import { SkeletonList } from '@/components/shared/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { EmptyBoxIcon } from '@/components/icons';
import { format, isPast, differenceInDays } from 'date-fns';

export default function HomeworkScreen() {
  const router = useRouter();
  const { studentClassId, studentSectionId, user } = useAuthStore();
  const branchId = user?.branchId ?? null;
  const { data, loading, error, refetch } = useHomework(studentClassId, branchId, studentSectionId);

  if (loading && !data.length) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Homework" showBack />
      <View className="px-4 py-4">
        <SkeletonList count={5} />
      </View>
    </SafeAreaView>
  );
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;
  if (!studentClassId) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Homework" showBack />
      <View className="flex-1 items-center justify-center gap-3">
        <EmptyBoxIcon size={48} color="#6B6862" />
        <Text className="text-slate-500 text-base">No class assigned yet</Text>
      </View>
    </SafeAreaView>
  );

  const getDueBadge = (dueDate: string): { label: string; variant: 'danger' | 'warning' | 'success' } => {
    const due = new Date(dueDate);
    const days = differenceInDays(due, new Date());
    if (isPast(due) || days === 0) return { label: 'Due Today', variant: 'danger' };
    if (days <= 3) return { label: `${days}d left`, variant: 'warning' };
    return { label: `${days}d left`, variant: 'success' };
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Homework" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <EmptyBoxIcon size={48} color="#6B6862" />
              <Text className="text-slate-500 text-base font-medium">No pending homework!</Text>
              <Text className="text-slate-400 text-sm">You're all caught up</Text>
            </View>
          ) : (
            data.map((hw) => {
              const due = getDueBadge(hw.dueDate);
              return (
                <TouchableOpacity
                  key={hw._id}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/(app)/homework/[id]', params: { id: hw._id, item: JSON.stringify(hw) } })}
                >
                  <Card>
                    <View className="flex-row items-start justify-between mb-2">
                      <Badge label={hw.subjectName} variant="primary" />
                      <Badge label={due.label} variant={due.variant} />
                    </View>
                    <Text className="text-sm font-semibold text-slate-900 mt-1">{hw.title}</Text>
                    {hw.description ? (
                      <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>{hw.description}</Text>
                    ) : null}
                    <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-50">
                      <Text className="text-xs text-slate-400">
                        Due: {format(new Date(hw.dueDate), 'EEE, dd MMM yyyy')}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        {hw.isGraded && hw.maxMarks ? (
                          <Text className="text-xs font-medium" style={{ color: '#CC785C' }}>
                            {hw.maxMarks} marks
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
