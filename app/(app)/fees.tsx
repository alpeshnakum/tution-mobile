import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { useFees } from '@/hooks/use-fees';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScreenHeader } from '@/components/shared/screen-header';
import { EmptyBoxIcon } from '@/components/icons';
import { format } from 'date-fns';

const statusVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  PAID: 'success',
  UNPAID: 'danger',
  PARTIAL: 'warning',
};

export default function FeesScreen() {
  const router = useRouter();
  const { studentId } = useAuthStore();
  const { data, loading, error, refetch } = useFees(studentId);

  if (loading && !data) return <Loading fullScreen message="Loading fees..." />;
  if (error && !data) return <ErrorView message={error} onRetry={refetch} />;

  if (!studentId) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Fee Details" showMenu />
      <View className="flex-1 items-center justify-center gap-3">
        <EmptyBoxIcon size={48} color="#6B6862" />
        <Text className="text-slate-500 text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader
        title="Fee Details"
        subtitle={data?.session.displayName}
        showMenu
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-4">
          {/* Totals Summary */}
          {data?.totals && (
            <Card>
              <Text className="text-base font-semibold text-slate-900 mb-3">Summary</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Total Expected</Text>
                  <Text className="font-medium text-slate-900 text-sm">
                    ₹{data.totals.totalExpected.toLocaleString('en-IN')}
                  </Text>
                </View>
                {data.totals.totalConcession > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-500 text-sm">Concession</Text>
                    <Text className="font-medium text-sm" style={{ color: '#5C8D5C' }}>
                      -₹{data.totals.totalConcession.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Paid</Text>
                  <Text className="font-medium text-sm" style={{ color: '#5C8D5C' }}>
                    ₹{data.totals.totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View className="h-px my-1" style={{ backgroundColor: '#F0EEE6' }} />
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-slate-900 text-sm">Due</Text>
                  <Text
                    className="font-bold text-sm"
                    style={{ color: data.totals.totalDue > 0 ? '#C44536' : '#5C8D5C' }}
                  >
                    ₹{data.totals.totalDue.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Installments */}
          {(data?.installments ?? []).map((inst) => (
            <Card key={inst.number}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-slate-900 flex-1">{inst.label}</Text>
                <Badge label={inst.status} variant={statusVariant[inst.status]} />
              </View>
              <View className="gap-1.5 mb-3">
                {inst.feeItems.map((item, i) => (
                  <View key={i} className="flex-row justify-between">
                    <Text className="text-xs text-slate-500">{item.name}</Text>
                    <Text className="text-xs text-slate-700">₹{item.amount.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>
              <View className="h-px mb-2" style={{ backgroundColor: '#F0EEE6' }} />
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Net Due</Text>
                <Text className="text-xs font-semibold text-slate-900">
                  ₹{inst.netExpected.toLocaleString('en-IN')}
                </Text>
              </View>
              {inst.totalPaid > 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-slate-500">Paid</Text>
                  <Text className="text-xs font-semibold" style={{ color: '#5C8D5C' }}>
                    ₹{inst.totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
              {inst.payments.length > 0 && (
                <View className="mt-2 gap-1">
                  {inst.payments.map((p, pi) => (
                    <TouchableOpacity
                      key={pi}
                      className="flex-row justify-between rounded-xl px-3 py-2 border border-green-100 active:opacity-70"
                      style={{ backgroundColor: '#E4EEE1' }}
                      onPress={() => router.push(`/(app)/receipt/${encodeURIComponent(p.receiptNumber)}`)}
                    >
                      <Text className="text-xs font-medium" style={{ color: '#5C8D5C' }}>
                        #{p.receiptNumber} ↗
                      </Text>
                      <Text className="text-xs" style={{ color: '#5C8D5C' }}>
                        ₹{p.amountPaid.toLocaleString('en-IN')} · {format(new Date(p.paymentDate), 'dd MMM yy')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
