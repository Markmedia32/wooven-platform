import { useEffect, useMemo, useState } from "react";
import { Building2, CarFront, Plus, Search, UserRoundCog } from "lucide-react";
import {
  createPartner,
  createPartnerDriver,
  createPartnerVehicle,
  fetchPartnerDrivers,
  fetchPartners,
  fetchPartnerVehicles,
  updatePartner,
  updatePartnerDriver,
  updatePartnerVehicle,
} from "../../lib/api";

const configurations = {
  partners: {
    title: "Partner network",
    description: "Companies supplying Wooven’s trusted vehicles and Host Drivers.",
    icon: Building2,
    load: fetchPartners,
    create: createPartner,
    update: updatePartner,
    addLabel: "Add partner",
    fields: [
      ["companyName", "Company name", "text", true],
      ["contactName", "Main contact", "text", true],
      ["contactPhone", "Contact phone", "tel", true],
      ["contactEmail", "Contact email", "email"],
      ["partnerType", "Partner type", "select", false, ["transport_company", "chauffeur_company", "tour_operator", "hotel", "other"]],
      ["notes", "Internal notes", "textarea"],
    ],
    display: (item) => ({
      title: item.company_name,
      subtitle: `${item.contact_name} · ${item.contact_phone}`,
      meta: `${item.vehicle_count} vehicles · ${item.driver_count} drivers · ${item.available_vehicle_count} available`,
      status: item.status,
    }),
  },

  vehicles: {
    title: "Partner vehicles",
    description: "Every vehicle available to Wooven, grouped by provider and operational availability.",
    icon: CarFront,
    load: fetchPartnerVehicles,
    create: createPartnerVehicle,
    update: updatePartnerVehicle,
    addLabel: "Add vehicle",
    fields: [
      ["partnerId", "Partner ID", "number", true],
      ["make", "Vehicle make", "text", true],
      ["model", "Vehicle model", "text", true],
      ["registrationNumber", "Registration number", "text", true],
      ["vehicleClass", "Vehicle class", "select", false, ["sedan", "suv", "van", "executive", "minibus", "4x4", "other"]],
      ["passengerCapacity", "Passenger capacity", "number"],
      ["luggageCapacity", "Luggage capacity", "number"],
      ["amenities", "Inclusions / amenities", "textarea"],
    ],
    display: (item) => ({
      title: `${item.make} ${item.model}`,
      subtitle: `${item.registration_number} · ${item.company_name}`,
      meta: `${item.passenger_capacity} passengers · ${item.luggage_capacity} bags${item.amenities ? ` · ${item.amenities}` : ""}`,
      status: item.availability,
    }),
  },

  drivers: {
    title: "Host Drivers",
    description: "Partner-employed drivers available for verified Wooven journeys.",
    icon: UserRoundCog,
    load: fetchPartnerDrivers,
    create: createPartnerDriver,
    update: updatePartnerDriver,
    addLabel: "Add Host Driver",
    fields: [
      ["partnerId", "Partner ID", "number", true],
      ["firstName", "First name", "text", true],
      ["lastName", "Last name", "text", true],
      ["phone", "Phone", "tel", true],
      ["email", "Email", "email"],
      ["licenseNumber", "Licence number", "text", true],
      ["languages", "Languages", "text"],
      ["notes", "Internal notes", "textarea"],
    ],
    display: (item) => ({
      title: `${item.first_name} ${item.last_name}`,
      subtitle: `${item.company_name} · ${item.phone}`,
      meta: `Licence: ${item.license_number}${item.languages ? ` · ${item.languages}` : ""}`,
      status: item.availability,
    }),
  },
};

export default function PartnerNetworkPage({ type }) {
  const config = configurations[type];
  const Icon = config.icon;

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  async function load() {
    setItems(await config.load());
  }

  useEffect(() => {
    load();
  }, [type]);

  const visible = useMemo(
    () =>
      items.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await config.create(form);
      setForm({});
      setShowForm(false);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not save this record.");
    }
  }

  async function toggleStatus(item) {
    const field = type === "partners" ? "status" : "availability";
    const next = item[field] === "available" || item[field] === "active"
      ? (type === "partners" ? "on_hold" : "offline")
      : (type === "partners" ? "active" : "available");

    await config.update(item.id, { [field]: next });
    load();
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>WOOVEN PARTNER ECOSYSTEM</p>
          <h1>{config.title}</h1>
          <span>{config.description}</span>
        </div>

        <button className="admin-primary-action" onClick={() => setShowForm(true)}>
          <Plus size={17} /> {config.addLabel}
        </button>
      </div>

      <section className="network-toolbar">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}…`}
          />
        </label>
        <span>{visible.length} records</span>
      </section>

      <section className="network-grid">
        {visible.map((item) => {
          const details = config.display(item);

          return (
            <article className="network-card" key={item.id}>
              <div className="network-card__icon"><Icon size={20} /></div>
              <div>
                <h2>{details.title}</h2>
                <p>{details.subtitle}</p>
                <small>{details.meta}</small>
              </div>
              <button
                className={`network-status network-status--${details.status}`}
                onClick={() => toggleStatus(item)}
              >
                {details.status.replaceAll("_", " ")}
              </button>
            </article>
          );
        })}

        {!visible.length && (
          <div className="admin-empty">No records found. Add the first one to begin.</div>
        )}
      </section>

      {showForm && (
        <div className="network-modal">
          <button className="network-modal__backdrop" onClick={() => setShowForm(false)} />

          <form className="network-modal__form" onSubmit={submit}>
            <header>
              <div>
                <p>NEW RECORD</p>
                <h2>{config.addLabel}</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>×</button>
            </header>

            <div className="network-modal__fields">
              {config.fields.map(([name, label, fieldType, required, options]) => (
                <label key={name}>
                  {label}

                  {fieldType === "textarea" ? (
                    <textarea
                      value={form[name] || ""}
                      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    />
                  ) : fieldType === "select" ? (
                    <select
                      value={form[name] || options[0]}
                      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    >
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fieldType}
                      required={required}
                      value={form[name] || ""}
                      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>

            {error && <div className="booking-review__error">{error}</div>}

            <footer>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="booking-review__confirm">Save record</button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}