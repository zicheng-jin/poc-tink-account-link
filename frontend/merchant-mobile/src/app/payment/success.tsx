import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SuccessScreen() {
  const { payment_request_id, status, orderId } = useLocalSearchParams<{
    payment_request_id: string;
    status: string;
    orderId: string;
  }>();
  const router = useRouter();

  const isSuccess = !status || status === 'success';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{isSuccess ? '✅' : '❌'}</Text>
      </View>

      <Text style={styles.title}>{isSuccess ? 'Payment Complete' : 'Payment Failed'}</Text>

      <Text style={styles.subtitle}>
        {isSuccess
          ? 'Your bank transfer has been authorized.'
          : 'Something went wrong with your payment.'}
      </Text>

      <View style={styles.card}>
        <Row label="Status" value={status ?? '—'} highlight={isSuccess} />
        <Row label="Order ID" value={orderId ?? '—'} />
        <Row label="Payment Request ID" value={payment_request_id ?? '—'} mono />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Back to Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text
        style={[rowStyles.value, highlight && rowStyles.success, mono && rowStyles.mono]}
        numberOfLines={2}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: { marginBottom: 16 },
  icon: { fontSize: 64 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: { fontSize: 13, color: '#64748b', flex: 1 },
  value: { fontSize: 13, color: '#334155', fontWeight: '600', flex: 2, textAlign: 'right' },
  success: { color: '#16a34a' },
  mono: { fontSize: 11, fontFamily: 'monospace' },
});
