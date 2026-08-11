import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { fetchPortalDashboard } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import dashboardImage from "../../assets/Driver with Business Professionals.png";

function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchPortalDashboard()
      .then(setDashboard)
      .catch(() =>
        setDashboard({
          stats: { totalBookings: 0, upcomingJourneys: 0, completedJourneys: 0 },
          upcoming: [],
          recent: [],
        })
      );
  }, []);

  const firstName = user?.firstName || "Traveller";
  const isNewClient = dashboard?.stats?.totalBookings === 0;
  const nextTrip = dashboard?.upcoming?.[0];

  return (
    <div className="portal-v3">
      <section className="portal-v3__hero">
        <img src={dashboardImage} alt="Wooven Host Driver with clients" />
        <div className="portal-v3__hero-shade" />

        <div className="portal-v3__hero-content">
          <p><Sparkles size={15} /> YOUR PRIVATE CLIENT PORTAL</p>
          <h1>Welcome, {firstName}.</h1>
          <span>
            Your personal space for journeys across Kenya, thoughtfully held
            together by Wooven.
          </span>

          <Link to="/portal/book">
            Plan a journey <ArrowRight size={17} />
          </Link>
        </div>

        <div className="portal-v3__hero-note">
          <ShieldCheck size={19} />
          <span>
            <small>THE WOOVEN STANDARD</small>
            Trusted Host Drivers. Calm, coordinated travel.
          </span>
        </div>
      </section>

      {isNewClient && (
        <section className="portal-v3__onboarding">
          <div>
            <p className="portal-v3__eyebrow">START HERE</p>
            <h2>Let’s make your first journey feel easy.</h2>
            <p>
              Your portal is ready. Share the details that matter and Wooven
              will take care of the movement around your time in Kenya.
            </p>
          </div>

          <div>
            <span><b>01</b> Select the service that fits your visit</span>
            <span><b>02</b> Tell us your arrival, stay and preferences</span>
            <span><b>03</b> Pay safely with your Visa or Mastercard</span>
          </div>
        </section>
      )}

      <section className="portal-v3__stats">
        <article><span>Upcoming journeys</span><strong>{dashboard?.stats?.upcomingJourneys ?? "—"}</strong><Compass size={21} /></article>
        <article><span>Total bookings</span><strong>{dashboard?.stats?.totalBookings ?? "—"}</strong><CalendarPlus size={21} /></article>
        <article><span>Completed journeys</span><strong>{dashboard?.stats?.completedJourneys ?? "—"}</strong><CheckCircle2 size={21} /></article>
      </section>

      <section className="portal-v3__main-grid">
        <article className="portal-v3__next-journey">
          <p className="portal-v3__eyebrow">YOUR NEXT JOURNEY</p>

          {nextTrip ? (
            <>
              <h2>{nextTrip.service_name}</h2>
              <p><MapPin size={16} /> {nextTrip.pickup_address}</p>
              <p>{new Date(nextTrip.scheduled_start_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p>
              <Link to="/portal/bookings">View travel details <ArrowRight size={15} /></Link>
            </>
          ) : (
            <>
              <h2>No journey planned yet.</h2>
              <p>Your next arrival, meeting, family visit or weekend away can start here.</p>
              <Link to="/portal/book">Create a booking <ArrowRight size={15} /></Link>
            </>
          )}
        </article>

        <article className="portal-v3__quick-actions">
          <p className="portal-v3__eyebrow">QUICK ACTIONS</p>
          <Link to="/portal/book"><CalendarPlus size={18} /> Book a Host Driver <ArrowRight size={15} /></Link>
          <Link to="/portal/bookings"><Compass size={18} /> View my journeys <ArrowRight size={15} /></Link>
          <Link to="/ServicesPage"><Sparkles size={18} /> Explore Wooven services <ArrowRight size={15} /></Link>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;