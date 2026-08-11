import pool from "../config/db.js";

export async function ensurePartnerNetworkTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(180) NOT NULL UNIQUE,
      partner_type ENUM('transport_company', 'chauffeur_company', 'tour_operator', 'hotel', 'other')
        NOT NULL DEFAULT 'transport_company',
      contact_name VARCHAR(160) NOT NULL,
      contact_email VARCHAR(180) NULL,
      contact_phone VARCHAR(40) NOT NULL,
      status ENUM('active', 'on_hold', 'inactive') NOT NULL DEFAULT 'active',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_vehicles (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      partner_id BIGINT UNSIGNED NOT NULL,
      make VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      registration_number VARCHAR(50) NOT NULL UNIQUE,
      vehicle_class ENUM('sedan', 'suv', 'van', 'executive', 'minibus', '4x4', 'other')
        NOT NULL DEFAULT 'suv',
      passenger_capacity TINYINT UNSIGNED NOT NULL DEFAULT 4,
      luggage_capacity TINYINT UNSIGNED NOT NULL DEFAULT 3,
      amenities TEXT NULL,
      availability ENUM('available', 'assigned', 'maintenance', 'offline')
        NOT NULL DEFAULT 'available',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_partner_vehicle_partner
        FOREIGN KEY (partner_id) REFERENCES partners(id)
        ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_drivers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      partner_id BIGINT UNSIGNED NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(180) NULL,
      license_number VARCHAR(100) NOT NULL UNIQUE,
      languages VARCHAR(255) NULL,
      availability ENUM('available', 'assigned', 'off_duty', 'unavailable')
        NOT NULL DEFAULT 'available',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_partner_driver_partner
        FOREIGN KEY (partner_id) REFERENCES partners(id)
        ON DELETE CASCADE
    )
  `);
}

/* PARTNERS */

export async function getPartners(req, res, next) {
  try {
    await ensurePartnerNetworkTables();

    const [partners] = await pool.query(`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM partner_vehicles v WHERE v.partner_id = p.id) AS vehicle_count,
        (SELECT COUNT(*) FROM partner_drivers d WHERE d.partner_id = p.id) AS driver_count,
        (SELECT COUNT(*) FROM partner_vehicles v
          WHERE v.partner_id = p.id AND v.availability = 'available'
        ) AS available_vehicle_count
      FROM partners p
      ORDER BY FIELD(p.status, 'active', 'on_hold', 'inactive'), p.company_name ASC
    `);

    res.json(partners);
  } catch (error) {
    next(error);
  }
}

export async function createPartner(req, res, next) {
  let connection;

  try {
    await ensurePartnerNetworkTables();

    const {
      companyName,
      partnerType,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      vehicles = [],
      drivers = [],
    } = req.body;

    if (!companyName?.trim() || !contactName?.trim() || !contactPhone?.trim()) {
      return res.status(400).json({
        error: "Company name, contact name, and contact phone are required.",
      });
    }

    if (
      partnerType === "transport_company" &&
      (!vehicles.length || !drivers.length)
    ) {
      return res.status(400).json({
        error: "A Transport Company must include at least one vehicle and one Host Driver.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [partnerResult] = await connection.query(
      `INSERT INTO partners (
        company_name,
        partner_type,
        contact_name,
        contact_email,
        contact_phone,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        companyName.trim(),
        partnerType || "transport_company",
        contactName.trim(),
        contactEmail?.trim() || null,
        contactPhone.trim(),
        notes?.trim() || null,
      ]
    );

    const partnerId = partnerResult.insertId;

    for (const vehicle of vehicles) {
      if (
        !vehicle.make?.trim() ||
        !vehicle.model?.trim() ||
        !vehicle.registrationNumber?.trim()
      ) {
        throw new Error("Every vehicle needs a make, model, and registration number.");
      }

      await connection.query(
        `INSERT INTO partner_vehicles (
          partner_id,
          make,
          model,
          registration_number,
          vehicle_class,
          passenger_capacity,
          luggage_capacity,
          amenities
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partnerId,
          vehicle.make.trim(),
          vehicle.model.trim(),
          vehicle.registrationNumber.trim().toUpperCase(),
          vehicle.vehicleClass || "suv",
          Number(vehicle.passengerCapacity || 4),
          Number(vehicle.luggageCapacity || 3),
          vehicle.amenities?.trim() || null,
        ]
      );
    }

    for (const driver of drivers) {
      if (
        !driver.firstName?.trim() ||
        !driver.lastName?.trim() ||
        !driver.phone?.trim() ||
        !driver.licenseNumber?.trim()
      ) {
        throw new Error(
          "Every Host Driver needs a name, phone number, and licence number."
        );
      }

      await connection.query(
        `INSERT INTO partner_drivers (
          partner_id,
          first_name,
          last_name,
          phone,
          email,
          license_number,
          languages,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partnerId,
          driver.firstName.trim(),
          driver.lastName.trim(),
          driver.phone.trim(),
          driver.email?.trim() || null,
          driver.licenseNumber.trim().toUpperCase(),
          driver.languages?.trim() || null,
          driver.notes?.trim() || null,
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      id: partnerId,
      message: "Partner, vehicles, and Host Drivers added successfully.",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A company, registration number, or licence number already exists.",
      });
    }

    next(error);
  } finally {
    connection?.release();
  }
}

export async function updatePartner(req, res, next) {
  try {
    const { status, notes, contactName, contactEmail, contactPhone } = req.body;

    await pool.query(
      `UPDATE partners
       SET
         status = COALESCE(?, status),
         notes = COALESCE(?, notes),
         contact_name = COALESCE(?, contact_name),
         contact_email = COALESCE(?, contact_email),
         contact_phone = COALESCE(?, contact_phone)
       WHERE id = ?`,
      [
        status ?? null,
        notes ?? null,
        contactName ?? null,
        contactEmail ?? null,
        contactPhone ?? null,
        req.params.partnerId,
      ]
    );

    res.json({ message: "Partner updated." });
  } catch (error) {
    next(error);
  }
}

/* VEHICLES */

export async function getPartnerVehicles(req, res, next) {
  try {
    await ensurePartnerNetworkTables();

    const [vehicles] = await pool.query(`
      SELECT
        v.*,
        p.company_name,

        MIN(
          CASE
            WHEN b.payment_status = 'paid'
              AND b.status IN ('confirmed', 'in_progress')
              AND b.scheduled_start_at >= NOW()
            THEN b.scheduled_start_at
          END
        ) AS next_booking_at,

        GROUP_CONCAT(
          DISTINCT CASE
            WHEN b.payment_status = 'paid'
              AND b.status IN ('confirmed', 'in_progress')
              AND b.scheduled_start_at >= CURDATE()
            THEN DATE_FORMAT(b.scheduled_start_at, '%d %b %Y')
          END
          ORDER BY b.scheduled_start_at
          SEPARATOR ' | '
        ) AS booked_dates,

        MAX(
          CASE
            WHEN b.payment_status = 'paid'
              AND b.status IN ('confirmed', 'in_progress')
              AND NOW() BETWEEN b.scheduled_start_at
                AND COALESCE(
                  b.scheduled_end_at,
                  DATE_ADD(b.scheduled_start_at, INTERVAL 4 HOUR)
                )
            THEN 1
            ELSE 0
          END
        ) AS is_busy_now

      FROM partner_vehicles v
      INNER JOIN partners p ON p.id = v.partner_id
      LEFT JOIN booking_operations bo ON bo.partner_vehicle_id = v.id
      LEFT JOIN bookings b ON b.id = bo.booking_id

      GROUP BY v.id, p.company_name

      ORDER BY
        is_busy_now DESC,
        next_booking_at ASC,
        p.company_name ASC,
        v.make ASC
    `);

    res.json(
      vehicles.map((vehicle) => ({
        ...vehicle,
        operational_status:
          !vehicle.is_active || vehicle.availability === "maintenance"
            ? "maintenance"
            : Number(vehicle.is_busy_now)
              ? "busy_now"
              : "available",
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function createPartnerVehicle(req, res, next) {
  try {
    const {
      partnerId,
      make,
      model,
      registrationNumber,
      vehicleClass,
      passengerCapacity,
      luggageCapacity,
      amenities,
    } = req.body;

    if (!partnerId || !make?.trim() || !model?.trim() || !registrationNumber?.trim()) {
      return res.status(400).json({
        error: "Partner, make, model, and registration number are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO partner_vehicles (
        partner_id, make, model, registration_number, vehicle_class,
        passenger_capacity, luggage_capacity, amenities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        partnerId,
        make.trim(),
        model.trim(),
        registrationNumber.trim().toUpperCase(),
        vehicleClass || "suv",
        Number(passengerCapacity || 4),
        Number(luggageCapacity || 3),
        amenities?.trim() || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Vehicle added." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "That registration number already exists." });
    }

    next(error);
  }
}

export async function updatePartnerVehicle(req, res, next) {
  try {
    const { availability, isActive, amenities } = req.body;

    await pool.query(
      `UPDATE partner_vehicles
       SET
         availability = COALESCE(?, availability),
         is_active = COALESCE(?, is_active),
         amenities = COALESCE(?, amenities)
       WHERE id = ?`,
      [
        availability ?? null,
        isActive ?? null,
        amenities ?? null,
        req.params.vehicleId,
      ]
    );

    res.json({ message: "Vehicle updated." });
  } catch (error) {
    next(error);
  }
}

/* DRIVERS */

export async function getPartnerDrivers(req, res, next) {
  try {
    await ensurePartnerNetworkTables();

    const [drivers] = await pool.query(`
      SELECT
        d.*,
        p.company_name,
        p.status AS partner_status
      FROM partner_drivers d
      INNER JOIN partners p ON p.id = d.partner_id
      ORDER BY
        FIELD(d.availability, 'available', 'assigned', 'off_duty', 'unavailable'),
        p.company_name,
        d.first_name,
        d.last_name
    `);

    res.json(drivers);
  } catch (error) {
    next(error);
  }
}

export async function createPartnerDriver(req, res, next) {
  try {
    const {
      partnerId,
      firstName,
      lastName,
      phone,
      email,
      licenseNumber,
      languages,
      notes,
    } = req.body;

    if (
      !partnerId ||
      !firstName?.trim() ||
      !lastName?.trim() ||
      !phone?.trim() ||
      !licenseNumber?.trim()
    ) {
      return res.status(400).json({
        error: "Partner, name, phone, and licence number are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO partner_drivers (
        partner_id, first_name, last_name, phone, email,
        license_number, languages, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        partnerId,
        firstName.trim(),
        lastName.trim(),
        phone.trim(),
        email?.trim() || null,
        licenseNumber.trim().toUpperCase(),
        languages?.trim() || null,
        notes?.trim() || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Host Driver added." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "That licence number already exists." });
    }

    next(error);
  }
}

export async function updatePartnerDriver(req, res, next) {
  try {
    const { availability, isActive, notes } = req.body;

    await pool.query(
      `UPDATE partner_drivers
       SET
         availability = COALESCE(?, availability),
         is_active = COALESCE(?, is_active),
         notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        availability ?? null,
        isActive ?? null,
        notes ?? null,
        req.params.driverId,
      ]
    );

    res.json({ message: "Host Driver updated." });
  } catch (error) {
    next(error);
  }
}

/* CLIENTS */

export async function getAdminClients(req, res, next) {
  try {
    const [clients] = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        u.last_login_at,

        (
          SELECT COUNT(*)
          FROM bookings b
          WHERE b.client_user_id = u.id
            AND b.payment_status = 'paid'
        ) AS paid_booking_count,

        (
          SELECT MAX(b.scheduled_start_at)
          FROM bookings b
          WHERE b.client_user_id = u.id
            AND b.payment_status = 'paid'
        ) AS latest_journey_at

      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'client'
      ORDER BY u.created_at DESC
    `);

    res.json(clients);
  } catch (error) {
    next(error);
  }
}