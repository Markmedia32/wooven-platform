import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "operations_manager",
  "support_agent",
];

function createAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email address and password are required.",
      });
    }

    const [users] = await pool.query(
      `SELECT u.*, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "The email address or password is incorrect.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "This staff account has been disabled.",
      });
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({
        error: "This account does not have Admin Portal access.",
      });
    }

    await pool.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = ?`,
      [user.id]
    );

    return res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken: createAccessToken(user.id),
    });
  } catch (error) {
    next(error);
  }
}