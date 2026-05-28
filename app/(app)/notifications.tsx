import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/use-notifications';
import { ErrorView } from '@/components/shared/error-view';
import { SkeletonList } from '@/components/shared/skeleton';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { NotificationsIcon } from '@/components/icons';
import { format } from 'date-fns';
import type { NotificationItem } from '@/lib/types';

const typeLabel: Record<string, string> = {
  fee_reminder:      'Fee Reminder',
  exam_notice:       'Exam Notice',
  attendance_alert:  'Attendance Alert',
  result_published:  'Result Published',
  announcement:      'Announcement',
  promotion:         'Promotion',
};

function NotificationCard({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const isUnread = item.status === 'pending' || item.status === 'sent';
  const label = typeLabel[item.type] ?? item.type;
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
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: isUnread ? '#F5F4EE' : '#F0EEE6' }}
          >
            <NotificationsIcon size={20} color={isUnread ? '#CC785C' : '#6B6862'} />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-start justify-between gap-2">
              <Text
                className="flex-1 text-sm leading-5"
                style={{ fontWeight: isUnread ? '600' : '500', color: '###1F1E1D' }}
              >
                {item.title}
              </Text>
              {isUnread && (
                <View className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: '#CC785C' }} />
              )}
            </View>
            <Text className="text-xs text-slate-500 leading-4">{item.message}</Text>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-xs" style={{ color: '#CC785C' }}>{label}</Text>
              <Text className="text-xs text-slate-400">
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to mark all as read',
      });
    }
  };

  if (loading && !data.notifications.length) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Notifications" showMenu />
      <View className="px-4 py-4">
        <SkeletonList count={6} />
      </View>
    </SafeAreaView>
  );
  if (error && !data.notifications.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Notifications" showMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.unreadCount > 0 && (
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-xs text-slate-500">{data.unreadCount} unread</Text>
              <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
                <Text className="text-xs font-semibold" style={{ color: '#CC785C' }}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {data.notifications.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <NotificationsIcon size={48} color="#6B6862" />
              <Text className="text-slate-500 text-base">No notifications yet</Text>
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
