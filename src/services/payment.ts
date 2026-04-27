/* ─── Razorpay global type ──────────────────────────────────────────────── */

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const BASE_URL = "https://maidan-iq-api-production.up.railway.app";

const RAZORPAY_KEY =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) ?? "";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.head.appendChild(script);
  });
}

/* ─── Main export ───────────────────────────────────────────────────────── */

/**
 * Initiates the Razorpay season pass flow.
 * Calls backend to create an order, loads the Razorpay SDK,
 * opens the checkout modal, and calls onSuccess when payment is verified.
 */
export async function initiateSeasonPass(
  userEmail: string,
  userName: string,
  onSuccess: () => void,
): Promise<void> {
  // 1. Create order on backend
  const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail }),
  });
  if (!orderRes.ok) throw new Error(`Order creation failed: ${orderRes.status}`);
  const { orderId, amount, currency } = (await orderRes.json()) as {
    orderId: string;
    amount: number;
    currency: string;
  };

  // 2. Load Razorpay SDK
  await loadRazorpayScript();

  // 3. Open checkout
  return new Promise((resolve, reject) => {
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: amount ?? 49900,
      currency: currency ?? "INR",
      name: "MaidanIQ",
      description: "IPL 2026 Season Pass",
      order_id: orderId,
      prefill: { name: userName, email: userEmail },
      theme: { color: "#FF6B00" },
      modal: {
        ondismiss: () => resolve(), // user closed modal — not an error
      },
      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) throw new Error("Payment verification failed");
          onSuccess();
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    };

    new window.Razorpay(options).open();
  });
}
