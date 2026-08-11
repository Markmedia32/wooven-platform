import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getClientNotifications,
  getClientSupportThread,
  sendClientSupportMessage,
} from "../controllers/supportController.js";

const router = Router();

router.use(requireAuth);

router.get("/thread", getClientSupportThread);
router.post("/messages", sendClientSupportMessage);
router.get("/notifications", getClientNotifications);

export default router;