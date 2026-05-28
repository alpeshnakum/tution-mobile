import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/shared/screen-header';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { NotificationItem } from '@/lib/types';

const typeConfig: Record<string, { emoji: string; label: string }> = {
  fee_reminder: { emoji: '💳', label: 'Fee Reminder' },
  exam_notice: { emoji: '📝', label: 'Exam Notice' },
  attendance_alert: { emoji: '📅', label: 'Attendance Alert' },
  result_published: { emoji: '📊', label: 'Result Published' },
  announcement: { emoji: '📢', label: 'Announcement' },
  promotion: { emoji: '🎓', label: 'Promotion' },
};

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { item } = useLocalSearchParams<{ id: string; item: string }>();

  if (!item) return <ErrorView message="Notification not found" onRetry={() => router.back()} />;

  let notification: NotificationItem;
  try {
    notification = JSON.parse(Array.isArray(item) ? item[0] : item);
  } catch {
    return <ErrorView message="Failed to load notification" onRetry={() => router.back()} />;
  }
  const config = typeConfig[notification.type] ?? { emoji: '🔔', label: notification.type };
  const isUnread = notification.status === 'pending' || notification.status === 'sent';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Notification" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 gap-5">
          <View className="items-center gap-3">
            <View className="w-16 h-16 rounded-full bg-indigo-50 items-center justify-center">
              <Text className="text-3xl">{config.emoji}</Text>
            </View>
            <Text className="text-lg font-semibold text-slate-900 text-center leading-6">
              {notification.title}
            </Text>
            <Badge label={config.label} variant="primary" />
          </View>

          <Card>
            <Text className="text-sm text-slate-700 leading-6">{notification.message}</Text>
          </Card>

          <Card>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-slate-500">Received</Text>
                <Text className="text-xs text-slate-700">
                  {format(new Date(notification.createdAt), 'dd MMM yyyy, hh:mm a')}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-slate-500">Status</Text>
                <Badge
                  label={isUnread ? 'Unread' : 'Read'}
                  variant={isUnread ? 'warning' : 'success'}
                />
              </View>
              {notification.readAt && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-slate-500">Read at</Text>
                  <Text className="text-xs text-slate-700">
                    {format(new Date(notification.readAt), 'dd MMM yyyy, hh:mm a')}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
