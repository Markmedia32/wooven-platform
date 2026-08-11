import pool from "../config/db.js";

async function safeCount(sql, values = []) {
  try {
    const [[result]] = await pool.query(sql, values);
    return Number(result.total || 0);
  } catch {
    return 0;
  }
}

async function ensureBookingOperationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_operations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
      payment_verified_by BIGINT UNSIGNED NULL,
      payment_verified_at DATETIME NULL,
      checklist_json JSON NOT NULL,
      assigned_driver_name VARCHAR(160) NOT NULL,
      assigned_driver_phone VARCHAR(40) NULL,
      vehicle_name VARCHAR(160) NOT NULL,
      vehicle_registration VARCHAR(50) NOT NULL,
      vehicle_features TEXT NULL,
      operational_notes TEXT NULL,
      confirmed_by BIGINT UNSIGNED NOT NULL,
      confirmed_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_booking_operations_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE
    )
  `);
}

export async function getAdminDashboard(req, res, next) {
  try {
    await ensureBookingOperationsTable();

    const [
      paidBookings,
      pendingBookings,
      todayBookings,
      confirmedUpcoming,
      openTickets,
      urgentTickets,
      recentBookingsResult,
      bookingTrendResult,
      calendarResult,
    ] = await Promise.all([
      // Only paid bookings belong to the Admin Portal.
      safeCount(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE payment_status = 'paid'
          AND status NOT IN ('cancelled')
      `),

      // Paid, but still awaiting support-agent verification.
      safeCount(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE payment_status = 'paid'
          AND status = 'pending'
      `),

      // Confirmed journeys happening today.
      safeCount(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE payment_status = 'paid'
          AND DATE(scheduled_start_at) = CURDATE()
          AND status IN ('confirmed', 'in_progress')
      `),

      // Confirmed journeys from tomorrow onwards.
      safeCount(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE payment_status = 'paid'
          AND scheduled_start_at >= CURDATE()
          AND status IN ('confirmed', 'in_progress')
      `),

      safeCount(`
        SELECT COUNT(*) AS total
        FROM support_tickets
        WHERE status IN ('open', 'in_progress')
      `),

      safeCount(`
        SELECT COUNT(*) AS total
        FROM support_tickets
        WHERE priority = 'urgent'
          AND status NOT IN ('resolved', 'closed')
      `),

      // Recent paid bookings only. Unpaid bookings never appear here.
      pool.query(`
        SELECT
          b.id,
          b.booking_reference,
          b.status,
          b.payment_status,
          b.scheduled_start_at,
          b.scheduled_end_at,
          b.pickup_address,
          b.dropoff_address,
          b.quoted_amount,
          b.currency,
          s.name AS service_name,
          u.first_name,
          u.last_name,
          bo.assigned_driver_name,
          bo.vehicle_name,
          bo.vehicle_registration
        FROM bookings b
        INNER JOIN users u ON u.id = b.client_user_id
        INNER JOIN services s ON s.id = b.service_id
        LEFT JOIN booking_operations bo ON bo.booking_id = b.id
        WHERE b.payment_status = 'paid'
          AND b.status NOT IN ('cancelled')
        ORDER BY
          CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
          b.created_at DESC
        LIMIT 6
      `),

      // Dashboard chart: paid bookings only.
      pool.query(`
        SELECT
          DATE_FORMAT(created_at, '%b') AS month,
          COUNT(*) AS bookings
        FROM bookings
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
        ORDER BY MIN(created_at)
      `),

      // Confirmed trips automatically appear on the Wooven calendar.
      pool.query(`
        SELECT
          b.id,
          b.booking_reference,
          b.scheduled_start_at,
          b.scheduled_end_at,
          b.pickup_address,
          b.dropoff_address,
          b.status,
          s.name AS service_name,
          u.first_name,
          u.last_name,
          bo.assigned_driver_name,
          bo.assigned_driver_phone,
          bo.vehicle_name,
          bo.vehicle_registration
        FROM bookings b
        INNER JOIN users u ON u.id = b.client_user_id
        INNER JOIN services s ON s.id = b.service_id
        LEFT JOIN booking_operations bo ON bo.booking_id = b.id
        WHERE b.payment_status = 'paid'
          AND b.status IN ('confirmed', 'in_progress')
          AND b.scheduled_start_at >= CURDATE()
          AND b.scheduled_start_at < DATE_ADD(CURDATE(), INTERVAL 31 DAY)
        ORDER BY b.scheduled_start_at ASC
      `),
    ]);

    return res.json({
      stats: {
        totalBookings: paidBookings,
        pendingBookings,
        todayBookings,
        confirmedUpcoming,
        openTickets,
        urgentTickets,

        // Kept temporarily so your current Dashboard does not break.
        // Remove this when replacing the old “Payment follow-up” card.
        unpaidBookings: 0,
      },

      recentBookings: recentBookingsResult[0],
      bookingTrend: bookingTrendResult[0],

      // Use this for the dashboard calendar component.
      calendar: calendarResult[0],
    });
  } catch (error) {
    next(error);
  }
}