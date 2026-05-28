import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { format } from 'date-fns';

const priorityConfig = {
  urgent: { color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger', label: 'Urgent', dot: '🔴' },
  important: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Important', dot: '🟡' },
  normal: { color: 'text-muted-foreground', bg: 'bg-background', border: 'border-border', label: '', dot: '' },
};

export default function NoticesScreen() {
  const { data, loading, error, refetch } = useAnnouncements();

  if (loading && !data.length) return <Loading fullScreen message="Loading notices..." />;
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Notices" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {data.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <Text className="text-4xl">📢</Text>
              <Text className="text-muted-foreground text-base">No notices at this time</Text>
            </View>
          ) : (
            data.map((item) => {
              const p = priorityConfig[item.priority] ?? priorityConfig.normal;
              return (
                <Card key={item._id}>
                  <View className="gap-2">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 text-sm font-semibold text-foreground leading-5">
                        {p.dot ? `${p.dot} ` : ''}{item.title}
                      </Text>
                      {item.priority !== 'normal' && (
                        <View className={`px-2 py-0.5 rounded-full ${p.bg}`}>
                          <Text className={`text-xs font-semibold ${p.color}`}>{p.label}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted-foreground leading-5">{item.content}</Text>
                    <View className="flex-row items-center justify-between mt-1">
                      <Text className="text-xs text-muted-foreground">{item.publishedByName}</Text>
                      <Text className="text-xs text-muted-foreground">
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
