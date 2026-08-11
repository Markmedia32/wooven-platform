import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  CreditCard,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import { fetchAdminDashboard } from "../../lib/api";

const statusClass = (status) =>
  `admin-status admin-status--${status?.toLowerCase() || "pending"}`;

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      setDashboard(await fetchAdminDashboard());
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const trendMax = useMemo(
    () => Math.max(...(dashboard?.bookingTrend?.map((item) => Number(item.bookings)) || [1])),
    [dashboard]
  );

  if (loading) return <div className="admin-page-state">Preparing your operations view…</div>;
  if (error) return <div className="admin-page-state">{error}</div>;

  const { stats, recentBookings, bookingTrend } = dashboard;

  const cards = [
    { label: "Bookings today", value: stats.todayBookings, note: "Journeys requiring attention", icon: CalendarClock, tone: "blue" },
    { label: "Pending review", value: stats.pendingBookings, note: "Awaiting operational approval", icon: CircleAlert, tone: "gold" },
    { label: "Open support", value: stats.openTickets, note: `${stats.urgentTickets} urgent conversation${stats.urgentTickets === 1 ? "" : "s"}`, icon: MessageSquareText, tone: "violet" },
    { label: "Payment follow-up", value: stats.unpaidBookings, note: "Active bookings not fully paid", icon: CreditCard, tone: "rose" },
  ];

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>OPERATIONS OVERVIEW</p>
          <h1>Good morning, {JSON.parse(localStorage.getItem("wooven_user"))?.firstName || "team"}.</h1>
          <span>Here is the live picture of Wooven Kenya today.</span>
        </div>
        <button className="admin-refresh" onClick={loadDashboard}>
          <RefreshCw size={16} /> Refresh data
        </button>
      </div>

      <div className="admin-stat-grid">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label} className="admin-stat-card">
            <div className={`admin-stat-card__icon admin-stat-card__icon--${tone}`}><Icon size={20} /></div>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <article className="admin-card admin-card--bookings">
          <header>
            <div>
              <p>LIVE ACTIVITY</p>
              <h2>Latest bookings</h2>
            </div>
            <a href="/admin/bookings">View all <ArrowUpRight size={15} /></a>
          </header>

          {recentBookings.length ? (
            <div className="admin-booking-list">
              {recentBookings.map((booking) => (
                <div className="admin-booking-row" key={booking.id}>
                  <div className="admin-booking-row__avatar">
                    {booking.first_name?.[0]}{booking.last_name?.[0]}
                  </div>
                  <div className="admin-booking-row__guest">
                    <strong>{booking.first_name} {booking.last_name}</strong>
                    <span>{booking.booking_reference} · {booking.service_name}</span>
                  </div>
                  <div className="admin-booking-row__date">
                    {new Date(booking.scheduled_start_at).toLocaleDateString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                  <span className={statusClass(booking.status)}>{booking.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">No bookings have arrived yet.</div>
          )}
        </article>

        <article className="admin-card admin-card--trend">
          <header>
            <div>
              <p>BOOKING MOMENTUM</p>
              <h2>Last six months</h2>
            </div>
            <strong>{stats.totalBookings} <small>all time</small></strong>
          </header>

          <div className="admin-chart">
            {bookingTrend.length ? bookingTrend.map((item) => (
              <div key={item.month} className="admin-chart__column">
                <div className="admin-chart__bar-wrap">
                  <span style={{ height: `${Math.max(12, (Number(item.bookings) / trendMax) * 100)}%` }}>
                    <b>{item.bookings}</b>
                  </span>
                </div>
                <small>{item.month}</small>
              </div>
            )) : <div className="admin-empty">Booking history will appear here.</div>}
          </div>
        </article>
      </div>
    </>
  );
}