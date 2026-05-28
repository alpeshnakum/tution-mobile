import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { BackIcon, MenuIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  showMenu,
  rightElement,
}: ScreenHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View
      className="px-5 pt-4 pb-3"
      style={{
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {showMenu && (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <MenuIcon size={24} color={Colors.inkMuted} />
            </TouchableOpacity>
          )}
          {showBack && !showMenu && (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.back()}
            >
              <BackIcon size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: Colors.ink }}>{title}</Text>
            {subtitle && (
              <Text className="text-sm mt-0.5" style={{ color: Colors.inkMuted }}>{subtitle}</Text>
            )}
          </View>
        </View>
        {rightElement}
      </View>
    </View>
  );
}
