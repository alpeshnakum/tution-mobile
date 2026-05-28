# Phase 05 — Fees Screen

> **Goal:** Build the Fees screen showing total fee summary, collapsible installment cards with fee head breakdown, concession details, and payment history. Also build the Fee Receipt detail screen. No payment button yet — that is a future phase.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `studentId` (populated by Phase 03).
>
> **No new backend APIs required.** Uses existing student fee summary and receipt APIs.

---

## 1. API Contracts

### `GET /api/portal/student/fees`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "totalFees":      12000,
      "totalPaid":      9500,
      "totalDue":       2500,
      "advanceBalance": 0
    },
    "installments": [
      {
        "_id":          "inst1",
        "name":         "Quarter 1",
        "dueDate":      "2025-04-30T00:00:00.000Z",
        "status":       "paid",
        "grossAmount":  3000,
        "concession":   500,
        "netAmount":    2500,
        "paidAmount":   2500,
        "dueAmount":    0,
        "feeHeads": [
          { "name": "Tuition Fee", "amount": 2500 },
          { "name": "Lab Fee",     "amount": 500  }
        ]
      },
      {
        "_id":          "inst2",
        "name":         "Quarter 2",
        "dueDate":      "2025-07-31T00:00:00.000Z",
        "status":       "unpaid",
        "grossAmount":  3000,
        "concession":   0,
        "netAmount":    3000,
        "paidAmount":   0,
        "dueAmount":    3000,
        "feeHeads": [
          { "name": "Tuition Fee", "amount": 2500 },
          { "name": "Lab Fee",     "amount": 500  }
        ]
      }
    ],
    "paymentHistory": [
      {
        "_id":          "pay1",
        "receiptNumber":"REC-OAC-2025-0001",
        "amount":       2500,
        "paymentMode":  "cash",
        "paymentDate":  "2025-04-15T00:00:00.000Z",
        "installmentName": "Quarter 1"
      }
    ]
  },
  "error": null
}
```

**Installment status values:** `"paid"` | `"unpaid"` | `"partial"`

---

### `GET /api/fee-payments/receipt/:feePaymentId`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptNumber":  "REC-OAC-2025-0001",
    "paymentDate":    "2025-04-15T00:00:00.000Z",
    "paymentMode":    "cash",
    "amount":         2500,
    "branch": {
      "name":    "OAC Ahmedabad",
      "address": "123 CG Road, Ahmedabad",
      "phone":   "079-12345678"
    },
    "student": {
      "name":           "Ravi Patel",
      "admissionNumber":"ADM2425001",
      "className":      "Class 10",
      "sectionName":    "A"
    },
    "installmentName": "Quarter 1",
    "feeHeads": [
      { "name": "Tuition Fee", "amount": 2500, "paid": 2500 },
      { "name": "Lab Fee",     "amount": 500,  "paid": 0    }
    ],
    "grossAmount":  3000,
    "concession":   500,
    "netAmount":    2500,
    "paidAmount":   2500,
    "balanceDue":   0
  },
  "error": null
}
```

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export type InstallmentStatus = 'paid' | 'unpaid' | 'partial';

export interface FeeHead {
  name:   string;
  amount: number;
}

export interface Installment {
  _id:         string;
  name:        string;
  dueDate:     string;
  status:      InstallmentStatus;
  grossAmount: number;
  concession:  number;
  netAmount:   number;
  paidAmount:  number;
  dueAmount:   number;
  feeHeads:    FeeHead[];
}

export interface PaymentHistoryItem {
  _id:             string;
  receiptNumber:   string;
  amount:          number;
  paymentMode:     string;
  paymentDate:     string;
  installmentName: string;
}

export interface FeeData {
  totals: {
    totalFees:      number;
    totalPaid:      number;
    totalDue:       number;
    advanceBalance: number;
  };
  installments:   Installment[];
  paymentHistory: PaymentHistoryItem[];
}

export interface FeeHeadReceipt {
  name:   string;
  amount: number;
  paid:   number;
}

export interface ReceiptData {
  receiptNumber:   string;
  paymentDate:     string;
  paymentMode:     string;
  amount:          number;
  branch: {
    name:    string;
    address: string;
    phone:   string;
  };
  student: {
    name:           string;
    admissionNumber:string;
    className:      string;
    sectionName:    string;
  };
  installmentName: string;
  feeHeads:        FeeHeadReceipt[];
  grossAmount:     number;
  concession:      number;
  netAmount:       number;
  paidAmount:      number;
  balanceDue:      number;
}
```

---

## 3. New Files to Create

```
src/screens/fees/FeeScreen.tsx
src/screens/fees/FeeReceiptScreen.tsx
src/components/fees/TotalsBanner.tsx
src/components/fees/InstallmentAccordion.tsx
src/components/fees/FeeHeadBreakdown.tsx
src/components/fees/PaymentHistoryList.tsx
src/components/fees/FeesSkeleton.tsx
```

---

## 4. Component Specifications

### `TotalsBanner.tsx`

**Props:**
```ts
interface TotalsBannerProps {
  totals: FeeData['totals'];
}
```

**Visual:**
- Full-width card with `bg-primary/5 border border-primary/20`
- 2×2 grid of stat items:
  - Total Fees: `₹12,000` (muted foreground)
  - Paid: `₹9,500` (success colour)
  - Due: `₹2,500` (warning if > 0, else success)
  - Advance Balance: `₹0` (info colour if > 0)
- If advance balance is 0, hide it or show greyed out

---

### `InstallmentAccordion.tsx`

**Props:**
```ts
interface InstallmentAccordionProps {
  installment: Installment;
}
```

**Visual:**
- Collapsed state (default): installment name, due date, status badge, net amount, chevron-down icon
- Expanded state: shows `FeeHeadBreakdown` + concession row + totals row
- Tap header to toggle expanded/collapsed
- Use `useState` for local `isExpanded` toggle
- Use `Animated.Value` for smooth expand/collapse animation (height animation)

**Status badge colours:**
```ts
const installmentStatusBadge = (status: InstallmentStatus): BadgeVariant => {
  if (status === 'paid')    return 'success';
  if (status === 'partial') return 'warning';
  return 'destructive'; // unpaid
};
```

**Collapsed header layout:**
```
[Quarter 1]  [Due: 30 Apr]  [PAID ✓]  [₹2,500]  [chevron]
```

**Expanded body layout:**
```
FeeHeadBreakdown:
  Tuition Fee .............. ₹2,500
  Lab Fee .................. ₹500
                    Gross:   ₹3,000
  Concession:             - ₹500
                    Net:     ₹2,500
  Paid:                    ₹2,500
  Due:                     ₹0
```

---

### `FeeHeadBreakdown.tsx`

**Props:**
```ts
interface FeeHeadBreakdownProps {
  feeHeads:    FeeHead[];
  concession:  number;
  grossAmount: number;
  netAmount:   number;
  paidAmount:  number;
  dueAmount:   number;
}
```

**Visual:**
- Table-like layout: `name ... amount` rows
- Separator line
- Gross total
- Concession row (red, prefixed with `−`)
- Net amount (bold)
- Paid (green)
- Due (red if > 0)

---

### `PaymentHistoryList.tsx`

**Props:**
```ts
interface PaymentHistoryListProps {
  payments:   PaymentHistoryItem[];
  onViewReceipt: (feePaymentId: string) => void;
}
```

**Visual:**
- Section title: "Payment History"
- Each row: receipt number, installment name, date, payment mode badge, amount (green)
- Tap row → calls `onViewReceipt(payment._id)` → navigates to `FeeReceiptScreen`
- Empty state: "No payments recorded yet"

---

### `FeesSkeleton.tsx`

Skeleton placeholders:
- TotalsBanner: full-width block, height 100
- 3 InstallmentAccordion placeholders: blocks of height 64
- PaymentHistory: 3 rows of height 56

---

## 5. Fee Screen

### `src/screens/fees/FeeScreen.tsx`

```tsx
import React from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { FeesStackParamList } from '../../types/navigation';
import { apiClient }            from '../../services/api-client';
import { TotalsBanner }         from '../../components/fees/TotalsBanner';
import { InstallmentAccordion } from '../../components/fees/InstallmentAccordion';
import { PaymentHistoryList }   from '../../components/fees/PaymentHistoryList';
import { FeesSkeleton }         from '../../components/fees/FeesSkeleton';
import { NoInternetBanner }     from '../../components/shared/NoInternetBanner';
import { AppEmptyState }        from '../../components/shared/AppEmptyState';
import type { ApiResponse, FeeData } from '../../types/api';

type Props = { navigation: StackNavigationProp<FeesStackParamList, 'Fees'> };

async function fetchFees(): Promise<FeeData> {
  const { data } = await apiClient.get<ApiResponse<FeeData>>('/api/portal/student/fees');
  return data.data;
}

export function FeeScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['student-fees'],
    queryFn:  fetchFees,
  });

  if (isLoading) return <FeesSkeleton />;
  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load fees"
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
    >
      <NoInternetBanner />

      <View className="px-4 pt-4">
        {/* Totals banner */}
        {data && <TotalsBanner totals={data.totals} />}

        {/* Installments */}
        <Text className="text-base font-semibold text-foreground mt-5 mb-3">Installments</Text>
        {data?.installments.map((inst) => (
          <View key={inst._id} className="mb-3">
            <InstallmentAccordion installment={inst} />
          </View>
        ))}
        {data?.installments.length === 0 && (
          <Text className="text-sm text-muted">No installments configured.</Text>
        )}

        {/* Payment history */}
        <View className="mt-4 mb-6">
          <PaymentHistoryList
            payments={data?.paymentHistory ?? []}
            onViewReceipt={(id) => navigation.navigate('FeeReceipt', { feePaymentId: id })}
          />
        </View>
      </View>
    </ScrollView>
  );
}
```

---

## 6. Fee Receipt Screen

### `src/screens/fees/FeeReceiptScreen.tsx`

**Route params:** `{ feePaymentId: string }`

**Behaviour:**
- Fetches receipt data from `GET /api/fee-payments/receipt/:feePaymentId`
- Shows full receipt in a scrollable view
- "Share" button uses React Native `Share.share()` to share a text summary of the receipt

```tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import type { FeesStackParamList } from '../../types/navigation';
import { apiClient }        from '../../services/api-client';
import { AppLoader }        from '../../components/shared/AppLoader';
import { AppEmptyState }    from '../../components/shared/AppEmptyState';
import { AppCard }          from '../../components/shared/AppCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate, formatCurrency } from '../../utils/format';
import type { ApiResponse, ReceiptData } from '../../types/api';

type Props = {
  route: RouteProp<FeesStackParamList, 'FeeReceipt'>;
};

async function fetchReceipt(id: string): Promise<ReceiptData> {
  const { data } = await apiClient.get<ApiResponse<ReceiptData>>(`/api/fee-payments/receipt/${id}`);
  return data.data;
}

export function FeeReceiptScreen({ route }: Props) {
  const { feePaymentId } = route.params;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['receipt', feePaymentId],
    queryFn:  () => fetchReceipt(feePaymentId),
  });

  if (isLoading) return <AppLoader fullScreen />;
  if (isError || !data) return <AppEmptyState icon="alert-circle-outline" title="Receipt not found" />;

  const shareReceipt = async () => {
    await Share.share({
      message: [
        `Receipt: ${data.receiptNumber}`,
        `Date: ${formatDate(data.paymentDate)}`,
        `Student: ${data.student.name}`,
        `Installment: ${data.installmentName}`,
        `Amount Paid: ${formatCurrency(data.paidAmount)}`,
        `Balance Due: ${formatCurrency(data.balanceDue)}`,
      ].join('\n'),
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-4">
        {/* Branch header */}
        <AppCard className="items-center mb-4">
          <Text className="text-lg font-bold text-foreground">{data.branch.name}</Text>
          <Text className="text-xs text-muted mt-1 text-center">{data.branch.address}</Text>
          <Text className="text-xs text-muted">{data.branch.phone}</Text>
          <View className="border-t border-border w-full mt-3 pt-3">
            <Text className="text-sm font-semibold text-foreground text-center">FEE RECEIPT</Text>
            <Text className="text-xs text-muted text-center mt-0.5">{data.receiptNumber}</Text>
          </View>
        </AppCard>

        {/* Student info */}
        <AppCard className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-muted">Student</Text>
            <Text className="text-sm font-medium text-foreground">{data.student.name}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-muted">Admission No.</Text>
            <Text className="text-sm font-medium text-foreground">{data.student.admissionNumber}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-muted">Class</Text>
            <Text className="text-sm font-medium text-foreground">{data.student.className} {data.student.sectionName}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-muted">Date</Text>
            <Text className="text-sm font-medium text-foreground">{formatDate(data.paymentDate)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Mode</Text>
            <Text className="text-sm font-medium text-foreground capitalize">{data.paymentMode}</Text>
          </View>
        </AppCard>

        {/* Fee breakdown */}
        <AppCard className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">{data.installmentName}</Text>
          {data.feeHeads.map((fh, i) => (
            <View key={i} className="flex-row justify-between mb-1.5">
              <Text className="text-sm text-muted flex-1">{fh.name}</Text>
              <Text className="text-sm text-foreground">{formatCurrency(fh.amount)}</Text>
            </View>
          ))}
          <View className="border-t border-border mt-2 pt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted">Gross Amount</Text>
              <Text className="text-sm text-foreground">{formatCurrency(data.grossAmount)}</Text>
            </View>
            {data.concession > 0 && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-muted">Concession</Text>
                <Text className="text-sm text-success">− {formatCurrency(data.concession)}</Text>
              </View>
            )}
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-semibold text-foreground">Net Amount</Text>
              <Text className="text-sm font-semibold text-foreground">{formatCurrency(data.netAmount)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted">Paid</Text>
              <Text className="text-sm text-success font-medium">{formatCurrency(data.paidAmount)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Balance Due</Text>
              <Text className={`text-sm font-medium ${data.balanceDue > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(data.balanceDue)}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Share button */}
        <TouchableOpacity
          onPress={shareReceipt}
          className="flex-row items-center justify-center border border-border rounded-xl py-3 mb-6"
        >
          <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6B6862" />
          <Text className="ml-2 text-sm text-muted font-medium">Share Receipt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

---

## 7. Implementation Steps (in order)

1. Add fee types to `src/types/models.ts`
2. Build `FeesSkeleton.tsx`
3. Build `TotalsBanner.tsx`
4. Build `FeeHeadBreakdown.tsx`
5. Build `InstallmentAccordion.tsx` (with expand/collapse animation)
6. Build `PaymentHistoryList.tsx`
7. Build `FeeScreen.tsx`
8. Build `FeeReceiptScreen.tsx`
9. Replace stub files

---

## 8. Verification Checklist

- [ ] Fees screen loads with real data
- [ ] TotalsBanner shows correct total, paid, due amounts
- [ ] Installment accordion collapses by default, expands on tap
- [ ] Expanded accordion shows correct fee head breakdown, concession row, totals
- [ ] Installment status badge: green = paid, amber = partial, red = unpaid
- [ ] Payment history list shows past receipts
- [ ] Tapping a receipt row navigates to FeeReceiptScreen with correct data
- [ ] Receipt shows branch name, student info, fee breakdown, totals
- [ ] Share button opens native share sheet with receipt text
- [ ] Pull-to-refresh reloads fee data
- [ ] Skeleton shown while loading
- [ ] TypeScript: `npx tsc --noEmit` passes
