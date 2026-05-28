import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { useChildren } from '@/hooks/use-children';
import { Loading } from '@/components/shared/loading';
import { ErrorView } from '@/components/shared/error-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SelectChildScreen() {
  const router = useRouter();
  const { setStudentId, setStudentMeta, logout, user } = useAuthStore();
  const { data: children, loading, error, refetch } = useChildren();

  const handleSelect = async (child: typeof children[0]) => {
    await setStudentMeta(child.classId, child.sectionId ?? '', '');
    setStudentId(child.id);
    router.replace('/(app)');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading) return <Loading fullScreen message="Loading your children..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Select Child</Text>
          <Text className="text-muted-foreground text-sm mt-0.5">
            Welcome, {user?.firstName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="px-3 py-1.5 border border-border rounded-xl">
          <Text className="text-sm text-muted-foreground font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-2">
        {children.length === 0 ? (
          <View className="py-16 items-center gap-3">
            <Text className="text-4xl">👶</Text>
            <Text className="text-muted-foreground text-base">No children linked to your account</Text>
            <Text className="text-muted-foreground text-sm text-center">Contact the school to link your children.</Text>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {children.map((child) => (
              <TouchableOpacity key={child.id} onPress={() => handleSelect(child)} activeOpacity={0.8}>
                <Card>
                  <View className="flex-row items-center gap-4">
                    <View className="w-14 h-14 bg-primary-light rounded-2xl items-center justify-center">
                      <Text className="text-2xl">🎓</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-foreground">{child.name}</Text>
                        {child.isPrimary && <Badge label="Primary" variant="primary" />}
                      </View>
                      <Text className="text-xs text-muted-foreground mt-0.5">ADM: {child.admissionNumber}</Text>
                      {child.relation && (
                        <Text className="text-xs text-muted-foreground capitalize mt-0.5">{child.relation}</Text>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-xl">›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
