import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Required for openAuthSessionAsync to properly close SFSafariViewController
// when the custom scheme redirect is intercepted by iOS
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Checkout' }} />
      <Stack.Screen
        name="payment/success"
        options={{ title: 'Payment Complete', headerBackVisible: false }}
      />
    </Stack>
  );
}
