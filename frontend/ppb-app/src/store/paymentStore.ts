import { create } from 'zustand';

export type PaymentMode = 'iframe' | 'redirect' | 'hybrid';
export type PaymentStatus = 'idle' | 'loading' | 'ready' | 'verifying' | 'success' | 'error';

interface PaymentState {
  mode: PaymentMode;
  returnUrl: string | null;
  tinkLinkUrl: string | null;
  paymentRequestId: string | null;
  status: PaymentStatus;
  errorMessage: string | null;

  setMode: (mode: PaymentMode) => void;
  setReturnUrl: (url: string) => void;
  setTinkLinkUrl: (url: string) => void;
  setPaymentRequestId: (id: string) => void;
  setStatus: (status: PaymentStatus) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  mode: 'iframe',
  returnUrl: null,
  tinkLinkUrl: null,
  paymentRequestId: null,
  status: 'idle',
  errorMessage: null,

  setMode: (mode) => set({ mode }),
  setReturnUrl: (returnUrl) => set({ returnUrl }),
  setTinkLinkUrl: (tinkLinkUrl) => set({ tinkLinkUrl }),
  setPaymentRequestId: (paymentRequestId) => set({ paymentRequestId }),
  setStatus: (status) => set({ status }),
  setError: (errorMessage) => set({ status: 'error', errorMessage }),
  reset: () =>
    set({ status: 'idle', tinkLinkUrl: null, paymentRequestId: null, errorMessage: null }),
}));
