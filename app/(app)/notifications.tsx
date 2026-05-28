import { ScrollView, View, Text, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/use-notifications';
import { ErrorView } from '@/components/shared/error-view';
import { SkeletonList } from '@/components/shared/skeleton';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
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

function NotificationCard({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const isUnread = item.status === 'pending' || item.status === 'sent';
  const config = typeConfig[item.type] ?? { emoji: '🔔', label: item.type };
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        if (isUnread) onRead(item._id);
        router.push({ pathname: '/(app)/notifications/[id]', params: { id: item._id, item: JSON.stringify(item) } });
      }}
      activeOpacity={0.7}
    >
      <Card>
        <View className="flex-row gap-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isUnread ? 'bg-primary-light' : 'bg-background'}`}>
            <Text className="text-xl">{config.emoji}</Text>
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-start justify-between gap-2">
              <Text className={`flex-1 text-sm leading-5 ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                {item.title}
              </Text>
              {isUnread && (
                <View className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              )}
            </View>
            <Text className="text-xs text-muted-foreground leading-4">{item.message}</Text>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-xs text-primary">{config.label}</Text>
              <Text className="text-xs text-muted-foreground">
                {format(new Date(item.createdAt), 'dd MMM, hh:mm a')}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { data, loading, error, refetch, markAsRead, markAllRead } = useNotifications();

  const handleMarkAllRead = async () => {
    if (data.unreadCount === 0) return;
    try {
      await markAllRead();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark all as read');
    }
  };

  if (loading && !data.notifications.length) return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Notifications" />
      <View className="px-4 py-4">
        <SkeletonList count={6} />
      </View>
    </SafeAreaView>
  );
  if (error && !data.notifications.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Notifications" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.unreadCount > 0 && (
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-xs text-muted-foreground">{data.unreadCount} unread</Text>
              <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
                <Text className="text-xs font-semibold text-primary">Mark all read</Text>
              </TouchableOpacity>
            </View>
          )}

          {data.notifications.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <Text className="text-4xl">🔔</Text>
              <Text className="text-muted-foreground text-base">No notifications yet</Text>
            </View>
          ) : (
            data.notifications.map((item) => (
              <NotificationCard key={item._id} item={item} onRead={markAsRead} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
