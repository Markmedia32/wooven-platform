import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getDashboard,
  getMyBookings,
  getServices,
} from "../controllers/bookingController.js";

const router = Router();

router.use(requireAuth);

router.get("/services", getServices);
router.get("/bookings/dashboard", getDashboard);
router.get("/bookings/my-bookings", getMyBookings);
router.post("/bookings", createBooking);

export default router;