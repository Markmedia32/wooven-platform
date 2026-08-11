import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { initialiseUsersTable } from "./models/userModel.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_, res) => {
  res.json({
    status: "ok",
    service: "Wooven API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuthRoutes);

/* Must stay above /api because callbacks do not have a portal JWT token. */
app.use("/api/payments", paymentRoutes);

app.use("/api/support", supportRoutes);

app.use("/api", bookingRoutes);

app.use("/api/admin", adminRoutes);

app.use((err, _, res, __) => {
  const providerMessage = err.response?.data?.message;

  console.error(providerMessage || err);

  res.status(err.statusCode || 500).json({
    error:
      providerMessage ||
      err.message ||
      "Something went wrong. Please try again shortly.",
  });
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await initialiseUsersTable();

    app.listen(port, () => {
      console.log(`Wooven API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();