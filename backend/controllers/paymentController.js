import axios from "axios";
import crypto from "crypto";
import pool from "../config/db.js";

const PAYSTACK_API_URL = "https://api.paystack.co";

function getPaystackClient() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey) {
    const error = new Error(
      "Paystack is not configured. Add PAYSTACK_SECRET_KEY to backend/.env."
    );
    error.statusCode = 503;
    throw error;
  }

  return axios.create({
    baseURL: PAYSTACK_API_URL,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });
}

function createPaymentReference(bookingId) {
  return `WVN-${bookingId}-${Date.now()}`;
}

function getCallbackUrl() {
  return (
    process.env.PAYSTACK_CALLBACK_URL ||
    "http://localhost:5000/api/payments/callback"
  );
}

function getPortalBookingsUrl() {
  return `${
    process.env.CLIENT_PORTAL_URL || "http://localhost:5173"
  }/portal/bookings`;
}

function getCheckoutAmount(booking) {
  const bookingCurrency = String(booking.currency || "USD").toUpperCase();

  const checkoutCurrency = String(
    process.env.PAYSTACK_PAYMENT_CURRENCY || bookingCurrency
  ).toUpperCase();

  const bookingAmount = Number(booking.quoted_amount);

  if (!Number.isFinite(bookingAmount) || bookingAmount <= 0) {
    const error = new Error("The booking has an invalid payment amount.");
    error.statusCode = 400;
    throw error;
  }

  if (bookingCurrency === checkoutCurrency) {
    return {
      checkoutCurrency,
      checkoutAmount: bookingAmount,
    };
  }

  if (bookingCurrency === "USD" && checkoutCurrency === "KES") {
    const usdToKes = Number(process.env.PAYSTACK_USD_TO_KES || 129);

    if (!Number.isFinite(usdToKes) || usdToKes <= 0) {
      const error = new Error(
        "PAYSTACK_USD_TO_KES must contain a valid exchange rate."
      );
      error.statusCode = 500;
      throw error;
    }

    return {
      checkoutCurrency: "KES",
      checkoutAmount: Math.round(bookingAmount * usdToKes * 100) / 100,
    };
  }

  const error = new Error(
    `Wooven cannot convert ${bookingCurrency} to ${checkoutCurrency} for checkout.`
  );
  error.statusCode = 400;
  throw error;
}

async function verifyPaystackReference(reference, clientUserId = null) {
  const paymentQuery = `
    SELECT
      p.id,
      p.booking_id,
      p.payment_reference,
      p.amount,
      p.currency,
      p.status AS payment_record_status,
      b.client_user_id,
      b.booking_reference,
      b.payment_status
    FROM payments p
    INNER JOIN bookings b ON b.id = p.booking_id
    WHERE p.payment_reference = ?
    ${clientUserId ? "AND b.client_user_id = ?" : ""}
    LIMIT 1
  `;

  const queryValues = clientUserId
    ? [reference, clientUserId]
    : [reference];

  const [paymentRows] = await pool.query(paymentQuery, queryValues);

  if (!paymentRows.length) {
    const error = new Error("Payment record not found.");
    error.statusCode = 404;
    throw error;
  }

  const payment = paymentRows[0];
  const paystack = getPaystackClient();

  const response = await paystack.get(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  const transaction = response.data?.data;
  const expectedAmount = Math.round(Number(payment.amount) * 100);

  const isVerified =
    transaction?.status === "success" &&
    transaction?.reference === payment.payment_reference &&
    String(transaction?.currency || "").toUpperCase() ===
      String(payment.currency || "").toUpperCase() &&
    Number(transaction?.amount) === expectedAmount;

  if (!isVerified) {
    const terminalFailureStatuses = ["failed", "abandoned", "reversed"];
    const isFailed = terminalFailureStatuses.includes(transaction?.status);

    await pool.query(
      `UPDATE payments SET status = ? WHERE id = ?`,
      [isFailed ? "failed" : "pending", payment.id]
    );

    return {
      verified: false,
      payment,
      transaction,
      paymentStatus: isFailed ? "failed" : "pending",
    };
  }

  await pool.query(
    `UPDATE payments
     SET status = 'successful',
         provider_transaction_id = ?,
         paid_at = NOW()
     WHERE id = ?`,
    [String(transaction.id), payment.id]
  );

  await pool.query(
    `UPDATE bookings
SET payment_status = 'paid',
    final_amount = quoted_amount
WHERE id = ?`,
    [payment.booking_id]
  );

  return {
    verified: true,
    payment,
    transaction,
    paymentStatus: "paid",
  };
}

export async function initiatePaystackPayment(req, res, next) {
  let paymentReference = null;

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: "A booking is required before payment can begin.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.quoted_amount,
        b.currency,
        b.payment_status,
        u.email,
        u.first_name,
        u.last_name,
        u.phone
      FROM bookings b
      INNER JOIN users u ON u.id = b.client_user_id
      WHERE b.id = ? AND b.client_user_id = ?
      LIMIT 1`,
      [bookingId, req.userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Booking not found.",
      });
    }

    const booking = rows[0];

    if (booking.payment_status === "paid") {
      return res.status(400).json({
        error: "This booking has already been paid.",
      });
    }

    if (!booking.email) {
      return res.status(400).json({
        error: "Your account needs a valid email address before payment.",
      });
    }

    const { checkoutCurrency, checkoutAmount } = getCheckoutAmount(booking);

    paymentReference = createPaymentReference(booking.id);

    await pool.query(
      `INSERT INTO payments
        (booking_id, payment_reference, provider, amount, currency, status)
       VALUES (?, ?, 'card', ?, ?, 'initiated')`,
      [
        booking.id,
        paymentReference,
        checkoutAmount,
        checkoutCurrency,
      ]
    );

    const paystack = getPaystackClient();

    const response = await paystack.post("/transaction/initialize", {
      email: booking.email,
      amount: String(Math.round(checkoutAmount * 100)),
      currency: checkoutCurrency,
      reference: paymentReference,
      callback_url: getCallbackUrl(),
      channels: ["card"],
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        customer_name: `${booking.first_name || ""} ${
          booking.last_name || ""
        }`.trim(),
        customer_phone: booking.phone || "",
      },
    });

    const checkoutUrl = response.data?.data?.authorization_url;

    if (!checkoutUrl) {
      const error = new Error("Paystack did not return a checkout link.");
      error.statusCode = 502;
      throw error;
    }

    await pool.query(
      `UPDATE payments SET status = 'pending' WHERE payment_reference = ?`,
      [paymentReference]
    );

    return res.json({
      checkoutUrl,
      paymentReference,
      bookingReference: booking.booking_reference,
      checkoutCurrency,
      checkoutAmount,
    });
  } catch (error) {
    if (paymentReference) {
      await pool
        .query(
          `UPDATE payments SET status = 'failed' WHERE payment_reference = ?`,
          [paymentReference]
        )
        .catch(() => {});
    }

    return next(error);
  }
}

export async function verifyPaystackPayment(req, res, next) {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        error: "Payment reference is missing.",
      });
    }

    const result = await verifyPaystackReference(reference, req.userId);

    if (!result.verified) {
      return res.status(400).json({
        verified: false,
        paymentStatus: result.paymentStatus,
        error: "Payment has not been completed yet.",
      });
    }

    return res.json({
      verified: true,
      paymentStatus: "paid",
      bookingId: result.payment.booking_id,
      bookingReference: result.payment.booking_reference,
    });
  } catch (error) {
    return next(error);
  }
}

export async function paystackCallback(req, res) {
  const reference = req.query.reference;
  const bookingsUrl = new URL(getPortalBookingsUrl());

  if (!reference) {
    bookingsUrl.searchParams.set("payment", "failed");
    return res.redirect(bookingsUrl.toString());
  }

  try {
    const result = await verifyPaystackReference(reference);

    bookingsUrl.searchParams.set(
      "payment",
      result.verified ? "success" : result.paymentStatus
    );

    bookingsUrl.searchParams.set("reference", reference);
  } catch (error) {
    console.error("Paystack callback error:", error.message);

    bookingsUrl.searchParams.set("payment", "failed");
    bookingsUrl.searchParams.set("reference", reference);
  }

  return res.redirect(bookingsUrl.toString());
}

export async function handlePaystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!signature || !secretKey) {
    return res.sendStatus(401);
  }

  const expectedSignature = crypto
    .createHmac("sha512", secretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const validSignature =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  if (!validSignature) {
    return res.sendStatus(401);
  }

  res.sendStatus(200);

  if (req.body?.event !== "charge.success") return;

  const reference = req.body?.data?.reference;

  if (!reference) return;

  try {
    await verifyPaystackReference(reference);
  } catch (error) {
    console.error("Paystack webhook verification error:", error.message);
  }
}