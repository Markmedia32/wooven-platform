import pool from "../config/db.js";

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "operations_manager",
  "support_agent",
];

export async function requireAdmin(req, res, next) {
  try {
    const [users] = await pool.query(
      `SELECT r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND u.is_active = 1
       LIMIT 1`,
      [req.userId]
    );

    if (!users.length || !ADMIN_ROLES.includes(users[0].role)) {
      return res.status(403).json({
        error: "Admin access is required.",
      });
    }

    req.adminRole = users[0].role;
    next();
  } catch (error) {
    next(error);
  }
}