import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentApi, userApi, errorMessage } from "../services/api";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Singleton script loader to ensure Razorpay SDK script loads ONLY ONCE globally
let scriptLoadPromise = null;

function loadRazorpaySdk() {
  if (window.Razorpay) {
    console.log("[Razorpay SDK] Already available on window object.");
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    console.log(
      "[Razorpay SDK] Script load already in progress, reusing existing promise.",
    );
    return scriptLoadPromise;
  }

  console.log(
    "[Razorpay SDK] Injecting script tag into document head:",
    RAZORPAY_SCRIPT_SRC,
  );

  scriptLoadPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existingScript) {
      console.log(
        "[Razorpay SDK] Found existing script element in DOM. Waiting for load...",
      );
      existingScript.addEventListener("load", () => {
        console.log("[Razorpay SDK] Existing script element finished loading.");
        resolve(true);
      });
      existingScript.addEventListener("error", () => {
        console.error(
          "[Razorpay SDK] Failed to load Razorpay script from existing tag.",
        );
        scriptLoadPromise = null;
        resolve(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      console.log(
        "[Razorpay SDK] Successfully loaded and initialized on window.Razorpay.",
      );
      resolve(true);
    };
    script.onerror = (err) => {
      console.error(
        "[Razorpay SDK] Failed to download Razorpay SDK script:",
        err,
      );
      scriptLoadPromise = null;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Payment page — integrates Razorpay Checkout into the booking flow.
 * Reached from Bookings.jsx when user clicks "Pay Now" on a CONFIRMED booking.
 * Query params: ?bookingId=1&amount=2500
 */
export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const bookingId = Number(searchParams.get("bookingId"));
  const amount = Number(searchParams.get("amount"));
  const booking = location.state?.booking;

  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // null | { success, transactionId }
  const [userInfo, setUserInfo] = useState(null);
  const isPayingRef = useRef(false);

  // Preload Razorpay SDK script and fetch logged-in user profile on component mount
  useEffect(() => {
    console.log(
      "[Payment Page Mounted] Booking ID:",
      bookingId,
      "| Amount:",
      amount,
    );

    if (!bookingId || !amount) {
      console.error(
        "[Payment Page] Missing bookingId or amount in query parameters.",
      );
      toast.error("Invalid payment request. Please go back to bookings.");
      navigate("/bookings");
      return;
    }

    loadRazorpaySdk();

    // Fetch user profile to get logged-in user's phone and details
    userApi
      .me()
      .then((res) => {
        console.log("[Payment Page] Logged-in user profile fetched:", res.data);
        if (res.data) {
          setUserInfo(res.data);
        }
      })
      .catch((err) => {
        console.warn(
          "[Payment Page] Could not fetch profile via userApi.me():",
          err,
        );
      });
  }, [bookingId, amount, navigate]);

  const handlePayNow = async () => {
    if (processing || isPayingRef.current) {
      console.warn(
        "[Payment Page] Payment process already in progress. Ignoring duplicate click.",
      );
      return;
    }

    isPayingRef.current = true;
    setProcessing(true);

    try {
      // Step 1: Ensure SDK loaded
      console.log("[Payment Step 1] Verifying Razorpay SDK status...");
      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady || !window.Razorpay) {
        throw new Error(
          "Razorpay Checkout SDK could not be loaded. Please check network connection or disable ad blockers.",
        );
      }
      console.log("[Payment Step 1 Success] Razorpay SDK is ready.");

      // Step 2: Call ASP.NET Core PaymentService create-order API
      console.log(
        `[Payment Step 2] Calling create-order API: BookingId=${bookingId}, Amount=${amount}...`,
      );
      toast.info("Initializing payment...", { autoClose: 1500 });

      const response = await paymentApi.createOrder(bookingId, amount);
      console.log(
        "[Payment Step 2 Response] Create order response received:",
        response,
      );

      const orderData = response?.data;
      if (!orderData) {
        throw new Error("Empty response received from Payment Service.");
      }

      // Handle camelCase and PascalCase property names safely
      const isSuccess = orderData.success ?? orderData.Success;
      const orderId = orderData.orderId ?? orderData.OrderId;
      const razorpayKey = orderData.key ?? orderData.Key;
      const orderAmount = orderData.amount ?? orderData.Amount;
      const currency = orderData.currency ?? orderData.Currency ?? "INR";
      const message = orderData.message ?? orderData.Message;

      console.log("[Payment Step 2 Parsed Data]:", {
        isSuccess,
        orderId,
        razorpayKey,
        orderAmount,
        currency,
        message,
      });

      if (!isSuccess || !orderId) {
        throw new Error(message || "Failed to create Razorpay payment order.");
      }

      if (!razorpayKey) {
        throw new Error(
          "Razorpay Key ID missing from server response. Check appsettings.json configuration.",
        );
      }

      // Step 3: Construct Razorpay options object
      const amountInPaise = Math.round(Number(orderAmount) * 100);
      console.log(
        `[Payment Step 3] Constructing Razorpay checkout options (Amount in paise: ${amountInPaise}, Order ID: ${orderId})...`,
      );

      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const firstName = userInfo?.firstName || userLocal.firstName || "";
      const lastName = userInfo?.lastName || userLocal.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Guest User";
      const userEmail = userInfo?.email || userLocal.email || "";
      const userPhone = userInfo?.phone || userLocal.phone || "9876543210";

      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: currency,
        name: "Stay Nest",
        description: `Booking #${bookingId} Payment`,
        order_id: orderId,

        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI / QR",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.other"], //"block.upi", 
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        handler: async function (paymentResponse) {
          console.log(
            "[Payment Step 4] Razorpay payment completed by user. Callback response:",
            paymentResponse,
          );
          toast.info("Verifying payment...", { autoClose: 2000 });

          try {
            const verifyPayload = {
              bookingId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            };

            console.log(
              "[Payment Step 4] Sending verify request to Payment Service:",
              verifyPayload,
            );
            const verifyResponse =
              await paymentApi.verifyPayment(verifyPayload);
            console.log(
              "[Payment Step 4 Response] Verify API response:",
              verifyResponse,
            );

            const verifyData = verifyResponse?.data;
            const isVerified = verifyData?.success ?? verifyData?.Success;
            const txnId =
              verifyData?.transactionId ??
              verifyData?.TransactionId ??
              paymentResponse.razorpay_payment_id;

            if (isVerified) {
              console.log(
                `[Payment Step 4 Success] Payment verified! Transaction ID: ${txnId}`,
              );
              setPaymentResult({
                success: true,
                transactionId: txnId,
              });
              toast.success("Payment successful! Booking confirmed.");
            } else {
              console.error(
                "[Payment Step 4 Failed] Signature verification failed:",
                verifyData,
              );
              setPaymentResult({ success: false });
              toast.error(
                verifyData?.message ??
                  verifyData?.Message ??
                  "Payment verification failed.",
              );
            }
          } catch (verifyErr) {
            console.error(
              "[Payment Step 4 Exception] Verification call failed:",
              verifyErr,
            );
            setPaymentResult({ success: false });
            toast.error(
              errorMessage(verifyErr, "Payment verification failed."),
            );
          } finally {
            isPayingRef.current = false;
            setProcessing(false);
          }
        },

        prefill: {
          name: fullName,
          email: userEmail,
          contact: userPhone,
        },

        theme: {
          color: "#6366f1",
        },

        modal: {
          ondismiss: () => {
            console.log(
              "[Payment Modal Closed] User dismissed Razorpay checkout window.",
            );
            isPayingRef.current = false;
            setProcessing(false);
            toast.warn("Payment cancelled.");
          },
        },
      };

      console.log(
        "[Payment Step 3] Creating window.Razorpay instance with options:",
        options,
      );
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (failResponse) {
        console.error("[Razorpay Event: payment.failed]:", failResponse);
        isPayingRef.current = false;
        setProcessing(false);
        toast.error(
          `Payment failed: ${failResponse.error?.description || "Transaction rejected"}`,
        );
      });

      console.log("[Payment Step 3] Executing rzp.open() to launch modal...");
      rzp.open();
    } catch (err) {
      console.error("[Payment Process Exception]:", err);
      isPayingRef.current = false;
      setProcessing(false);
      const userMessage = errorMessage(
        err,
        err.message || "Payment initialization failed.",
      );
      toast.error(userMessage);
    }
  };

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (paymentResult?.success) {
    return (
      <section className="portal-page">
        <div
          className="container"
          style={{ maxWidth: 520, margin: "0 auto", paddingTop: 60 }}
        >
          <article
            className="module-card"
            style={{ textAlign: "center", padding: "3rem 2rem" }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#22c55e", marginBottom: 8 }}>
              Payment Successful!
            </h2>
            <p className="muted">Your booking has been confirmed.</p>

            <div
              className="detail-grid"
              style={{ marginTop: 24, textAlign: "left" }}
            >
              <span>
                Booking ID<strong>#{bookingId}</strong>
              </span>
              <span>
                Amount Paid
                <strong>₹{Number(amount).toLocaleString("en-IN")}</strong>
              </span>
              <span>
                Transaction ID
                <strong style={{ wordBreak: "break-all" }}>
                  {paymentResult.transactionId}
                </strong>
              </span>
              <span>
                Status<strong style={{ color: "#22c55e" }}>CONFIRMED</strong>
              </span>
            </div>

            <div className="d-flex gap-2 mt-4 justify-content-center">
              <button
                className="btn primary-action"
                onClick={() => navigate("/bookings")}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/")}
              >
                Go Home
              </button>
            </div>
          </article>
        </div>
      </section>
    );
  }

  // ── FAILURE SCREEN ───────────────────────────────────────────────────────────
  if (paymentResult?.success === false) {
    return (
      <section className="portal-page">
        <div
          className="container"
          style={{ maxWidth: 520, margin: "0 auto", paddingTop: 60 }}
        >
          <article
            className="module-card"
            style={{ textAlign: "center", padding: "3rem 2rem" }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: "#ef4444", marginBottom: 8 }}>
              Payment Failed
            </h2>
            <p className="muted">
              The payment could not be verified. Your booking is not confirmed.
            </p>
            <div className="d-flex gap-2 mt-4 justify-content-center">
              <button
                className="btn primary-action"
                onClick={() => {
                  setPaymentResult(null);
                  isPayingRef.current = false;
                  setProcessing(false);
                }}
              >
                Try Again
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/bookings")}
              >
                Back to Bookings
              </button>
            </div>
          </article>
        </div>
      </section>
    );
  }

  // ── PAYMENT FORM ─────────────────────────────────────────────────────────────
  return (
    <section className="portal-page">
      <div
        className="container"
        style={{ maxWidth: 520, margin: "0 auto", paddingTop: 10 }}
      >
        <div
          className="page-heading"
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <span className="section-label">Checkout</span>
          <h1>Complete Payment</h1>
        </div>

        <article className="module-card">
          <h4>Booking Summary</h4>
          <div className="detail-grid" style={{ marginTop: 16 }}>
            <span>
              Booking ID<strong>#{bookingId}</strong>
            </span>
            {booking?.propertyTitle && (
              <span>
                Property<strong>{booking.propertyTitle}</strong>
              </span>
            )}
            {booking?.roomNumber && (
              <span>
                Room<strong>{booking.roomNumber}</strong>
              </span>
            )}
            {booking?.checkInDate && (
              <span>
                Check-In<strong>{booking.checkInDate}</strong>
              </span>
            )}
            {booking?.checkOutDate && (
              <span>
                Check-Out<strong>{booking.checkOutDate}</strong>
              </span>
            )}
            <span>
              Total Amount
              <strong style={{ fontSize: "1.2rem", color: "#6366f1" }}>
                ₹{Number(amount).toLocaleString("en-IN")}
              </strong>
            </span>
          </div>

          {/* <div style={{ marginTop: 28, padding: "16px", background: "rgba(99,102,241,0.08)", borderRadius: 8, fontSize: 13, color: "#666" }}>
            <strong>🔒 Secure Payment</strong> via Razorpay. Your card details are never stored on our servers.
            <br />
            <em>Test Mode: Use card or UPI (Google Pay / PhonePe / Paytm / VPA).</em>
          </div> */}

          <button
            className="btn primary-action w-100"
            style={{ marginTop: 28, padding: "14px", fontSize: "1.1rem" }}
            onClick={handlePayNow}
            disabled={processing}
          >
            {processing
              ? "Initializing…"
              : `Pay ₹${Number(amount).toLocaleString("en-IN")}`}
          </button>

          <button
            className="btn btn-outline-secondary w-100"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/bookings")}
            disabled={processing}
          >
            Cancel
          </button>
        </article>
      </div>
    </section>
  );
}
