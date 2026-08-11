import { useState } from "react";
import {
  Building2,
  CarFront,
  ChevronDown,
  Plus,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import { createPartner } from "../../lib/api";

const newVehicle = () => ({
  make: "",
  model: "",
  registrationNumber: "",
  vehicleClass: "suv",
  passengerCapacity: 4,
  luggageCapacity: 3,
  amenities: "",
});

const newDriver = () => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  languages: "English",
  notes: "",
});

export default function PartnersPage() {
  const [form, setForm] = useState({
    companyName: "",
    partnerType: "transport_company",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    vehicles: [newVehicle()],
    drivers: [newDriver()],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateVehicle = (index, field, value) =>
    setForm((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle, vehicleIndex) =>
        vehicleIndex === index ? { ...vehicle, [field]: value } : vehicle
      ),
    }));

  const updateDriver = (index, field, value) =>
    setForm((current) => ({
      ...current,
      drivers: current.drivers.map((driver, driverIndex) =>
        driverIndex === index ? { ...driver, [field]: value } : driver
      ),
    }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createPartner(form);

      setSuccess(
        "Partner network saved. Their vehicles and Host Drivers are now available across Wooven Admin."
      );

      setForm({
        companyName: "",
        partnerType: "transport_company",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
        vehicles: [newVehicle()],
        drivers: [newDriver()],
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Could not save this partner company."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isTransportCompany = form.partnerType === "transport_company";

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>WOOVEN PARTNER ECOSYSTEM</p>
          <h1>Add partner company</h1>
          <span>
            Register the company and, for transport partners, their approved
            vehicles and Host Drivers in one step.
          </span>
        </div>
      </div>

      <form className="partner-onboarding" onSubmit={handleSubmit}>
        <section className="partner-onboarding__section">
          <header>
            <Building2 size={20} />
            <div>
              <h2>Partner company</h2>
              <p>The organisation providing services to Wooven Kenya.</p>
            </div>
          </header>

          <div className="partner-onboarding__grid">
            <label>
              Company name
              <input
                value={form.companyName}
                onChange={update("companyName")}
                placeholder="e.g. Nairobi Executive Mobility"
                required
              />
            </label>

            <label>
              Partnership type
              <select
                value={form.partnerType}
                onChange={update("partnerType")}
              >
                <option value="transport_company">Transport Company</option>
                <option value="chauffeur_company">Chauffeur Company</option>
                <option value="tour_operator">Tour Operator</option>
                <option value="hotel">Hotel</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Main contact name
              <input
                value={form.contactName}
                onChange={update("contactName")}
                required
              />
            </label>

            <label>
              Main contact phone
              <input
                value={form.contactPhone}
                onChange={update("contactPhone")}
                placeholder="+254..."
                required
              />
            </label>

            <label>
              Contact email
              <input
                type="email"
                value={form.contactEmail}
                onChange={update("contactEmail")}
              />
            </label>

            <label>
              Internal notes
              <input
                value={form.notes}
                onChange={update("notes")}
                placeholder="Contract, service areas, pricing notes..."
              />
            </label>
          </div>
        </section>

        {isTransportCompany && (
          <>
            <section className="partner-onboarding__section">
              <header>
                <CarFront size={20} />
                <div>
                  <h2>Vehicles supplied to Wooven</h2>
                  <p>
                    These immediately appear on the Vehicles page and in
                    booking-assignment availability dropdowns.
                  </p>
                </div>
              </header>

              {form.vehicles.map((vehicle, index) => (
                <div className="partner-resource-card" key={index}>
                  <div className="partner-resource-card__top">
                    <strong>Vehicle {index + 1}</strong>

                    {form.vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            vehicles: current.vehicles.filter(
                              (_, vehicleIndex) => vehicleIndex !== index
                            ),
                          }))
                        }
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="partner-onboarding__grid">
                    <label>
                      Make
                      <input
                        value={vehicle.make}
                        onChange={(event) =>
                          updateVehicle(index, "make", event.target.value)
                        }
                        placeholder="Toyota"
                        required
                      />
                    </label>

                    <label>
                      Model
                      <input
                        value={vehicle.model}
                        onChange={(event) =>
                          updateVehicle(index, "model", event.target.value)
                        }
                        placeholder="Land Cruiser Prado"
                        required
                      />
                    </label>

                    <label>
                      Registration number
                      <input
                        value={vehicle.registrationNumber}
                        onChange={(event) =>
                          updateVehicle(
                            index,
                            "registrationNumber",
                            event.target.value
                          )
                        }
                        placeholder="KDD 123A"
                        required
                      />
                    </label>

                    <label>
                      Vehicle class
                      <select
                        value={vehicle.vehicleClass}
                        onChange={(event) =>
                          updateVehicle(
                            index,
                            "vehicleClass",
                            event.target.value
                          )
                        }
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="van">Van</option>
                        <option value="executive">Executive</option>
                        <option value="minibus">Minibus</option>
                        <option value="4x4">4x4</option>
                      </select>
                    </label>

                    <label>
                      Passenger capacity
                      <input
                        type="number"
                        min="1"
                        value={vehicle.passengerCapacity}
                        onChange={(event) =>
                          updateVehicle(
                            index,
                            "passengerCapacity",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Luggage capacity
                      <input
                        type="number"
                        min="0"
                        value={vehicle.luggageCapacity}
                        onChange={(event) =>
                          updateVehicle(
                            index,
                            "luggageCapacity",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="partner-onboarding__full-width">
                      Inclusions / amenities
                      <input
                        value={vehicle.amenities}
                        onChange={(event) =>
                          updateVehicle(index, "amenities", event.target.value)
                        }
                        placeholder="Wi-Fi, bottled water, child seat, charging ports..."
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="partner-add-resource"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    vehicles: [...current.vehicles, newVehicle()],
                  }))
                }
              >
                <Plus size={17} /> Add another vehicle
              </button>
            </section>

            <section className="partner-onboarding__section">
              <header>
                <UserRoundCog size={20} />
                <div>
                  <h2>Host Drivers supplied to Wooven</h2>
                  <p>
                    These drivers become selectable only when free during the
                    requested booking window.
                  </p>
                </div>
              </header>

              {form.drivers.map((driver, index) => (
                <div className="partner-resource-card" key={index}>
                  <div className="partner-resource-card__top">
                    <strong>Host Driver {index + 1}</strong>

                    {form.drivers.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            drivers: current.drivers.filter(
                              (_, driverIndex) => driverIndex !== index
                            ),
                          }))
                        }
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="partner-onboarding__grid">
                    <label>
                      First name
                      <input
                        value={driver.firstName}
                        onChange={(event) =>
                          updateDriver(index, "firstName", event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Last name
                      <input
                        value={driver.lastName}
                        onChange={(event) =>
                          updateDriver(index, "lastName", event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Phone number
                      <input
                        value={driver.phone}
                        onChange={(event) =>
                          updateDriver(index, "phone", event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Licence number
                      <input
                        value={driver.licenseNumber}
                        onChange={(event) =>
                          updateDriver(
                            index,
                            "licenseNumber",
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        value={driver.email}
                        onChange={(event) =>
                          updateDriver(index, "email", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Languages
                      <input
                        value={driver.languages}
                        onChange={(event) =>
                          updateDriver(index, "languages", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="partner-add-resource"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    drivers: [...current.drivers, newDriver()],
                  }))
                }
              >
                <Plus size={17} /> Add another Host Driver
              </button>
            </section>
          </>
        )}

        {error && <div className="booking-review__error">{error}</div>}
        {success && <div className="partner-onboarding__success">{success}</div>}

        <button className="partner-onboarding__submit" disabled={submitting}>
          {submitting ? "Saving partner network…" : "Save partner and resources"}
          <ChevronDown size={17} />
        </button>
      </form>
    </>
  );
}