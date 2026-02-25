import { create } from 'zustand';

export type PaymentMode = 'iframe' | 'redirect' | 'hybrid';
export type PaymentStatus = 'idle' | 'loading' | 'ready' | 'verifying' | 'success' | 'error';
export type PaymentStep = 1 | 2 | 3; // 1=Select Bank, 2=Authorize, 3=Done

interface PaymentState {
  mode: PaymentMode;
  returnUrl: string | null;
  tinkLinkUrl: string | null;
  paymentRequestId: string | null;
  status: PaymentStatus;
  step: PaymentStep;
  errorMessage: string | null;

  setMode: (mode: PaymentMode) => void;
  setReturnUrl: (url: string) => void;
  setTinkLinkUrl: (url: string) => void;
  setPaymentRequestId: (id: string) => void;
  setStatus: (status: PaymentStatus) => void;
  setStep: (step: PaymentStep) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  mode: 'iframe',
  returnUrl: null,
  tinkLinkUrl: null,
  paymentRequestId: null,
  status: 'idle',
  step: 1,
  errorMessage: null,

  setMode: (mode) => set({ mode }),
  setReturnUrl: (returnUrl) => set({ returnUrl }),
  setTinkLinkUrl: (tinkLinkUrl) => set({ tinkLinkUrl }),
  setPaymentRequestId: (paymentRequestId) => set({ paymentRequestId }),
  setStatus: (status) => set({ status }),
  setStep: (step) => set({ step }),
  setError: (errorMessage) => set({ status: 'error', errorMessage }),
  reset: () =>
    set({ status: 'idle', step: 1, tinkLinkUrl: null, paymentRequestId: null, errorMessage: null }),
}));
