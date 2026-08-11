import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  publicUser,
  updateLastLogin,
} from "../models/userModel.js";

function createAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signup(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return res.status(400).json({
        error: "Please complete your name and phone number.",
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        error: "Your password must contain at least 8 characters.",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: "An account already exists with this email address.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
    });

    return res.status(201).json({
      user: publicUser(user),
      accessToken: createAccessToken(user.id),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const isPhoneDuplicate = error.message.includes("phone");

      return res.status(409).json({
        error: isPhoneDuplicate
          ? "An account already exists with this phone number."
          : "An account already exists with this email address.",
      });
    }

    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email address and password are required.",
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "The email address or password is incorrect.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "This account is currently unavailable. Please contact Wooven.",
      });
    }

    await updateLastLogin(user.id);

    return res.json({
      user: publicUser(user),
      accessToken: createAccessToken(user.id),
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await findUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User account not found.",
      });
    }

    return res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
}