import pool from "../config/db.js";

async function ensureSupportAdminColumns() {
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

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'support_tickets'
      AND COLUMN_NAME = 'admin_last_read_at'
  `);

  if (!columns.length) {
    await pool.query(`
      ALTER TABLE support_tickets
      ADD COLUMN admin_last_read_at DATETIME NULL
    `);
  }
}

export async function getAdminConversations(req, res, next) {
  try {
    await ensureSupportAdminColumns();

    const [conversations] = await pool.query(`
      SELECT
        st.id,
        st.ticket_reference,
        st.subject,
        st.category,
        st.priority,
        st.status,
        st.updated_at,
        st.client_user_id,

        u.first_name,
        u.last_name,
        u.email,
        u.phone,

        (
          SELECT tm.message
          FROM ticket_messages tm
          WHERE tm.ticket_id = st.id
          ORDER BY tm.created_at DESC
          LIMIT 1
        ) AS latest_message,

        (
          SELECT tm.created_at
          FROM ticket_messages tm
          WHERE tm.ticket_id = st.id
          ORDER BY tm.created_at DESC
          LIMIT 1
        ) AS latest_message_at,

        (
          SELECT COUNT(*)
          FROM ticket_messages tm
          WHERE tm.ticket_id = st.id
            AND tm.sender_user_id = st.client_user_id
            AND tm.created_at > COALESCE(st.admin_last_read_at, '1970-01-01')
        ) AS unread_count

      FROM support_tickets st
      INNER JOIN users u ON u.id = st.client_user_id
      ORDER BY
        unread_count DESC,
        FIELD(st.priority, 'urgent', 'high', 'medium', 'low'),
        st.updated_at DESC
    `);

    res.json(conversations);
  } catch (error) {
    next(error);
  }
}

export async function getAdminConversation(req, res, next) {
  try {
    await ensureSupportAdminColumns();

    const [[conversation]] = await pool.query(`
      SELECT
        st.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM support_tickets st
      INNER JOIN users u ON u.id = st.client_user_id
      WHERE st.id = ?
      LIMIT 1
    `, [req.params.ticketId]);

    if (!conversation) {
      return res.status(404).json({ error: "Support conversation not found." });
    }

    const [messages] = await pool.query(`
      SELECT
        tm.id,
        tm.message,
        tm.created_at,
        tm.sender_user_id,
        u.first_name,
        u.last_name
      FROM ticket_messages tm
      LEFT JOIN users u ON u.id = tm.sender_user_id
      WHERE tm.ticket_id = ?
      ORDER BY tm.created_at ASC
    `, [conversation.id]);

    await pool.query(`
      UPDATE support_tickets
      SET admin_last_read_at = NOW()
      WHERE id = ?
    `, [conversation.id]);

    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
}

export async function sendAdminSupportReply(req, res, next) {
  try {
    const message = String(req.body?.message || "").trim();

    if (message.length < 2 || message.length > 2000) {
      return res.status(400).json({
        error: "Your reply must be between 2 and 2,000 characters.",
      });
    }

    const [[ticket]] = await pool.query(`
      SELECT id
      FROM support_tickets
      WHERE id = ?
      LIMIT 1
    `, [req.params.ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: "Support conversation not found." });
    }

    await pool.query(`
      INSERT INTO ticket_messages (ticket_id, sender_user_id, message)
      VALUES (?, ?, ?)
    `, [ticket.id, req.userId, message]);

    await pool.query(`
      UPDATE support_tickets
      SET
        assigned_to_user_id = ?,
        status = 'in_progress',
        updated_at = NOW()
      WHERE id = ?
    `, [req.userId, ticket.id]);

    res.status(201).json({ message: "Reply sent successfully." });
  } catch (error) {
    next(error);
  }
}