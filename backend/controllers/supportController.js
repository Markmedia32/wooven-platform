import pool from "../config/db.js";

function ticketReference() {
  return `WVN-SUP-${Date.now().toString().slice(-8)}-${Math.floor(
    100 + Math.random() * 900
  )}`;
}

async function ensureSupportTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      ticket_reference VARCHAR(40) NOT NULL UNIQUE,
      booking_id BIGINT UNSIGNED NULL,
      client_user_id BIGINT UNSIGNED NULL,
      assigned_to_user_id BIGINT UNSIGNED NULL,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category ENUM('complaint', 'payment', 'booking', 'driver', 'safety', 'general')
        NOT NULL DEFAULT 'general',
      priority ENUM('low', 'medium', 'high', 'urgent')
        NOT NULL DEFAULT 'medium',
      status ENUM('open', 'in_progress', 'resolved', 'closed')
        NOT NULL DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      ticket_id BIGINT UNSIGNED NOT NULL,
      sender_user_id BIGINT UNSIGNED NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_ticket_message_ticket
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
        ON DELETE CASCADE
    )
  `);
}

async function getOrCreateClientTicket(userId) {
  await ensureSupportTables();

  const [tickets] = await pool.query(
    `SELECT id, ticket_reference, subject, status, created_at, updated_at
     FROM support_tickets
     WHERE client_user_id = ?
       AND category = 'general'
       AND status IN ('open', 'in_progress')
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId]
  );

  if (tickets.length) return tickets[0];

  const reference = ticketReference();

  const [result] = await pool.query(
    `INSERT INTO support_tickets (
      ticket_reference,
      client_user_id,
      subject,
      description,
      category,
      priority,
      status
    ) VALUES (?, ?, ?, ?, 'general', 'medium', 'open')`,
    [
      reference,
      userId,
      "Wooven Client Portal Support",
      "Client support conversation opened from the Wooven portal.",
    ]
  );

  return {
    id: result.insertId,
    ticket_reference: reference,
    subject: "Wooven Client Portal Support",
    status: "open",
  };
}

async function getTicketMessages(ticketId) {
  const [messages] = await pool.query(
    `SELECT
      tm.id,
      tm.message,
      tm.created_at,
      tm.sender_user_id,
      u.first_name,
      u.last_name
     FROM ticket_messages tm
     LEFT JOIN users u ON u.id = tm.sender_user_id
     WHERE tm.ticket_id = ?
     ORDER BY tm.created_at ASC`,
    [ticketId]
  );

  return messages;
}

export async function getClientSupportThread(req, res, next) {
  try {
    const ticket = await getOrCreateClientTicket(req.userId);
    const messages = await getTicketMessages(ticket.id);

    res.json({ ticket, messages });
  } catch (error) {
    next(error);
  }
}

export async function sendClientSupportMessage(req, res, next) {
  try {
    const message = String(req.body?.message || "").trim();

    if (message.length < 2) {
      return res.status(400).json({
        error: "Please enter a message before sending.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Your message is too long. Please keep it under 2,000 characters.",
      });
    }

    const ticket = await getOrCreateClientTicket(req.userId);

    const [result] = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_user_id, message)
       VALUES (?, ?, ?)`,
      [ticket.id, req.userId, message]
    );

    await pool.query(
      `UPDATE support_tickets
       SET description = ?,
           status = IF(status = 'resolved', 'open', status),
           updated_at = NOW()
       WHERE id = ?`,
      [message, ticket.id]
    );

    const [[createdMessage]] = await pool.query(
      `SELECT id, message, created_at, sender_user_id
       FROM ticket_messages
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({
      ticket,
      message: createdMessage,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientNotifications(req, res, next) {
  try {
    const [bookings] = await pool.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.scheduled_start_at,
        b.payment_status,
        b.status,
        s.name AS service_name
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       WHERE b.client_user_id = ?
       ORDER BY b.scheduled_start_at ASC`,
      [req.userId]
    );

    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(now.getDate() + 7);

    const notifications = [];

    bookings.forEach((booking) => {
      const tripDate = new Date(booking.scheduled_start_at);

      if (
        booking.payment_status !== "paid" &&
        !["cancelled", "completed"].includes(booking.status)
      ) {
        notifications.push({
          id: `payment-${booking.id}`,
          type: "payment",
          bookingId: booking.id,
          title: "Payment required",
          message: `${booking.service_name} is saved and waiting for payment.`,
          createdAt: booking.scheduled_start_at,
        });
      }

      if (
        booking.payment_status === "paid" &&
        booking.status === "pending"
      ) {
        notifications.push({
          id: `review-${booking.id}`,
          type: "review",
          bookingId: booking.id,
          title: "Trip scheduled for review",
          message: `Wooven Kenya will confirm ${booking.booking_reference} within 24 hours.`,
          createdAt: booking.scheduled_start_at,
        });
      }

      if (
        booking.payment_status === "paid" &&
        tripDate >= now &&
        tripDate <= inSevenDays &&
        !["cancelled", "completed"].includes(booking.status)
      ) {
        notifications.push({
          id: `reminder-${booking.id}`,
          type: "reminder",
          bookingId: booking.id,
          title: "Upcoming Wooven trip",
          message: `${booking.service_name} is coming up on ${tripDate.toLocaleDateString(
            "en-KE",
            { weekday: "long", day: "numeric", month: "long" }
          )}.`,
          createdAt: booking.scheduled_start_at,
        });
      }
    });

    res.json({
      count: notifications.length,
      notifications: notifications.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
}