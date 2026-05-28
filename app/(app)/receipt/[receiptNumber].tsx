import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useReceipt } from '@/hooks/use-receipt';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { ScreenHeader } from '@/components/shared/screen-header';
import { format } from 'date-fns';

const methodLabel: Record<string, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  online: 'Online',
  card: 'Card',
  upi: 'UPI',
};

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px my-1" style={{ backgroundColor: '#F0EEE6' }} />;
}

export default function ReceiptScreen() {
  const { receiptNumber } = useLocalSearchParams<{ receiptNumber: string }>();
  const { data, loading, error, refetch } = useReceipt(receiptNumber ?? null);

  if (loading) return <Loading fullScreen message="Loading receipt..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Receipt" subtitle={`#${data.receiptNumber}`} showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 gap-4">
          {/* Header Info */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200" style={{ backgroundColor: '#FFFFFF' }}>
            <View className="items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">{data.receiptNumber}</Text>
              <Text className="text-sm text-slate-500 mt-0.5">
                {format(new Date(data.paymentDate), 'dd MMM yyyy')}
              </Text>
            </View>
            <Divider />
            <Row label="Student" value={data.student.name} />
            <Row label="Admission No." value={data.student.admissionNumber} />
            <Row label="Session" value={data.session.displayName || data.session.name} />
            <Row label="Installment" value={data.installmentLabel} />
            <Row label="Payment Method" value={methodLabel[data.paymentMethod] || data.paymentMethod} />
            {data.bankName && <Row label="Bank" value={data.bankName} />}
            {data.chequeNumber && <Row label="Cheque No." value={data.chequeNumber} />}
          </View>

          {/* Fee Breakdown */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200" style={{ backgroundColor: '#FFFFFF' }}>
            <Text className="text-sm font-semibold text-slate-700 mb-3">Fee Breakdown</Text>
            {(data.feeBreakdown ?? []).length === 0 ? (
              <Text className="text-xs text-muted-foreground text-center py-2">No breakdown available</Text>
            ) : (
              (data.feeBreakdown ?? []).map((item, idx) => (
                <Row key={idx} label={item.feeHeadName} value={`₹${item.amount.toLocaleString('en-IN')}`} />
              ))
            )}
            <Divider />
            <Row label="Installment Total" value={`₹${data.installmentTotal.toLocaleString('en-IN')}`} />
            {data.concessionAmount > 0 && (
              <Row label="Concession" value={`-₹${data.concessionAmount.toLocaleString('en-IN')}`} />
            )}
            {data.previousDue > 0 && (
              <Row label="Previous Due" value={`₹${data.previousDue.toLocaleString('en-IN')}`} />
            )}
            {data.advanceApplied > 0 && (
              <Row label="Advance Applied" value={`-₹${data.advanceApplied.toLocaleString('en-IN')}`} />
            )}
            <Divider />
            <Row label="Net Payable" value={`₹${data.netPayable.toLocaleString('en-IN')}`} />
          </View>

          {/* Payment Summary */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200" style={{ backgroundColor: '#FFFFFF' }}>
            <Text className="text-sm font-semibold text-slate-700 mb-3">Payment Summary</Text>
            <Row label="Amount Paid" value={`₹${data.amountPaid.toLocaleString('en-IN')}`} bold />
            {data.dueAmount > 0 && (
              <Row label="Remaining Due" value={`₹${data.dueAmount.toLocaleString('en-IN')}`} />
            )}
            {data.remarks && (
              <>
                <Divider />
                <Row label="Remarks" value={data.remarks} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
