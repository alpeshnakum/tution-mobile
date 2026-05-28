import { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.error
    : focused
    ? Colors.primary
    : Colors.inputBorder;

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium" style={{ color: Colors.ink }}>
          {label}
        </Text>
      )}
      <TextInput
        className="rounded-xl px-4 py-3.5 text-base"
        style={[
          {
            backgroundColor: Colors.surface,
            color: Colors.ink,
            borderWidth: 1,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={Colors.inkMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <Text className="text-xs mt-1" style={{ color: Colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}
