import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  MapPin,
  UserRound,
  CarFront,
  X,
} from "lucide-react";
import {
  confirmAdminBooking,
  fetchAdminBookings,
  fetchAvailableBookingResources,
} from "../../lib/api";

const checks = [
  ["paymentVerified", "Payment has been verified"],
  ["clientDetailsVerified", "Client contact and travel details are correct"],
  ["itineraryReviewed", "Journey route and timing are workable"],
  ["vehicleAvailable", "An available partner vehicle has been selected"],
  ["driverAvailable", "An available Host Driver has been selected"],
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);

  async function loadBookings() {
    setBookings(await fetchAdminBookings());
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>PAID JOURNEYS ONLY</p>
          <h1>Bookings</h1>
          <span>Verify, assign partner resources, and confirm every Wooven journey.</span>
        </div>
      </div>

      <section className="admin-card admin-bookings-table">
        <header>
          <div>
            <p>PAYMENT VERIFIED</p>
            <h2>Journey approval queue</h2>
          </div>
        </header>

        {!bookings.length ? (
          <div className="admin-empty">No paid bookings are waiting for review.</div>
        ) : (
          bookings.map((booking) => (
            <button
              className="admin-booking-queue-row"
              key={booking.id}
              onClick={() => setSelected(booking)}
            >
              <span className="admin-booking-row__avatar">
                {booking.first_name?.[0]}{booking.last_name?.[0]}
              </span>

              <span>
                <strong>{booking.first_name} {booking.last_name}</strong>
                <small>{booking.booking_reference} · {booking.service_name}</small>
              </span>

              <span className="admin-booking-queue-row__date">
                {new Date(booking.scheduled_start_at).toLocaleDateString("en-KE", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>

              <span className={`admin-status admin-status--${booking.status}`}>
                {booking.status === "confirmed" ? "Confirmed" : "Review required"}
              </span>

              <ChevronRight size={18} />
            </button>
          ))
        )}
      </section>

      {selected && (
        <BookingReview
          booking={selected}
          onClose={() => setSelected(null)}
          onConfirmed={async () => {
            setSelected(null);
            await loadBookings();
          }}
        />
      )}
    </>
  );
}

function BookingReview({ booking, onClose, onConfirmed }) {
  const [resources, setResources] = useState(null);
  const [checklist, setChecklist] = useState(
    Object.fromEntries(checks.map(([key]) => [key, false]))
  );
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [operationalNotes, setOperationalNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking.status !== "pending") return;

    fetchAvailableBookingResources(booking.id)
      .then(setResources)
      .catch((requestError) =>
        setError(
          requestError.response?.data?.error ||
            "Could not check partner resource availability."
        )
      );
  }, [booking]);

  const allChecked = Object.values(checklist).every(Boolean);

  async function confirm() {
    setSubmitting(true);
    setError("");

    try {
      await confirmAdminBooking(booking.id, {
        checklist,
        vehicleId,
        driverId,
        operationalNotes,
      });

      onConfirmed();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not confirm journey.");
    } finally {
      setSubmitting(false);
    }
  }

  const daysOfStay =
    booking.arrival_date && booking.departure_date
      ? Math.max(
          1,
          Math.ceil(
            (new Date(booking.departure_date) - new Date(booking.arrival_date)) /
              86400000
          )
        )
      : null;

  return (
    <div className="booking-review-overlay">
      <button className="booking-review-overlay__backdrop" onClick={onClose} />

      <aside className="booking-review">
        <header>
          <div>
            <p>{booking.booking_reference}</p>
            <h2>{booking.first_name} {booking.last_name}</h2>
            <span>{booking.service_name} · Payment received</span>
          </div>

          <button onClick={onClose}><X size={20} /></button>
        </header>

        <div className="booking-review__body">
          <section className="booking-review__details">
            <p><strong>Journey:</strong> {new Date(booking.scheduled_start_at).toLocaleString("en-KE")}</p>
            <p><strong>Route:</strong> {booking.pickup_address} → {booking.dropoff_address}</p>
            <p><strong>Stay:</strong> {daysOfStay ? `${daysOfStay} day(s)` : "Not supplied"}</p>
            <p><strong>Accommodation:</strong> {booking.accommodation_name || "Not supplied"}</p>
            <p><strong>Guests:</strong> {booking.passenger_count} passengers · {booking.luggage_count} bags</p>
            <p><strong>Accessibility:</strong> {booking.accessibility_needs || "None stated"}</p>
          </section>

          <section className="booking-review__itinerary">
            <h3>Client itinerary</h3>

            {booking.itinerary?.length ? booking.itinerary.map((day, index) => (
              <article key={index}>
                <strong>Day {day.day || index + 1} · {day.date}</strong>
                <p><MapPin size={14} /> {day.pickupLocation} → {day.destination}</p>
                <small>{day.activity || "Journey activity not specified"}</small>
              </article>
            )) : <p>No itinerary has been supplied.</p>}
          </section>

          {booking.status === "pending" && (
            <>
              <section>
                <h3>Verification checklist</h3>

                {checks.map(([key, label]) => (
                  <label className="booking-check" key={key}>
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      onChange={() =>
                        setChecklist((current) => ({
                          ...current,
                          [key]: !current[key],
                        }))
                      }
                    />
                    <span><Check size={14} /></span>
                    {label}
                  </label>
                ))}
              </section>

              <section className="booking-resource-select">
                <h3>Available partner resources</h3>
                <p>Only vehicles and drivers free during this journey’s time window appear below.</p>

                {!resources ? (
                  <div className="admin-empty">Checking availability…</div>
                ) : (
                  <>
                    <label>
                      <CarFront size={17} />
                      Vehicle
                      <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                        <option value="">Select an available vehicle</option>
                        {resources.vehicles.map((vehicle) => (
                          <option value={vehicle.id} key={vehicle.id}>
                            {vehicle.company_name} · {vehicle.make} {vehicle.model} · {vehicle.registration_number} · {vehicle.passenger_capacity} seats
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <UserRound size={17} />
                      Host Driver
                      <select value={driverId} onChange={(event) => setDriverId(event.target.value)}>
                        <option value="">Select an available Host Driver</option>
                        {resources.drivers.map((driver) => (
                          <option value={driver.id} key={driver.id}>
                            {driver.company_name} · {driver.first_name} {driver.last_name} · {driver.phone}
                          </option>
                        ))}
                      </select>
                    </label>

                    {!resources.vehicles.length && (
                      <p className="booking-resource-select__warning">
                        No suitable vehicle is free for this booking window.
                      </p>
                    )}
                  </>
                )}
              </section>

              <label className="booking-review__notes">
                Internal operations notes
                <textarea
                  value={operationalNotes}
                  onChange={(event) => setOperationalNotes(event.target.value)}
                  placeholder="Special handling, client preferences, partner instructions…"
                />
              </label>
            </>
          )}

          {error && (
            <div className="booking-review__error">
              <CircleAlert size={17} />
              {error}
            </div>
          )}
        </div>

        {booking.status === "pending" && (
          <footer>
            <button className="booking-review__cancel" onClick={onClose}>
              Save for later
            </button>

            <button
              className="booking-review__confirm"
              disabled={!allChecked || !vehicleId || !driverId || submitting}
              onClick={confirm}
            >
              {submitting ? <LoaderCircle className="is-spinning" size={18} /> : <Check size={18} />}
              Confirm journey
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}