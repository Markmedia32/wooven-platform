import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search, Users } from "lucide-react";
import { fetchAdminClients } from "../../lib/api";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdminClients().then(setClients);
  }, []);

  const visibleClients = useMemo(
    () =>
      clients.filter((client) =>
        `${client.first_name} ${client.last_name} ${client.email} ${client.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [clients, search]
  );

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>CLIENT RELATIONSHIPS</p>
          <h1>Clients</h1>
          <span>Every Wooven guest, their contact details, and paid journey history.</span>
        </div>
      </div>

      <section className="network-toolbar">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients…"
          />
        </label>
        <span>{visibleClients.length} clients</span>
      </section>

      <section className="client-list">
        {visibleClients.map((client) => (
          <article key={client.id} className="client-row">
            <span className="client-row__avatar">
              {client.first_name?.[0]}{client.last_name?.[0]}
            </span>

            <div>
              <h2>{client.first_name} {client.last_name}</h2>
              <p><Mail size={14} /> {client.email}</p>
              <p><Phone size={14} /> {client.phone || "No phone supplied"}</p>
            </div>

            <div className="client-row__journeys">
              <strong>{client.paid_booking_count}</strong>
              <span>Paid journeys</span>
            </div>

            <div className="client-row__date">
              <span>Latest journey</span>
              <strong>
                {client.latest_journey_at
                  ? new Date(client.latest_journey_at).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "None yet"}
              </strong>
            </div>
          </article>
        ))}

        {!visibleClients.length && (
          <div className="admin-empty"><Users size={25} /> No clients found.</div>
        )}
      </section>
    </>
  );
}