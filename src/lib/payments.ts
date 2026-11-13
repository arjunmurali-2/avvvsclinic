import 'server-only';

/*
 * Payments, kept ready but switched off. Online consultations are booked without paying on the
 * site for now (the "none" provider), so an appointment is confirmed the moment it is made.
 *
 * To take payment later (Razorpay, or any gateway):
 *   1. write an adapter that implements PaymentProvider (createOrder, verify, refund);
 *   2. return it from paymentProvider() when PAYMENT_PROVIDER names it;
 *   3. add its webhook route, which calls confirmPaid() in lib/appointments.ts.
 * Nothing else changes: createAppointment() already holds the slot as "pending_payment" for
 * HOLD_MINUTES when the provider needs payment, and the table already has the payment columns.
 */

export const HOLD_MINUTES = 10;

export interface PaymentOrder { provider: string; orderRef: string; amountPaise: number; /** whatever the browser needs to open the gateway's checkout */ checkout: Record<string, unknown> }

export interface PaymentProvider {
  id: string;
  /** false: bookings confirm at once, with no payment step */
  required: boolean;
  createOrder(input: { ref: string; amountPaise: number; name: string; email: string; phone: string }): Promise<PaymentOrder>;
  /** checks a gateway callback or webhook really came from the gateway; returns the order it pays for */
  verify(payload: unknown, signature: string | null): Promise<{ orderRef: string; paymentRef: string } | null>;
  refund(paymentRef: string, amountPaise: number): Promise<void>;
}

const none: PaymentProvider = {
  id: 'none',
  required: false,
  async createOrder() { throw new Error('Online payment is not switched on.'); },
  async verify() { return null; },
  async refund() { /* nothing was paid */ },
};

export function paymentProvider(): PaymentProvider {
  // const id = process.env.PAYMENT_PROVIDER?.trim();
  // if (id === 'razorpay') return razorpay;   // lib/payments-razorpay.ts, when it exists
  return none;
}
