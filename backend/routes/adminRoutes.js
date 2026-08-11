import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { getAdminDashboard } from "../controllers/adminController.js";

import {
  getAdminConversation,
  getAdminConversations,
  sendAdminSupportReply,
} from "../controllers/adminSupportController.js";

import {
  getDispatchBoard,
  updateDispatchJourney,
} from "../controllers/adminDispatchController.js";

import {
  createPartner,
  createPartnerDriver,
  createPartnerVehicle,
  getAdminClients,
  getPartnerDrivers,
  getPartners,
  getPartnerVehicles,
  updatePartner,
  updatePartnerDriver,
  updatePartnerVehicle,
} from "../controllers/adminNetworkController.js";

import {
  confirmBooking,
  getAvailableBookingResources,
  getPaidBookings,
} from "../controllers/adminBookingController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/bookings", getPaidBookings);
router.post("/bookings/:bookingId/confirm", confirmBooking);
router.get("/support/conversations", getAdminConversations);
router.get("/support/conversations/:ticketId", getAdminConversation);
router.post("/support/conversations/:ticketId/messages", sendAdminSupportReply);
router.get("/dispatch", getDispatchBoard);
router.patch("/dispatch/:bookingId", updateDispatchJourney);
router.get("/partners", getPartners);
router.post("/partners", createPartner);
router.patch("/partners/:partnerId", updatePartner);

router.get("/vehicles", getPartnerVehicles);
router.post("/vehicles", createPartnerVehicle);
router.patch("/vehicles/:vehicleId", updatePartnerVehicle);

router.get("/drivers", getPartnerDrivers);
router.post("/drivers", createPartnerDriver);
router.patch("/drivers/:driverId", updatePartnerDriver);

router.get("/clients", getAdminClients);
router.get("/bookings/:bookingId/resources", getAvailableBookingResources);

export default router;