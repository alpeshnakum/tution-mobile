import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/shared/screen-header';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast, differenceInDays } from 'date-fns';
import type { HomeworkItem } from '@/lib/types';

const getDueBadge = (dueDate: string): { label: string; variant: 'danger' | 'warning' | 'success' } => {
  const due = new Date(dueDate);
  const days = differenceInDays(due, new Date());
  if (isPast(due) || days === 0) return { label: 'Overdue', variant: 'danger' };
  if (days <= 3) return { label: `${days}d left`, variant: 'warning' };
  return { label: `${days}d left`, variant: 'success' };
};

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  submitted: { label: 'Submitted', variant: 'success' },
  overdue: { label: 'Overdue', variant: 'danger' },
};

export default function HomeworkDetailScreen() {
  const router = useRouter();
  const { item } = useLocalSearchParams<{ id: string; item: string }>();

  if (!item) return <ErrorView message="Homework not found" onRetry={() => router.back()} />;

  let hw: HomeworkItem;
  try {
    hw = JSON.parse(Array.isArray(item) ? item[0] : item);
  } catch {
    return <ErrorView message="Failed to load homework details" onRetry={() => router.back()} />;
  }

  const due = getDueBadge(hw.dueDate);
  const status = statusConfig[hw.status] ?? { label: hw.status, variant: 'default' as const };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title={hw.title} showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 gap-4">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge label={hw.subjectName} variant="primary" />
            <Badge label={status.label} variant={status.variant} />
          </View>

          <Card>
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Due Date</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">
                {format(new Date(hw.dueDate), 'EEE, dd MMM yyyy')}
              </Text>
              <Badge label={due.label} variant={due.variant} />
            </View>
          </Card>

          <Card>
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Description</Text>
            <Text className="text-sm text-foreground leading-relaxed">
              {hw.description ? hw.description : 'No description provided'}
            </Text>
          </Card>

          {hw.isGraded ? (
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">Graded Assignment</Text>
                  {hw.maxMarks ? (
                    <Text className="text-xs text-muted-foreground">Maximum marks: {hw.maxMarks}</Text>
                  ) : null}
                </View>
                <View className="bg-primary-light rounded-lg px-3 py-2">
                  {hw.maxMarks ? (
                    <Text className="text-base font-bold text-primary">{hw.maxMarks}</Text>
                  ) : null}
                  <Text className="text-xs text-primary text-center">marks</Text>
                </View>
              </View>
            </Card>
          ) : null}

          <View className="flex-row items-center justify-center gap-2 py-3">
            <View
              className={`w-2 h-2 rounded-full ${
                hw.status === 'submitted'
                  ? 'bg-success'
                  : hw.status === 'overdue'
                  ? 'bg-danger'
                  : 'bg-warning'
              }`}
            />
            <Text className="text-sm text-muted-foreground">{status.label}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
