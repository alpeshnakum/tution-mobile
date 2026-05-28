import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useTimetable } from '@/hooks/use-timetable';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';
import { EmptyBoxIcon } from '@/components/icons';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_SHORT: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

function getTodayKey(): string {
  const d = new Date().getDay();
  const map: Record<number, string> = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
  return map[d] || 'monday';
}

export default function TimetableScreen() {
  const { studentClassId, studentSectionId, studentSessionId, user } = useAuthStore();
  const branchId = user?.branchId ?? null;
  const { data, loading, error, refetch } = useTimetable(studentClassId, branchId, studentSessionId, studentSectionId);
  const [selectedDay, setSelectedDay] = useState(getTodayKey());

  if (loading && !data.length) return <Loading fullScreen message="Loading timetable..." />;
  if (error && !data.length) return <ErrorView message={error} onRetry={refetch} />;
  if (!studentClassId || !studentSessionId) return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Timetable" showBack />
      <View className="flex-1 items-center justify-center gap-3">
        <EmptyBoxIcon size={48} color="#6B6862" />
        <Text className="text-slate-500 text-base">No class or session assigned</Text>
      </View>
    </SafeAreaView>
  );

  const todaySchedule = useMemo(() => {
    return data.find((d) => d.day === selectedDay)?.periods ?? [];
  }, [data, selectedDay]);

  const todayKey = getTodayKey();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAF9F5' }}>
      <ScreenHeader title="Timetable" showBack />

      {/* Day tabs */}
      <View className="border-b border-slate-200 px-2 py-2" style={{ backgroundColor: '#FFFFFF' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-1.5 px-2">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = todayKey === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  className="px-3.5 py-2 rounded-xl"
                  style={
                    isSelected
                      ? { backgroundColor: '#CC785C' }
                      : isToday
                      ? { backgroundColor: '#F5F4EE' }
                      : { backgroundColor: '#FAF9F5' }
                  }
                >
                  <Text
                    className="text-xs font-semibold"
                    style={
                      isSelected
                        ? { color: '#FFFFFF' }
                        : isToday
                        ? { color: '#CC785C' }
                        : { color: '#6B6862' }
                    }
                  >
                    {DAY_SHORT[day]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <View className="px-4 py-4 gap-3">
          {todaySchedule.length === 0 ? (
            <View className="py-16 items-center gap-3">
              <EmptyBoxIcon size={48} color="#6B6862" />
              <Text className="text-slate-500 text-base">No classes scheduled</Text>
            </View>
          ) : (
            todaySchedule.map((period) => (
              <Card key={period.periodNumber}>
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: '#F5EDE8' }}
                  >
                    <Text className="text-sm font-bold" style={{ color: '#CC785C' }}>
                      {period.periodNumber}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">{period.subject}</Text>
                    {period.teacherName ? (
                      <Text className="text-xs text-slate-500 mt-0.5">{period.teacherName}</Text>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-medium text-slate-700">{period.startTime}</Text>
                    <Text className="text-xs text-slate-500">–{period.endTime}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
