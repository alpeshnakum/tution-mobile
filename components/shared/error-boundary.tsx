import { Component, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => {
    this.setState((s) => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (!this.state.hasError) {
      return (
        <View key={this.state.resetKey} style={{ flex: 1 }}>
          {this.props.children}
        </View>
      );
    }

    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-5xl mb-4">💥</Text>
        <Text className="text-xl font-bold text-foreground text-center mb-2">
          Something went wrong
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-6">
          An unexpected error occurred. Please try again.
        </Text>
        {__DEV__ && this.state.error ? (
          <ScrollView
            className="w-full max-h-40 mb-6 rounded-xl p-3"
            style={{ backgroundColor: 'rgba(196,69,54,0.1)' }}
          >
            <Text className="text-xs text-danger font-mono">{this.state.error.message}</Text>
          </ScrollView>
        ) : null}
        <Button title="Try Again" onPress={this.reset} />
      </View>
    );
  }
}
