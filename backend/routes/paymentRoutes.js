import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  handlePaystackWebhook,
  initiatePaystackPayment,
  paystackCallback,
  verifyPaystackPayment,
} from "../controllers/paymentController.js";

const router = Router();

/* Paystack must access these without a client login token. */
router.post("/webhook", handlePaystackWebhook);
router.get("/callback", paystackCallback);

/* Client portal payment actions require authentication. */
router.use(requireAuth);

router.post("/initiate", initiatePaystackPayment);
router.post("/verify", verifyPaystackPayment);

export default router;