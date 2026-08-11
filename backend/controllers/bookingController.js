import pool from "../config/db.js";

const SERVICE_CATALOG = [
  ["Wooven Welcome", "welcome", "Airport meet-and-greet, luggage support and calm private transfers.", "all", "Available to all travellers.", [["Airport welcome", "Arrival meet-and-greet and private transfer.", 85], ["Return airport service", "Arrival and departure airport coordination.", 160]]],
  ["Wooven City", "city", "Flexible Host Driver support for city meetings, visits and errands.", "all", "Available to all travellers.", [["City companion - 4 hours", "Flexible movement with a Wooven Host Driver.", 110], ["City companion - 8 hours", "A full day of private city mobility.", 190]]],
  ["Wooven Stay", "stay", "Coordinated mobility for extended stays and family visits.", "all", "Available to all guests staying in Kenya.", [["Extended stay - 3 days", "Three days of coordinated mobility support.", 510], ["Extended stay - 7 days", "One week of driver and concierge support.", 1120]]],
  ["Wooven Journey", "journey", "Long-distance and multi-city movement planned around your route.", "all", "Available to all travellers.", [["Upcountry day journey", "Carefully coordinated long-distance journey.", 360], ["Multi-day journey", "Private driver support for an extended route.", 690]]],
  ["Wooven Executive", "executive", "Discreet premium chauffeur service for executive and corporate travel.", "business", "This service is for business, corporate and executive travel.", [["Executive transfer", "Premium chauffeur transfer.", 160], ["Executive day service", "Private executive vehicle for a full working day.", 320]]],
  ["Wooven Homecoming", "homecoming", "Coordinated mobility for diaspora guests returning home.", "diaspora", "This service is for Kenyan diaspora guests and returning residents.", [["Homecoming visit - 3 days", "Mobility for family, property and personal visits.", 420], ["Homecoming visit - 7 days", "A full week of personal driver support.", 980]]],
];

function catalogMeta(slug) {
  const item = SERVICE_CATALOG.find((service) => service[1] === slug);

  return item
    ? { eligibilityRule: item[3], eligibilityNote: item[4] }
    : { eligibilityRule: "all", eligibilityNote: "Available to all travellers." };
}

function canUseService(rule, travellerType) {
  return rule === "all" || rule === travellerType;
}

function normaliseItinerary(itinerary) {
  if (!Array.isArray(itinerary)) return [];

  return itinerary
    .map((day, index) => ({
      day: index + 1,
      date: String(day.date || "").trim(),
      city: String(day.city || "").trim(),
      pickupTime: String(day.pickupTime || "").trim(),
      pickupLocation: String(day.pickupLocation || "").trim(),
      destination: String(day.destination || "").trim(),
      activity: String(day.activity || "").trim(),
      serviceNeed: String(day.serviceNeed || "").trim(),
      timing: day.timing === "tentative" ? "tentative" : "confirmed",
    }))
    .filter((day) => day.date || day.city || day.destination || day.activity);
}

async function ensureColumn(columnName, columnDefinition) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'booking_intake_details'
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [columnName]
  );

  if (!rows.length) {
    await pool.query(
      `ALTER TABLE booking_intake_details ADD COLUMN ${columnDefinition}`
    );
  }
}

async function ensureBookingIntakeTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_intake_details (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
      traveller_type ENUM('diaspora', 'business', 'international', 'resident', 'group') NOT NULL,
      country_of_residence VARCHAR(100) NULL,
      nationality VARCHAR(100) NULL,
      purpose_of_visit VARCHAR(255) NULL,
      arrival_flight VARCHAR(50) NULL,
      arrival_airline VARCHAR(100) NULL,
      arrival_date DATE NULL,
      departure_date DATE NULL,
      return_flight VARCHAR(50) NULL,
      accommodation_name VARCHAR(180) NULL,
      accommodation_address TEXT NULL,
      itinerary_json JSON NULL,
      additional_stops TEXT NULL,
      emergency_contact_name VARCHAR(150) NULL,
      emergency_contact_phone VARCHAR(40) NULL,
      accessibility_needs TEXT NULL,
      child_seats TINYINT UNSIGNED NOT NULL DEFAULT 0,
      preferred_language VARCHAR(60) NULL,
      communication_preference ENUM('whatsapp', 'email', 'phone') NOT NULL DEFAULT 'whatsapp',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_booking_intake_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE
    )
  `);

  await ensureColumn("departure_date", "departure_date DATE NULL AFTER arrival_date");
  await ensureColumn("itinerary_json", "itinerary_json JSON NULL AFTER accommodation_address");
}

async function ensureServiceCatalog() {
  for (const [name, slug, description, , , plans] of SERVICE_CATALOG) {
    await pool.query(
      `INSERT INTO services (name, slug, description, is_active)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         description = IF(description IS NULL OR description = '', VALUES(description), description),
         is_active = 1`,
      [name, slug, description]
    );

    const [[service]] = await pool.query(
      `SELECT id FROM services WHERE slug = ? LIMIT 1`,
      [slug]
    );

    for (const [planName, planDescription, price] of plans) {
      const [existing] = await pool.query(
        `SELECT id FROM service_plans WHERE service_id = ? AND name = ? LIMIT 1`,
        [service.id, planName]
      );

      if (!existing.length) {
        await pool.query(
          `INSERT INTO service_plans
           (service_id, name, description, base_price, currency, is_active)
           VALUES (?, ?, ?, ?, 'USD', 1)`,
          [service.id, planName, planDescription, price]
        );
      }
    }
  }
}

export async function getServices(req, res, next) {
  try {
    await ensureServiceCatalog();

    const [rows] = await pool.query(`
      SELECT
        s.id service_id, s.name service_name, s.slug,
        s.description service_description,
        sp.id plan_id, sp.name plan_name, sp.description plan_description,
        sp.base_price, sp.currency
      FROM services s
      INNER JOIN service_plans sp ON sp.service_id = s.id
      WHERE s.is_active = 1 AND sp.is_active = 1
      ORDER BY s.id, sp.base_price
    `);

    const services = Object.values(
      rows.reduce((result, row) => {
        if (!result[row.service_id]) {
          const meta = catalogMeta(row.slug);

          result[row.service_id] = {
            id: row.service_id,
            name: row.service_name,
            slug: row.slug,
            description: row.service_description,
            eligibilityRule: meta.eligibilityRule,
            eligibilityNote: meta.eligibilityNote,
            plans: [],
          };
        }

        result[row.service_id].plans.push({
          id: row.plan_id,
          name: row.plan_name,
          description: row.plan_description,
          basePrice: Number(row.base_price),
          currency: row.currency,
        });

        return result;
      }, {})
    );

    res.json(services);
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  let connection;

  try {
    await ensureBookingIntakeTable();
    connection = await pool.getConnection();

    const {
      serviceId,
      servicePlanId,
      bookingType,
      pickupAddress,
      dropoffAddress,
      scheduledStartAt,
      scheduledEndAt,
      passengerCount,
      luggageCount,
      requestedVehicleType,
      specialRequests,
      intake,
    } = req.body;

    if (!serviceId || !servicePlanId) {
      return res.status(400).json({
        error: "Please select a Wooven service and service plan.",
      });
    }

    if (!pickupAddress?.trim() || !dropoffAddress?.trim() || !scheduledStartAt) {
      return res.status(400).json({
        error: "Please provide the first pickup, first destination and pickup date.",
      });
    }

    if (
      !intake?.travellerType ||
      !intake?.purposeOfVisit?.trim() ||
      !intake?.arrivalDate ||
      !intake?.departureDate
    ) {
      return res.status(400).json({
        error: "Please add your travel profile, visit purpose, arrival date and departure date.",
      });
    }

    if (new Date(intake.departureDate) < new Date(intake.arrivalDate)) {
      return res.status(400).json({
        error: "Departure date cannot be before arrival date.",
      });
    }

    const itinerary = normaliseItinerary(intake.itinerary);

    if (!itinerary.length) {
      return res.status(400).json({
        error: "Add at least one day to your travel itinerary.",
      });
    }

    const [plans] = await connection.query(
      `SELECT sp.id, sp.base_price, sp.currency, s.slug
       FROM service_plans sp
       INNER JOIN services s ON s.id = sp.service_id
       WHERE sp.id = ? AND sp.service_id = ?
         AND sp.is_active = 1 AND s.is_active = 1
       LIMIT 1`,
      [servicePlanId, serviceId]
    );

    if (!plans.length) {
      return res.status(400).json({
        error: "The selected service plan is unavailable.",
      });
    }

    const plan = plans[0];
    const meta = catalogMeta(plan.slug);

    if (!canUseService(meta.eligibilityRule, intake.travellerType)) {
      return res.status(403).json({ error: meta.eligibilityNote });
    }

    const bookingReference = `WVN-${Date.now()
      .toString()
      .slice(-7)}-${Math.floor(100 + Math.random() * 900)}`;

    await connection.beginTransaction();

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (
        booking_reference, client_user_id, service_id, service_plan_id,
        booking_type, pickup_address, dropoff_address,
        scheduled_start_at, scheduled_end_at,
        passenger_count, luggage_count, requested_vehicle_type,
        special_requests, quoted_amount, currency, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [
        bookingReference,
        req.userId,
        serviceId,
        servicePlanId,
        bookingType || "multi_day",
        pickupAddress.trim(),
        dropoffAddress.trim(),
        scheduledStartAt,
        scheduledEndAt || null,
        Number(passengerCount || 1),
        Number(luggageCount || 0),
        requestedVehicleType || null,
        specialRequests || null,
        plan.base_price,
        plan.currency,
      ]
    );

    await connection.query(
      `INSERT INTO booking_intake_details (
        booking_id, traveller_type, purpose_of_visit,
        arrival_flight, arrival_airline, arrival_date, departure_date, return_flight,
        accommodation_name, accommodation_address, itinerary_json,
        accessibility_needs, child_seats, preferred_language, communication_preference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingResult.insertId,
        intake.travellerType,
        intake.purposeOfVisit.trim(),
        intake.arrivalFlight || null,
        intake.arrivalAirline || null,
        intake.arrivalDate,
        intake.departureDate,
        intake.returnFlight || null,
        intake.accommodationName || null,
        intake.accommodationAddress || null,
        JSON.stringify(itinerary),
        intake.accessibilityNeeds || null,
        Number(intake.childSeats || 0),
        intake.preferredLanguage || "English",
        intake.communicationPreference || "whatsapp",
      ]
    );

    await connection.commit();

    const [[booking]] = await connection.query(
      `SELECT b.*, s.name service_name, sp.name plan_name
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       LEFT JOIN service_plans sp ON sp.id = b.service_plan_id
       WHERE b.id = ? LIMIT 1`,
      [bookingResult.insertId]
    );

    res.status(201).json(booking);
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    connection?.release();
  }
}

export async function getMyBookings(req, res, next) {
  try {
    await ensureBookingIntakeTable();

    const [bookings] = await pool.query(
      `SELECT
        b.*,
        s.name AS service_name,
        s.slug AS service_slug,
        sp.name AS plan_name,

        i.traveller_type,
        i.purpose_of_visit,
        i.arrival_date,
        i.departure_date,
        i.arrival_flight,
        i.return_flight,
        i.accommodation_name,
        i.accommodation_address,
        i.itinerary_json,
        i.communication_preference,
        i.accessibility_needs,

        (
          SELECT p.payment_reference
          FROM payments p
          WHERE p.booking_id = b.id
            AND p.status = 'successful'
          ORDER BY p.id DESC
          LIMIT 1
        ) AS receipt_reference,

        (
          SELECT p.provider_transaction_id
          FROM payments p
          WHERE p.booking_id = b.id
            AND p.status = 'successful'
          ORDER BY p.id DESC
          LIMIT 1
        ) AS provider_transaction_id,

        (
          SELECT p.paid_at
          FROM payments p
          WHERE p.booking_id = b.id
            AND p.status = 'successful'
          ORDER BY p.id DESC
          LIMIT 1
        ) AS paid_at

      FROM bookings b
      INNER JOIN services s ON s.id = b.service_id
      LEFT JOIN service_plans sp ON sp.id = b.service_plan_id
      LEFT JOIN booking_intake_details i ON i.booking_id = b.id
      WHERE b.client_user_id = ?
      ORDER BY b.scheduled_start_at DESC`,
      [req.userId]
    );

    res.json(
      bookings.map((booking) => ({
        ...booking,
        itinerary: booking.itinerary_json
          ? typeof booking.itinerary_json === "string"
            ? JSON.parse(booking.itinerary_json)
            : booking.itinerary_json
          : [],
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, s.name service_name, s.slug service_slug, sp.name plan_name
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       LEFT JOIN service_plans sp ON sp.id = b.service_plan_id
       WHERE b.client_user_id = ?
       ORDER BY b.scheduled_start_at ASC`,
      [req.userId]
    );

    const now = new Date();
    const upcoming = bookings.filter(
      (booking) =>
        new Date(booking.scheduled_start_at) >= now &&
        !["completed", "cancelled"].includes(booking.status)
    );

    res.json({
      stats: {
        totalBookings: bookings.length,
        upcomingJourneys: upcoming.length,
        completedJourneys: bookings.filter(
          (booking) => booking.status === "completed"
        ).length,
      },
      upcoming: upcoming.slice(0, 2),
      recent: bookings
        .filter((booking) =>
          ["completed", "cancelled"].includes(booking.status)
        )
        .slice(-4)
        .reverse(),
    });
  } catch (error) {
    next(error);
  }
}