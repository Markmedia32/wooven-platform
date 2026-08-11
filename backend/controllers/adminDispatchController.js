import pool from "../config/db.js";

const VALID_DISPATCH_STATUSES = [
  "unassigned",
  "assigned",
  "driver_notified",
  "driver_confirmed",
  "en_route",
  "arrived",
  "completed",
  "issue",
];

const VALID_RISK_LEVELS = ["normal", "attention", "urgent"];

async function ensureDispatchTable() {
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

  const requiredColumns = [
    [
      "dispatch_status",
      "ALTER TABLE booking_operations ADD COLUMN dispatch_status ENUM('unassigned', 'assigned', 'driver_notified', 'driver_confirmed', 'en_route', 'arrived', 'completed', 'issue') NOT NULL DEFAULT 'unassigned'",
    ],
    [
      "risk_level",
      "ALTER TABLE booking_operations ADD COLUMN risk_level ENUM('normal', 'attention', 'urgent') NOT NULL DEFAULT 'normal'",
    ],
    [
      "dispatch_notes",
      "ALTER TABLE booking_operations ADD COLUMN dispatch_notes TEXT NULL",
    ],
    [
      "driver_notified_at",
      "ALTER TABLE booking_operations ADD COLUMN driver_notified_at DATETIME NULL",
    ],
    [
      "driver_confirmed_at",
      "ALTER TABLE booking_operations ADD COLUMN driver_confirmed_at DATETIME NULL",
    ],
    [
      "driver_check_in_at",
      "ALTER TABLE booking_operations ADD COLUMN driver_check_in_at DATETIME NULL",
    ],
    [
      "last_updated_by",
      "ALTER TABLE booking_operations ADD COLUMN last_updated_by BIGINT UNSIGNED NULL",
    ],
  ];

  for (const [columnName, alterQuery] of requiredColumns) {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'booking_operations'
         AND COLUMN_NAME = ?`,
      [columnName]
    );

    if (!columns.length) {
      await pool.query(alterQuery);
    }
  }
}

function validDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || "");
}

export async function getDispatchBoard(req, res, next) {
  try {
    await ensureDispatchTable();

    const selectedDate = validDate(req.query.date)
      ? req.query.date
      : new Date().toISOString().slice(0, 10);

    const [journeys] = await pool.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.status AS booking_status,
        b.scheduled_start_at,
        b.scheduled_end_at,
        b.pickup_address,
        b.dropoff_address,
        b.passenger_count,
        b.luggage_count,
        b.special_requests,

        s.name AS service_name,

        u.first_name,
        u.last_name,
        u.email,
        u.phone,

        i.arrival_flight,
        i.accommodation_name,
        i.accessibility_needs,
        i.communication_preference,

        bo.assigned_driver_name,
        bo.assigned_driver_phone,
        bo.vehicle_name,
        bo.vehicle_registration,
        bo.vehicle_features,
        bo.operational_notes,
        bo.dispatch_status,
        bo.risk_level,
        bo.dispatch_notes,
        bo.driver_notified_at,
        bo.driver_confirmed_at,
        bo.driver_check_in_at,
        bo.confirmed_at

      FROM bookings b
      INNER JOIN users u ON u.id = b.client_user_id
      INNER JOIN services s ON s.id = b.service_id
      LEFT JOIN booking_intake_details i ON i.booking_id = b.id
      INNER JOIN booking_operations bo ON bo.booking_id = b.id

      WHERE b.payment_status = 'paid'
        AND b.status IN ('confirmed', 'in_progress')
        AND DATE(b.scheduled_start_at) = ?

      ORDER BY b.scheduled_start_at ASC`,
      [selectedDate]
    );

    const stats = {
      total: journeys.length,
      unassigned: journeys.filter(
        (item) => item.dispatch_status === "unassigned"
      ).length,
      active: journeys.filter((item) =>
        ["en_route", "arrived"].includes(item.dispatch_status)
      ).length,
      attention: journeys.filter(
        (item) =>
          item.risk_level !== "normal" ||
          item.dispatch_status === "issue"
      ).length,
    };

    res.json({
      date: selectedDate,
      stats,
      journeys,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDispatchJourney(req, res, next) {
  try {
    await ensureDispatchTable();

    const bookingId = Number(req.params.bookingId);
    const {
      driverName,
      driverPhone,
      vehicleName,
      vehicleRegistration,
      vehicleFeatures,
      dispatchStatus,
      riskLevel,
      dispatchNotes,
      driverNotified,
      driverConfirmed,
      driverCheckedIn,
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Invalid booking reference." });
    }

    if (
      dispatchStatus &&
      !VALID_DISPATCH_STATUSES.includes(dispatchStatus)
    ) {
      return res.status(400).json({ error: "Invalid dispatch status." });
    }

    if (riskLevel && !VALID_RISK_LEVELS.includes(riskLevel)) {
      return res.status(400).json({ error: "Invalid risk level." });
    }

    const [[journey]] = await pool.query(
      `SELECT b.id, b.status
       FROM bookings b
       INNER JOIN booking_operations bo ON bo.booking_id = b.id
       WHERE b.id = ?
         AND b.payment_status = 'paid'
         AND b.status IN ('confirmed', 'in_progress')
       LIMIT 1`,
      [bookingId]
    );

    if (!journey) {
      return res.status(404).json({
        error: "This confirmed journey is not available for dispatch.",
      });
    }

    const updates = [];
    const values = [];

    const fields = {
      driverName: "assigned_driver_name",
      driverPhone: "assigned_driver_phone",
      vehicleName: "vehicle_name",
      vehicleRegistration: "vehicle_registration",
      vehicleFeatures: "vehicle_features",
      dispatchStatus: "dispatch_status",
      riskLevel: "risk_level",
      dispatchNotes: "dispatch_notes",
    };

    Object.entries(fields).forEach(([payloadField, databaseField]) => {
      if (req.body[payloadField] !== undefined) {
        updates.push(`${databaseField} = ?`);
        values.push(
          payloadField === "vehicleRegistration"
            ? String(req.body[payloadField]).toUpperCase()
            : req.body[payloadField]
        );
      }
    });

    if (driverNotified) {
      updates.push("driver_notified_at = NOW()");
    }

    if (driverConfirmed) {
      updates.push("driver_confirmed_at = NOW()");
    }

    if (driverCheckedIn) {
      updates.push("driver_check_in_at = NOW()");
      updates.push("dispatch_status = 'en_route'");
    }

    if (!updates.length) {
      return res.status(400).json({ error: "No dispatch updates supplied." });
    }

    updates.push("last_updated_by = ?");
    values.push(req.userId);
    values.push(bookingId);

    await pool.query(
      `UPDATE booking_operations
       SET ${updates.join(", ")}
       WHERE booking_id = ?`,
      values
    );

    if (dispatchStatus === "completed") {
      await pool.query(
        `UPDATE bookings SET status = 'completed' WHERE id = ?`,
        [bookingId]
      );
    }

    if (dispatchStatus === "en_route") {
      await pool.query(
        `UPDATE bookings SET status = 'in_progress' WHERE id = ?`,
        [bookingId]
      );
    }

    res.json({ message: "Dispatch updated successfully." });
  } catch (error) {
    next(error);
  }
}