import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { config } from '@/lib/config';

const ORDER_ITEMS = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, qty: 1 },
  { id: 2, name: 'USB-C Hub', price: 29.99, qty: 1 },
  { id: 3, name: 'Screen Cleaner', price: 4.98, qty: 1 },
] as const;

const ORDER_TOTAL = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);

export default function CheckoutScreen() {
  const [orderId] = useState(() => `ORD-${Date.now()}`);
  const [loading, setLoading] = useState(false);

  async function handlePayByBank() {
    setLoading(true);
    try {
      // Deep link the OS will intercept after PPB completes
      const returnUrl = `merchantcheckout://payment/success?orderId=${orderId}`;
      // Open the existing PPB web app in redirect mode
      const ppbUrl = `${config.ppbAppUrl}/?mode=redirect&returnUrl=${encodeURIComponent(returnUrl)}`;

      await WebBrowser.openBrowserAsync(ppbUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Order Summary</Text>

      <View style={styles.card}>
        <Text style={styles.orderId}>Order {orderId}</Text>

        {ORDER_ITEMS.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.itemName}>
              {item.qty}× {item.name}
            </Text>
            <Text style={styles.itemPrice}>€{(item.price * item.qty).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>€{ORDER_TOTAL.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePayByBank}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay by Bank</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        You will be redirected to your bank to authorize the payment.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  itemName: { fontSize: 15, color: '#334155', flex: 1 },
  itemPrice: { fontSize: 15, color: '#334155', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  totalAmount: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
});
