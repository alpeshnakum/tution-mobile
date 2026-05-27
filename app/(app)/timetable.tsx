import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/auth-store';
import { useTimetable } from '@/hooks/use-timetable';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/shared/screen-header';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_SHORT: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

function getTodayKey(): string {
  const d = new Date().getDay(); // 0=Sun
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Timetable" showBack />
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="text-4xl">📅</Text>
        <Text className="text-slate-500 text-base">No class or session assigned</Text>
      </View>
    </SafeAreaView>
  );

  const todaySchedule = useMemo(() => {
    return data.find((d) => d.day === selectedDay)?.periods ?? [];
  }, [data, selectedDay]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScreenHeader title="Timetable" showBack />

      {/* Day tabs */}
      <View className="bg-white border-b border-slate-100 px-2 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-1.5 px-2">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = getTodayKey() === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl ${isSelected ? 'bg-indigo-500' : isToday ? 'bg-indigo-50' : 'bg-slate-50'}`}
                >
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
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
              <Text className="text-4xl">🏖️</Text>
              <Text className="text-slate-500 text-base">No classes scheduled</Text>
            </View>
          ) : (
            todaySchedule.map((period) => (
              <Card key={period.periodNumber}>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center">
                    <Text className="text-sm font-bold text-indigo-600">{period.periodNumber}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">{period.subject}</Text>
                    {period.teacherName ? (
                      <Text className="text-xs text-slate-500 mt-0.5">{period.teacherName}</Text>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-medium text-slate-700">{period.startTime}</Text>
                    <Text className="text-xs text-slate-400">–{period.endTime}</Text>
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
