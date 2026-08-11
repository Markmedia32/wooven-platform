import nodemailer from "nodemailer";

export async function sendTripConfirmationEmail(details) {
  const {
    clientName,
    clientEmail,
    bookingReference,
    serviceName,
    scheduledStartAt,
    pickupAddress,
    dropoffAddress,
    driverName,
    driverPhone,
    vehicleName,
    vehicleRegistration,
    vehicleFeatures,
  } = details;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.warn("Email skipped: SMTP settings are missing.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const travelDate = new Date(scheduledStartAt).toLocaleString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Wooven Kenya <hello@wooven.co.ke>",
    to: clientEmail,
    subject: `Your Wooven journey is confirmed · ${bookingReference}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#10233d;max-width:600px;margin:auto">
        <h1 style="color:#00152e">Your journey is confirmed.</h1>
        <p>Hello ${clientName},</p>
        <p>Your <strong>${serviceName}</strong> journey has been carefully prepared by the Wooven Kenya team.</p>
        <hr />
        <p><strong>Reference:</strong> ${bookingReference}</p>
        <p><strong>Date & time:</strong> ${travelDate}</p>
        <p><strong>Pickup:</strong> ${pickupAddress}</p>
        <p><strong>Destination:</strong> ${dropoffAddress}</p>
        <p><strong>Your Host Driver:</strong> ${driverName}${driverPhone ? ` · ${driverPhone}` : ""}</p>
        <p><strong>Your vehicle:</strong> ${vehicleName} · ${vehicleRegistration}</p>
        ${vehicleFeatures ? `<p><strong>Included:</strong> ${vehicleFeatures}</p>` : ""}
        <p>We look forward to welcoming you.</p>
        <p><strong>Wooven Kenya</strong></p>
      </div>
    `,
  });
}