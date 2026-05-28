import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <TextInput
        className={`border rounded-xl px-4 py-3.5 text-base text-foreground bg-white ${
          error ? 'border-danger' : 'border-border'
        } ${className || ''}`}
        placeholderTextColor="#6B6862"
        {...props}
      />
      {error && <Text className="text-xs text-danger">{error}</Text>}
    </View>
  );
}
