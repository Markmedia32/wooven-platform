import pool from "../config/db.js";

export async function initialiseUsersTable() {
  const [roles] = await pool.query(
    `SELECT id FROM roles WHERE name = 'client' LIMIT 1`
  );

  if (!roles.length) {
    throw new Error(
      "The required 'client' role is missing from the roles table."
    );
  }
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.*, r.name AS role
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?
     LIMIT 1`,
    [email.toLowerCase().trim()]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.first_name,
       u.last_name,
       u.email,
       u.phone,
       u.role_id,
       u.is_active,
       u.created_at,
       r.name AS role
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createUser({
  firstName,
  lastName,
  email,
  phone,
  passwordHash,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [roles] = await connection.query(
      `SELECT id FROM roles WHERE name = 'client' LIMIT 1`
    );

    if (!roles.length) {
      throw new Error("Client role is not configured.");
    }

    const clientRoleId = roles[0].id;

    const [result] = await connection.query(
      `INSERT INTO users
        (role_id, first_name, last_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        clientRoleId,
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        passwordHash,
      ]
    );

    await connection.query(
      `INSERT INTO client_profiles (user_id) VALUES (?)`,
      [result.insertId]
    );

    await connection.commit();

    return findUserById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login_at = NOW() WHERE id = ?`,
    [userId]
  );
}

export function publicUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at,
  };
}