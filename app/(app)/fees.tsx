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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Fee Details" />
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-4xl">💳</Text>
        <Text className="text-slate-500 text-base">No student selected</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader
        title="Fee Details"
        subtitle={data?.session.displayName}
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
                  <Text className="font-medium text-slate-900 text-sm">₹{data.totals.totalExpected.toLocaleString('en-IN')}</Text>
                </View>
                {data.totals.totalConcession > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-500 text-sm">Concession</Text>
                    <Text className="font-medium text-green-600 text-sm">-₹{data.totals.totalConcession.toLocaleString('en-IN')}</Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-sm">Paid</Text>
                  <Text className="font-medium text-green-600 text-sm">₹{data.totals.totalPaid.toLocaleString('en-IN')}</Text>
                </View>
                <View className="h-px bg-slate-100 my-1" />
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-slate-900 text-sm">Due</Text>
                  <Text className={`font-bold text-sm ${data.totals.totalDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
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
              <View className="h-px bg-slate-100 mb-2" />
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Net Due</Text>
                <Text className="text-xs font-semibold text-slate-900">₹{inst.netExpected.toLocaleString('en-IN')}</Text>
              </View>
              {inst.totalPaid > 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-slate-500">Paid</Text>
                  <Text className="text-xs font-semibold text-green-600">₹{inst.totalPaid.toLocaleString('en-IN')}</Text>
                </View>
              )}
              {inst.payments.length > 0 && (
                <View className="mt-2 gap-1">
                  {inst.payments.map((p, pi) => (
                    <TouchableOpacity
                      key={pi}
                      className="flex-row justify-between bg-green-50 rounded-lg px-2 py-1.5 active:opacity-70"
                      onPress={() => router.push(`/(app)/receipt/${encodeURIComponent(p.receiptNumber)}`)}
                    >
                      <Text className="text-xs text-green-700 font-medium">#{p.receiptNumber} ↗</Text>
                      <Text className="text-xs text-green-700">
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
