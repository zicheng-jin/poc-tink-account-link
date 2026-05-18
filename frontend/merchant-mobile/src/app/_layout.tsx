import { Stack } from 'expo-router';

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
