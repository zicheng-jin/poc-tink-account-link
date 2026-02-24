import { create } from 'zustand';

export type PaymentMode = 'iframe' | 'redirect' | 'hybrid';
export type PaymentStatus = 'idle' | 'pending' | 'success' | 'error';

interface CheckoutState {
  mode: PaymentMode;
  paymentStatus: PaymentStatus;
  paymentRequestId: string | null;
  iframeOpen: boolean;
  errorMessage: string | null;

  setMode: (mode: PaymentMode) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  setPaymentRequestId: (id: string | null) => void;
  openIframe: () => void;
  closeIframe: () => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  mode: 'iframe',
  paymentStatus: 'idle',
  paymentRequestId: null,
  iframeOpen: false,
  errorMessage: null,

  setMode: (mode) => set({ mode, paymentStatus: 'idle', paymentRequestId: null, errorMessage: null }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
  setPaymentRequestId: (paymentRequestId) => set({ paymentRequestId }),
  openIframe: () => set({ iframeOpen: true }),
  closeIframe: () => set({ iframeOpen: false }),
  setError: (errorMessage) => set({ errorMessage }),
  reset: () => set({ paymentStatus: 'idle', paymentRequestId: null, iframeOpen: false, errorMessage: null }),
}));
