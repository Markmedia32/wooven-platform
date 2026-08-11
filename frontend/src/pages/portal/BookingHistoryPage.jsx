import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  Printer,
  Search,
  UsersRound,
} from "lucide-react";

import { fetchMyBookings, initiatePayment } from "../../lib/api";

const TABS = [
  ["all", "All trips"],
  ["paid", "Payment received"],
  ["payment", "Awaiting payment"],
  ["upcoming", "Upcoming"],
  ["past", "Past trips"],
];

function money(amount, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function dateTime(value) {
  if (!value) return "To be confirmed";

  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isPast(booking) {
  return (
    booking.status === "completed" ||
    new Date(booking.scheduled_start_at) < new Date()
  );
}

function tripStatus(booking) {
  if (booking.payment_status !== "paid") return "Payment needed";
  if (booking.status === "pending") return "Scheduled · Wooven review";
  if (booking.status === "confirmed") return "Confirmed";
  if (booking.status === "completed") return "Completed";
  if (booking.status === "cancelled") return "Cancelled";
  return booking.status?.replaceAll("_", " ") || "Scheduled";
}

function printReceipt() {
  window.print();
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [openBooking, setOpenBooking] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [params, setParams] = useSearchParams();

  const loadBookings = () =>
    fetchMyBookings()
      .then((response) => setBookings(Array.isArray(response) ? response : []))
      .catch(() => setBookings([]));

  useEffect(() => {
    const payment = params.get("payment");

    if (payment === "success") {
      setPaymentMessage(
        "Your payment has been received and your trip has been scheduled for review. Wooven Kenya will confirm your booking within the next 24 hours. Thank you for choosing Wooven Kenya."
      );
    }

    if (payment === "failed") {
      setPaymentMessage(
        "Payment was not completed. Your trip has been saved and you can continue payment below."
      );
    }

    if (payment === "pending") {
      setPaymentMessage(
        "Your payment is still processing. Please refresh shortly for the latest status."
      );
    }

    if (payment) setParams({});
    loadBookings();
  }, []);

  const visibleBookings = useMemo(() => {
    const phrase = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesTab =
        tab === "all" ||
        (tab === "paid" && booking.payment_status === "paid") ||
        (tab === "payment" && booking.payment_status !== "paid") ||
        (tab === "past" && isPast(booking)) ||
        (tab === "upcoming" &&
          !isPast(booking) &&
          booking.payment_status === "paid");

      const matchesSearch =
        !phrase ||
        booking.booking_reference?.toLowerCase().includes(phrase) ||
        booking.service_name?.toLowerCase().includes(phrase) ||
        booking.pickup_address?.toLowerCase().includes(phrase) ||
        booking.dropoff_address?.toLowerCase().includes(phrase);

      return matchesTab && matchesSearch;
    });
  }, [bookings, search, tab]);

  const continuePayment = async (bookingId) => {
    setPayingId(bookingId);
    setPaymentMessage("");

    try {
      const payment = await initiatePayment(bookingId);
      window.location.assign(payment.checkoutUrl);
    } catch (error) {
      setPaymentMessage(
        error.response?.data?.error ||
          "We could not reopen secure checkout. Please try again."
      );
      setPayingId(null);
    }
  };

  return (
    <div className="portal-v2">
      <header className="portal-v2__header">
        <div>
          <p className="portal-v2__eyebrow">MY TRIPS</p>
          <h1>Your Kenya journeys, in one place.</h1>
          <p>Review every trip, payment, itinerary and Wooven confirmation.</p>
        </div>

        <Link to="/portal/book" className="portal-v2__primary-action">
          Plan a journey <ArrowRight size={17} />
        </Link>
      </header>

      {paymentMessage && (
        <div className="portal-v2__notice">
          <CheckCircle2 size={18} />
          {paymentMessage}
        </div>
      )}

      <section className="portal-v2__journey-toolbar">
        <label>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search trips, places or booking reference"
          />
        </label>

        <div>
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={tab === value ? "is-active" : ""}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="portal-v2__journey-list">
        {visibleBookings.length ? (
          visibleBookings.map((booking) => {
            const open = openBooking === booking.id;
            const tripDate = new Date(booking.scheduled_start_at);
            const itinerary = Array.isArray(booking.itinerary)
              ? booking.itinerary
              : [];
            const isPaid = booking.payment_status === "paid";

            return (
              <article
                key={booking.id}
                className={`portal-v2__journey-row ${
                  open ? "is-expanded" : ""
                }`}
              >
                <div className="portal-v2__journey-date">
                  <strong>
                    {tripDate.toLocaleDateString("en-KE", { day: "2-digit" })}
                  </strong>
                  <span>
                    {tripDate.toLocaleDateString("en-KE", { month: "short" })}
                  </span>
                </div>

                <div className="portal-v2__journey-route">
                  <strong>{booking.service_name || "Wooven journey"}</strong>
                  <span>
                    <MapPin size={14} />
                    {booking.pickup_address} → {booking.dropoff_address}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {dateTime(booking.scheduled_start_at)}
                  </span>
                </div>

                <div className="portal-v2__journey-price">
                  <strong>
                    {money(
                      booking.final_amount || booking.quoted_amount,
                      booking.currency
                    )}
                  </strong>
                  <span>{tripStatus(booking)}</span>
                </div>

                <div className="portal-v2__journey-actions">
                  {!isPaid ? (
                    <button
                      type="button"
                      className="portal-v2__primary-action"
                      disabled={payingId === booking.id}
                      onClick={() => continuePayment(booking.id)}
                    >
                      <CreditCard size={15} />
                      {payingId === booking.id ? "Opening…" : "Pay now"}
                    </button>
                  ) : (
                    <span
                      className={`portal-v2__booking-status portal-v2__booking-status--${booking.status}`}
                    >
                      {tripStatus(booking)}
                    </span>
                  )}

                  <button
                    type="button"
                    className="portal-v2__text-action"
                    onClick={() => setOpenBooking(open ? null : booking.id)}
                  >
                    Details <ChevronDown size={16} />
                  </button>
                </div>

                {open && (
                  <div className="portal-v2__journey-details">
                    <div>
                      <CalendarDays size={17} />
                      <span>
                        <strong>Travel dates</strong>
                        {booking.arrival_date || "Arrival date pending"} to{" "}
                        {booking.departure_date || "departure date pending"}
                      </span>
                    </div>

                    <div>
                      <MapPin size={17} />
                      <span>
                        <strong>Accommodation</strong>
                        {booking.accommodation_name || "To be confirmed"}
                      </span>
                    </div>

                    <div>
                      <UsersRound size={17} />
                      <span>
                        <strong>Trip purpose</strong>
                        {booking.purpose_of_visit || "Not provided"}
                      </span>
                    </div>

                    {itinerary.length > 0 && (
                      <div className="portal-v2__itinerary-preview">
                        <strong>Daily itinerary</strong>

                        {itinerary.map((day) => (
                          <p key={`${day.day}-${day.date}-${day.city}`}>
                            Day {day.day}: {day.date || "Date TBC"} ·{" "}
                            {day.city || "Location TBC"} ·{" "}
                            {day.destination || day.activity || "Plans TBC"}
                          </p>
                        ))}
                      </div>
                    )}

                    {isPaid && (
                      <section className="portal-receipt">
                        <div className="portal-receipt__heading">
                          <span>
                            <FileText size={19} />
                            <small>WOOVEN KENYA</small>
                            <strong>Payment receipt</strong>
                          </span>

                          <button
                            type="button"
                            onClick={printReceipt}
                            className="portal-v2__text-action"
                          >
                            <Printer size={15} />
                            Print receipt
                          </button>
                        </div>

                        <div className="portal-receipt__grid">
                          <span>
                            <small>Receipt reference</small>
                            <b>{booking.receipt_reference || booking.booking_reference}</b>
                          </span>

                          <span>
                            <small>Booking reference</small>
                            <b>{booking.booking_reference}</b>
                          </span>

                          <span>
                            <small>Payment received</small>
                            <b>{booking.paid_at ? dateTime(booking.paid_at) : "Confirmed payment"}</b>
                          </span>

                          <span>
                            <small>Amount paid</small>
                            <b>
                              {money(
                                booking.final_amount || booking.quoted_amount,
                                booking.currency
                              )}
                            </b>
                          </span>
                        </div>

                        <p>
                          Payment has been received by Wooven Kenya. Your trip is
                          scheduled for review, and our team will confirm the
                          final arrangement within 24 hours.
                        </p>
                      </section>
                    )}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="portal-v2__empty">
            <CircleAlert size={26} />
            <h2>No trips found.</h2>
            <p>Your upcoming Wooven journey will appear here once scheduled.</p>
            <Link to="/portal/book">
              Plan a journey <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}