import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import {
  fetchDispatchBoard,
  updateDispatchJourney,
} from "../../lib/api";

const statusLabels = {
  unassigned: "Needs dispatch",
  assigned: "Assigned",
  driver_notified: "Driver notified",
  driver_confirmed: "Driver confirmed",
  en_route: "En route",
  arrived: "Arrived",
  completed: "Completed",
  issue: "Needs attention",
};

export default function DispatchPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [board, setBoard] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  async function loadBoard() {
    setBoard(await fetchDispatchBoard(date));
  }

  useEffect(() => {
    loadBoard();
  }, [date]);

  const journeys = useMemo(() => {
    if (!board) return [];

    return board.journeys.filter((journey) => {
      const searchable = [
        journey.booking_reference,
        journey.first_name,
        journey.last_name,
        journey.assigned_driver_name,
        journey.vehicle_registration,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());

      if (filter === "unassigned") {
        return matchesSearch && journey.dispatch_status === "unassigned";
      }

      if (filter === "active") {
        return (
          matchesSearch &&
          ["en_route", "arrived"].includes(journey.dispatch_status)
        );
      }

      if (filter === "attention") {
        return (
          matchesSearch &&
          (journey.risk_level !== "normal" ||
            journey.dispatch_status === "issue")
        );
      }

      return matchesSearch;
    });
  }, [board, filter, search]);

  if (!board) {
    return <div className="admin-page-state">Loading dispatch centre…</div>;
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>REAL-TIME OPERATIONS</p>
          <h1>Dispatch centre</h1>
          <span>Coordinate confirmed journeys, drivers, vehicles, and live movement.</span>
        </div>

        <label className="dispatch-date">
          <CalendarDays size={17} />
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
      </div>

      <div className="dispatch-stat-grid">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "is-active" : ""}>
          <CalendarDays size={20} />
          <span><strong>{board.stats.total}</strong> Total journeys</span>
        </button>

        <button onClick={() => setFilter("unassigned")} className={filter === "unassigned" ? "is-active" : ""}>
          <Clock3 size={20} />
          <span><strong>{board.stats.unassigned}</strong> Need dispatch</span>
        </button>

        <button onClick={() => setFilter("active")} className={filter === "active" ? "is-active" : ""}>
          <Navigation size={20} />
          <span><strong>{board.stats.active}</strong> Live journeys</span>
        </button>

        <button onClick={() => setFilter("attention")} className={filter === "attention" ? "is-active" : ""}>
          <ShieldAlert size={20} />
          <span><strong>{board.stats.attention}</strong> Need attention</span>
        </button>
      </div>

      <section className="admin-card dispatch-board">
        <header>
          <div>
            <p>DAILY COMMAND BOARD</p>
            <h2>
              {new Date(`${date}T12:00:00`).toLocaleDateString("en-KE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
          </div>

          <label className="dispatch-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, driver or vehicle…"
            />
          </label>
        </header>

        {!journeys.length ? (
          <div className="admin-empty">No confirmed journeys match this view.</div>
        ) : (
          <div className="dispatch-journey-list">
            {journeys.map((journey) => (
              <button
                key={journey.id}
                className={`dispatch-journey dispatch-journey--${journey.risk_level}`}
                onClick={() => setSelected(journey)}
              >
                <span className="dispatch-journey__time">
                  {new Date(journey.scheduled_start_at).toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <span className="dispatch-journey__guest">
                  <strong>{journey.first_name} {journey.last_name}</strong>
                  <small>{journey.booking_reference} · {journey.service_name}</small>
                </span>

                <span className="dispatch-journey__route">
                  <MapPin size={15} />
                  {journey.pickup_address} → {journey.dropoff_address}
                </span>

                <span className="dispatch-journey__assignment">
                  <UserRound size={15} />
                  {journey.assigned_driver_name || "Driver not assigned"}
                  <CarFront size={15} />
                  {journey.vehicle_registration || "Vehicle not assigned"}
                </span>

                <span className={`dispatch-status dispatch-status--${journey.dispatch_status}`}>
                  {statusLabels[journey.dispatch_status]}
                </span>

                {journey.risk_level !== "normal" && (
                  <AlertTriangle className="dispatch-journey__risk" size={17} />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <DispatchDrawer
          journey={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            await loadBoard();
          }}
        />
      )}
    </>
  );
}

function DispatchDrawer({ journey, onClose, onSaved }) {
  const [form, setForm] = useState({
    driverName: journey.assigned_driver_name || "",
    driverPhone: journey.assigned_driver_phone || "",
    vehicleName: journey.vehicle_name || "",
    vehicleRegistration: journey.vehicle_registration || "",
    vehicleFeatures: journey.vehicle_features || "",
    dispatchStatus: journey.dispatch_status || "unassigned",
    riskLevel: journey.risk_level || "normal",
    dispatchNotes: journey.dispatch_notes || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function save() {
    setSaving(true);
    setError("");

    try {
      await updateDispatchJourney(journey.id, form);
      onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not update dispatch.");
    } finally {
      setSaving(false);
    }
  }

  async function markDriverCheckedIn() {
    setSaving(true);

    try {
      await updateDispatchJourney(journey.id, {
        ...form,
        driverCheckedIn: true,
      });
      onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not check in driver.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dispatch-drawer-overlay">
      <button className="dispatch-drawer-overlay__backdrop" onClick={onClose} />

      <aside className="dispatch-drawer">
        <header>
          <div>
            <p>{journey.booking_reference}</p>
            <h2>{journey.first_name} {journey.last_name}</h2>
            <span>
              {new Date(journey.scheduled_start_at).toLocaleString("en-KE")}
            </span>
          </div>

          <button onClick={onClose}><X size={20} /></button>
        </header>

        <div className="dispatch-drawer__body">
          <section className="dispatch-drawer__route">
            <strong>Journey route</strong>
            <p>{journey.pickup_address}</p>
            <i />
            <p>{journey.dropoff_address}</p>
          </section>

          <section className="dispatch-drawer__client">
            <strong>Guest contact</strong>
            <p>{journey.email}</p>
            <a href={`tel:${journey.phone}`}><Phone size={15} /> {journey.phone || "No phone provided"}</a>
            {journey.accessibility_needs && (
              <p className="dispatch-drawer__warning">
                <AlertTriangle size={15} /> {journey.accessibility_needs}
              </p>
            )}
          </section>

          <section className="dispatch-form">
            <h3>Transport assignment</h3>

            <label>Host Driver<input value={form.driverName} onChange={update("driverName")} /></label>
            <label>Driver Phone<input value={form.driverPhone} onChange={update("driverPhone")} /></label>
            <label>Vehicle<input value={form.vehicleName} onChange={update("vehicleName")} /></label>
            <label>Registration<input value={form.vehicleRegistration} onChange={update("vehicleRegistration")} /></label>

            <label>Vehicle inclusions<textarea value={form.vehicleFeatures} onChange={update("vehicleFeatures")} /></label>

            <div className="dispatch-form__two">
              <label>
                Dispatch status
                <select value={form.dispatchStatus} onChange={update("dispatchStatus")}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                Risk level
                <select value={form.riskLevel} onChange={update("riskLevel")}>
                  <option value="normal">Normal</option>
                  <option value="attention">Attention</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
            </div>

            <label>Dispatch notes<textarea value={form.dispatchNotes} onChange={update("dispatchNotes")} placeholder="Briefing notes, changes, client preferences…" /></label>
          </section>

          {error && <div className="booking-review__error">{error}</div>}
        </div>

        <footer>
          <button onClick={markDriverCheckedIn} className="dispatch-checkin" disabled={saving}>
            <CheckCircle2 size={17} /> Driver checked in
          </button>

          <button onClick={save} className="booking-review__confirm" disabled={saving}>
            {saving ? "Saving…" : "Save dispatch"}
          </button>
        </footer>
      </aside>
    </div>
  );
}