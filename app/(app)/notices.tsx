import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { NoticesIcon } from '@/components/icons';
import { format } from 'date-fns';

const priorityBadge: Record<string, { bg: string; color: string; label: string } | null> = {
  urgent:    { bg: '#F5DCD8', color: '#C44536', label: 'Urgent' },
  important: { bg: '#F5EBD1', color: '#C89B3C', label: 'Important' },
  normal:    null,
};

export default function NoticesScreen() {
  const { data, loading, error, refetch } = useAnnouncements();

  if (loading && !data.length) return <Loading fullScreen message="Loading notices..." />;
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Notices" showMenu />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <NoticesIcon size={48} color="#6B6862" />
              <Text className="text-slate-500 text-base">No notices at this time</Text>
            </View>
          ) : (
            data.map((item) => {
              const badge = priorityBadge[item.priority] ?? null;
              return (
                <Card key={item._id}>
                  <View className="gap-2">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 text-sm font-semibold text-slate-900 leading-5">
                        {item.title}
                      </Text>
                      {badge && (
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg }}>
                          <Text className="text-xs font-semibold" style={{ color: badge.color }}>
                            {badge.label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-slate-600 leading-5">{item.content}</Text>
                    <View className="flex-row items-center justify-between mt-1">
                      <Text className="text-xs text-slate-400">{item.publishedByName}</Text>
                      <Text className="text-xs text-slate-400">
                        {format(new Date(item.createdAt), 'dd MMM yyyy')}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
