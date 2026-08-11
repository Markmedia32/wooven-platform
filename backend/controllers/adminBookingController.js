import pool from "../config/db.js";
import { ensurePartnerNetworkTables } from "./adminNetworkController.js";
import { sendTripConfirmationEmail } from "../services/notificationService.js";

const requiredChecks = [
  "paymentVerified",
  "clientDetailsVerified",
  "itineraryReviewed",
  "vehicleAvailable",
  "driverAvailable",
];

export async function ensureBookingOperationsTable() {
  await ensurePartnerNetworkTables();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_operations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
      payment_verified_by BIGINT UNSIGNED NULL,
      payment_verified_at DATETIME NULL,
      checklist_json JSON NOT NULL,

      partner_vehicle_id BIGINT UNSIGNED NULL,
      partner_driver_id BIGINT UNSIGNED NULL,

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

  const newColumns = [
    ["partner_vehicle_id", "partner_vehicle_id BIGINT UNSIGNED NULL"],
    ["partner_driver_id", "partner_driver_id BIGINT UNSIGNED NULL"],
  ];

  for (const [columnName, definition] of newColumns) {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'booking_operations'
         AND COLUMN_NAME = ?`,
      [columnName]
    );

    if (!columns.length) {
      await pool.query(
        `ALTER TABLE booking_operations ADD COLUMN ${definition}`
      );
    }
  }
}

function bookingEndTime(booking) {
  if (booking.scheduled_end_at) return booking.scheduled_end_at;

  return new Date(
    new Date(booking.scheduled_start_at).getTime() + 4 * 60 * 60 * 1000
  );
}

async function getAvailableResources(booking) {
  const endTime = bookingEndTime(booking);

  const [vehicles] = await pool.query(
    `SELECT
      v.id,
      v.make,
      v.model,
      v.registration_number,
      v.vehicle_class,
      v.passenger_capacity,
      v.luggage_capacity,
      v.amenities,
      p.id AS partner_id,
      p.company_name
    FROM partner_vehicles v
    INNER JOIN partners p ON p.id = v.partner_id
    WHERE v.is_active = 1
      AND v.availability = 'available'
      AND p.status = 'active'
      AND v.passenger_capacity >= ?
      AND NOT EXISTS (
        SELECT 1
        FROM booking_operations bo
        INNER JOIN bookings assigned_booking
          ON assigned_booking.id = bo.booking_id
        WHERE bo.partner_vehicle_id = v.id
          AND assigned_booking.payment_status = 'paid'
          AND assigned_booking.status IN ('confirmed', 'in_progress')
          AND assigned_booking.scheduled_start_at < ?
          AND COALESCE(
            assigned_booking.scheduled_end_at,
            DATE_ADD(assigned_booking.scheduled_start_at, INTERVAL 4 HOUR)
          ) > ?
      )
    ORDER BY p.company_name, v.vehicle_class, v.make, v.model`,
    [booking.passenger_count || 1, endTime, booking.scheduled_start_at]
  );

  const [drivers] = await pool.query(
    `SELECT
      d.id,
      d.first_name,
      d.last_name,
      d.phone,
      d.email,
      d.license_number,
      d.languages,
      p.id AS partner_id,
      p.company_name
    FROM partner_drivers d
    INNER JOIN partners p ON p.id = d.partner_id
    WHERE d.is_active = 1
      AND d.availability = 'available'
      AND p.status = 'active'
      AND NOT EXISTS (
        SELECT 1
        FROM booking_operations bo
        INNER JOIN bookings assigned_booking
          ON assigned_booking.id = bo.booking_id
        WHERE bo.partner_driver_id = d.id
          AND assigned_booking.payment_status = 'paid'
          AND assigned_booking.status IN ('confirmed', 'in_progress')
          AND assigned_booking.scheduled_start_at < ?
          AND COALESCE(
            assigned_booking.scheduled_end_at,
            DATE_ADD(assigned_booking.scheduled_start_at, INTERVAL 4 HOUR)
          ) > ?
      )
    ORDER BY p.company_name, d.first_name, d.last_name`,
    [endTime, booking.scheduled_start_at]
  );

  return { vehicles, drivers };
}

export async function getPaidBookings(req, res, next) {
  try {
    await ensureBookingOperationsTable();

    const [bookings] = await pool.query(`
      SELECT
        b.*,
        s.name AS service_name,
        sp.name AS plan_name,

        u.first_name,
        u.last_name,
        u.email,
        u.phone,

        i.traveller_type,
        i.country_of_residence,
        i.nationality,
        i.purpose_of_visit,
        i.arrival_flight,
        i.arrival_airline,
        i.arrival_date,
        i.departure_date,
        i.return_flight,
        i.accommodation_name,
        i.accommodation_address,
        i.itinerary_json,
        i.additional_stops,
        i.emergency_contact_name,
        i.emergency_contact_phone,
        i.accessibility_needs,
        i.child_seats,
        i.preferred_language,
        i.communication_preference,

        bo.partner_vehicle_id,
        bo.partner_driver_id,
        bo.assigned_driver_name,
        bo.assigned_driver_phone,
        bo.vehicle_name,
        bo.vehicle_registration,
        bo.vehicle_features,
        bo.operational_notes,
        bo.confirmed_at

      FROM bookings b
      INNER JOIN users u ON u.id = b.client_user_id
      INNER JOIN services s ON s.id = b.service_id
      LEFT JOIN service_plans sp ON sp.id = b.service_plan_id
      LEFT JOIN booking_intake_details i ON i.booking_id = b.id
      LEFT JOIN booking_operations bo ON bo.booking_id = b.id

      WHERE b.payment_status = 'paid'
        AND b.status NOT IN ('cancelled', 'completed')

      ORDER BY
        CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
        b.scheduled_start_at ASC
    `);

    res.json(
      bookings.map((booking) => ({
        ...booking,
        itinerary:
          typeof booking.itinerary_json === "string"
            ? JSON.parse(booking.itinerary_json)
            : booking.itinerary_json || [],
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getAvailableBookingResources(req, res, next) {
  try {
    await ensureBookingOperationsTable();

    const [[booking]] = await pool.query(
      `SELECT
        id,
        scheduled_start_at,
        scheduled_end_at,
        passenger_count,
        payment_status,
        status
      FROM bookings
      WHERE id = ?
        AND payment_status = 'paid'
        AND status = 'pending'
      LIMIT 1`,
      [req.params.bookingId]
    );

    if (!booking) {
      return res.status(404).json({
        error: "This booking is not awaiting confirmation.",
      });
    }

    res.json(await getAvailableResources(booking));
  } catch (error) {
    next(error);
  }
}

export async function confirmBooking(req, res, next) {
  let connection;

  try {
    await ensureBookingOperationsTable();

    const {
      checklist,
      vehicleId,
      driverId,
      operationalNotes,
    } = req.body;

    if (requiredChecks.some((check) => !checklist?.[check])) {
      return res.status(400).json({
        error: "Complete every verification check before confirming this journey.",
      });
    }

    if (!vehicleId || !driverId) {
      return res.status(400).json({
        error: "Choose an available partner vehicle and Host Driver.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[booking]] = await connection.query(
      `SELECT
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        s.name AS service_name
      FROM bookings b
      INNER JOIN users u ON u.id = b.client_user_id
      INNER JOIN services s ON s.id = b.service_id
      WHERE b.id = ?
        AND b.payment_status = 'paid'
        AND b.status = 'pending'
      FOR UPDATE`,
      [req.params.bookingId]
    );

    if (!booking) {
      await connection.rollback();
      return res.status(404).json({
        error: "This paid booking is no longer awaiting confirmation.",
      });
    }

    const { vehicles, drivers } = await getAvailableResources(booking);

    const vehicle = vehicles.find((item) => Number(item.id) === Number(vehicleId));
    const driver = drivers.find((item) => Number(item.id) === Number(driverId));

    if (!vehicle || !driver) {
      await connection.rollback();
      return res.status(409).json({
        error: "The selected vehicle or Host Driver is busy. Please choose another available resource.",
      });
    }

    await connection.query(
      `INSERT INTO booking_operations (
        booking_id,
        payment_verified_by,
        payment_verified_at,
        checklist_json,
        partner_vehicle_id,
        partner_driver_id,
        assigned_driver_name,
        assigned_driver_phone,
        vehicle_name,
        vehicle_registration,
        vehicle_features,
        operational_notes,
        confirmed_by,
        confirmed_at
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        booking.id,
        req.userId,
        JSON.stringify(checklist),
        vehicle.id,
        driver.id,
        `${driver.first_name} ${driver.last_name}`,
        driver.phone,
        `${vehicle.make} ${vehicle.model}`,
        vehicle.registration_number,
        vehicle.amenities,
        operationalNotes?.trim() || null,
        req.userId,
      ]
    );

    await connection.query(
      `UPDATE bookings
       SET status = 'confirmed'
       WHERE id = ?`,
      [booking.id]
    );


    await connection.commit();

    sendTripConfirmationEmail({
      clientName: `${booking.first_name} ${booking.last_name}`,
      clientEmail: booking.email,
      bookingReference: booking.booking_reference,
      serviceName: booking.service_name,
      scheduledStartAt: booking.scheduled_start_at,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      driverName: `${driver.first_name} ${driver.last_name}`,
      driverPhone: driver.phone,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      vehicleRegistration: vehicle.registration_number,
      vehicleFeatures: vehicle.amenities,
    }).catch((emailError) => {
      console.error("Confirmation email failed:", emailError.message);
    });

    res.json({
      message: "Journey confirmed, assigned, and added to dispatch.",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    connection?.release();
  }
}