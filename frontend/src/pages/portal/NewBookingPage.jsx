import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  CreditCard,
  MapPin,
  PlaneLanding,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

import {
  createBooking,
  fetchServices,
  initiatePayment,
} from "../../lib/api";

const STEPS = ["Travel profile", "Travel dates", "Daily itinerary", "Review & pay"];

const TRAVELLER_TYPES = [
  {
    value: "diaspora",
    label: "Diaspora visitor",
    text: "Family visits, property plans, investments and meaningful time at home.",
  },
  {
    value: "business",
    label: "Business traveller",
    text: "Conferences, meetings, projects and executive mobility.",
  },
  {
    value: "international",
    label: "International visitor",
    text: "Leisure, short stays, airport transfers and discovering Kenya.",
  },
];

const SERVICE_ICONS = {
  welcome: PlaneLanding,
  city: MapPin,
  stay: CalendarDays,
  journey: ArrowRight,
  executive: ShieldCheck,
  homecoming: PlaneLanding,
};

function money(amount, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function eligible(service, travellerType) {
  return (
    service.eligibilityRule === "all" ||
    service.eligibilityRule === travellerType
  );
}

function blankDay(date = "") {
  return {
    date,
    city: "",
    pickupTime: "",
    pickupLocation: "",
    destination: "",
    activity: "",
    serviceNeed: "",
    timing: "tentative",
  };
}

export default function NewBookingPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    serviceId: "",
    servicePlanId: "",
    bookingType: "multi_day",
    pickupAddress: "",
    dropoffAddress: "",
    scheduledStartAt: "",
    scheduledEndAt: "",
    passengerCount: 1,
    luggageCount: 1,
    requestedVehicleType: "",
    specialRequests: "",
    intake: {
      travellerType: "",
      purposeOfVisit: "",
      arrivalDate: "",
      departureDate: "",
      arrivalFlight: "",
      arrivalAirline: "",
      returnFlight: "",
      accommodationName: "",
      accommodationAddress: "",
      itinerary: [blankDay()],
      accessibilityNeeds: "",
      childSeats: 0,
      preferredLanguage: "English",
      communicationPreference: "whatsapp",
    },
  });

  useEffect(() => {
    fetchServices()
      .then((response) => setServices(Array.isArray(response) ? response : []))
      .catch(() =>
        setError("We could not load Wooven services. Please refresh and try again.")
      )
      .finally(() => setLoadingServices(false));
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.serviceId)),
    [services, form.serviceId]
  );

  const selectedPlan = useMemo(
    () =>
      selectedService?.plans?.find(
        (plan) => plan.id === Number(form.servicePlanId)
      ),
    [selectedService, form.servicePlanId]
  );

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateIntake = (field, value) => {
    setForm((current) => ({
      ...current,
      intake: { ...current.intake, [field]: value },
    }));
  };

  const chooseTravellerType = (travellerType) => {
    setError("");

    setForm((current) => ({
      ...current,
      serviceId: "",
      servicePlanId: "",
      intake: { ...current.intake, travellerType },
    }));
  };

  const chooseService = (service) => {
    if (!eligible(service, form.intake.travellerType)) return;

    update("serviceId", service.id);
    update("servicePlanId", service.plans?.[0]?.id || "");
  };

  const updateDay = (index, field, value) => {
    setForm((current) => ({
      ...current,
      intake: {
        ...current.intake,
        itinerary: current.intake.itinerary.map((day, dayIndex) =>
          dayIndex === index ? { ...day, [field]: value } : day
        ),
      },
    }));
  };

  const addDay = () => {
    setForm((current) => ({
      ...current,
      intake: {
        ...current.intake,
        itinerary: [
          ...current.intake.itinerary,
          blankDay(current.intake.arrivalDate),
        ],
      },
    }));
  };

  const removeDay = (index) => {
    setForm((current) => ({
      ...current,
      intake: {
        ...current.intake,
        itinerary: current.intake.itinerary.filter(
          (_, dayIndex) => dayIndex !== index
        ),
      },
    }));
  };

  const validate = (targetStep) => {
    setError("");

    if (targetStep === 1) {
      if (!form.intake.travellerType || !form.serviceId || !form.servicePlanId) {
        setError("Choose your travel profile, an eligible service and a plan.");
        return false;
      }
    }

    if (targetStep === 2) {
      if (
        !form.intake.arrivalDate ||
        !form.intake.departureDate ||
        !form.pickupAddress.trim() ||
        !form.dropoffAddress.trim() ||
        !form.scheduledStartAt
      ) {
        setError(
          "Add your arrival and departure dates, first route and intended pickup time."
        );
        return false;
      }

      if (
        new Date(form.intake.departureDate) <
        new Date(form.intake.arrivalDate)
      ) {
        setError("Departure date cannot be before arrival date.");
        return false;
      }
    }

    if (targetStep === 3) {
      const validDays = form.intake.itinerary.filter(
        (day) => day.date && (day.city || day.destination || day.activity)
      );

      if (!form.intake.purposeOfVisit.trim() || !validDays.length) {
        setError(
          "Add the purpose of your visit and at least one meaningful itinerary day."
        );
        return false;
      }
    }

    return true;
  };

  const goNext = (targetStep) => {
    if (validate(targetStep)) setStep(targetStep);
  };

  const submitBooking = async () => {
    if (!selectedPlan || !selectedService) return;

    setCreatingPayment(true);
    setError("");

    try {
      const booking = await createBooking({
        serviceId: form.serviceId,
        servicePlanId: form.servicePlanId,
        bookingType: form.bookingType,
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
        scheduledStartAt: form.scheduledStartAt,
        scheduledEndAt: form.scheduledEndAt || null,
        passengerCount: Number(form.passengerCount),
        luggageCount: Number(form.luggageCount),
        requestedVehicleType: form.requestedVehicleType || null,
        specialRequests: form.specialRequests || null,
        intake: {
          ...form.intake,
          childSeats: Number(form.intake.childSeats || 0),
        },
      });

      const payment = await initiatePayment(booking.id);
      window.location.assign(payment.checkoutUrl);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "We could not create your booking. Please try again."
      );
      setCreatingPayment(false);
    }
  };

  return (
    <div className="portal-v3 booking-v3">
      <header className="booking-v3__header">
        <div>
          <p className="portal-v3__eyebrow">PLAN A WOOVEN JOURNEY</p>
          <h1>Your Kenya itinerary, thoughtfully coordinated.</h1>
          <p>
            Tell us where you are going, day by day. Your concierge team uses
            this information to prepare every movement around your stay.
          </p>
        </div>

        <aside className="booking-v3__trust">
          <ShieldCheck size={20} />
          <span>
            <strong>Private planning</strong>
            Your itinerary is shared only with the Wooven team planning your trip.
          </span>
        </aside>
      </header>

      <ol className="booking-v3__steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? "is-active"
                : index < step
                  ? "is-complete"
                  : ""
            }
          >
            <span>{index < step ? <Check size={13} /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="booking-v3__error" role="alert">
          <CircleAlert size={18} />
          {error}
        </div>
      )}

      {step === 0 && (
        <section className="booking-v3__profile">
          <div className="booking-v3__section-heading">
            <p className="portal-v3__eyebrow">STEP 01 · TRAVEL PROFILE</p>
            <h2>What brings you to Kenya?</h2>
          </div>

          <div className="booking-v3__traveller-grid">
            {TRAVELLER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => chooseTravellerType(type.value)}
                className={
                  form.intake.travellerType === type.value
                    ? "booking-v3__traveller-card is-selected"
                    : "booking-v3__traveller-card"
                }
              >
                <strong>{type.label}</strong>
                <p>{type.text}</p>
                {form.intake.travellerType === type.value && <Check size={18} />}
              </button>
            ))}
          </div>

          {form.intake.travellerType && (
            <>
              <div className="booking-v3__section-heading booking-v3__section-heading--services">
                <p className="portal-v3__eyebrow">CHOOSE YOUR SERVICE</p>
                <h2>Travel support made for your visit.</h2>
              </div>

              {loadingServices ? (
                <p className="booking-v3__muted">Loading Wooven services…</p>
              ) : (
                <div className="booking-v3__service-grid">
                  {services.map((service) => {
                    const Icon = SERVICE_ICONS[service.slug] || MapPin;
                    const allowed = eligible(service, form.intake.travellerType);

                    return (
                      <button
                        key={service.id}
                        type="button"
                        disabled={!allowed}
                        onClick={() => chooseService(service)}
                        className={[
                          "booking-v3__service-card",
                          Number(form.serviceId) === service.id ? "is-selected" : "",
                          !allowed ? "is-unavailable" : "",
                        ].join(" ")}
                      >
                        <Icon size={23} />
                        <strong>{service.name}</strong>
                        <p>{service.description}</p>
                        <small>{allowed ? "Available for your profile" : service.eligibilityNote}</small>
                        <em>
                          {service.plans?.[0]
                            ? `From ${money(service.plans[0].basePrice, service.plans[0].currency)}`
                            : "Price on request"}
                        </em>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedService && (
                <div className="booking-v3__plans">
                  <div>
                    <p className="portal-v3__eyebrow">SELECT A PLAN</p>
                    <h2>{selectedService.name}</h2>
                  </div>

                  <div className="booking-v3__plan-options">
                    {selectedService.plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        className={Number(form.servicePlanId) === plan.id ? "is-selected" : ""}
                        onClick={() => update("servicePlanId", plan.id)}
                      >
                        <span>
                          <strong>{plan.name}</strong>
                          <small>{plan.description}</small>
                        </span>
                        <b>{money(plan.basePrice, plan.currency)}</b>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="booking-v3__actions">
                <span />
                <button className="booking-v3__primary-button" onClick={() => goNext(1)}>
                  Continue <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="booking-v3__form-section">
          <div className="booking-v3__section-heading">
            <p className="portal-v3__eyebrow">STEP 02 · TRAVEL DATES</p>
            <h2>Tell us the shape of your stay.</h2>
          </div>

          <div className="booking-v3__form-grid">
            <label>
              <span>Arrival date</span>
              <input
                type="date"
                value={form.intake.arrivalDate}
                onChange={(event) => updateIntake("arrivalDate", event.target.value)}
              />
            </label>

            <label>
              <span>Departure date</span>
              <input
                type="date"
                min={form.intake.arrivalDate || undefined}
                value={form.intake.departureDate}
                onChange={(event) => updateIntake("departureDate", event.target.value)}
              />
            </label>

            <label>
              <span>Arrival flight <small>Optional</small></span>
              <input
                value={form.intake.arrivalFlight}
                onChange={(event) => updateIntake("arrivalFlight", event.target.value)}
                placeholder="e.g. KQ 101"
              />
            </label>

            <label>
              <span>Departure flight <small>Optional</small></span>
              <input
                value={form.intake.returnFlight}
                onChange={(event) => updateIntake("returnFlight", event.target.value)}
                placeholder="e.g. BA 064"
              />
            </label>

            <label className="full">
              <span>First pickup location</span>
              <input
                value={form.pickupAddress}
                onChange={(event) => update("pickupAddress", event.target.value)}
                placeholder="Airport terminal, hotel, residence or full address"
              />
            </label>

            <label className="full">
              <span>First destination</span>
              <input
                value={form.dropoffAddress}
                onChange={(event) => update("dropoffAddress", event.target.value)}
                placeholder="Hotel, residence, office or first destination"
              />
            </label>

            <label>
              <span>First pickup date and time</span>
              <input
                type="datetime-local"
                value={form.scheduledStartAt}
                onChange={(event) => update("scheduledStartAt", event.target.value)}
              />
            </label>

            <label>
              <span>Guests travelling</span>
              <input
                type="number"
                min="1"
                max="12"
                value={form.passengerCount}
                onChange={(event) => update("passengerCount", event.target.value)}
              />
            </label>

            <label>
              <span>Luggage pieces</span>
              <input
                type="number"
                min="0"
                max="20"
                value={form.luggageCount}
                onChange={(event) => update("luggageCount", event.target.value)}
              />
            </label>

            <label>
              <span>Vehicle preference</span>
              <select
                value={form.requestedVehicleType}
                onChange={(event) => update("requestedVehicleType", event.target.value)}
              >
                <option value="">Let Wooven recommend</option>
                <option value="Comfort sedan">Comfort sedan</option>
                <option value="Executive sedan">Executive sedan</option>
                <option value="Premium SUV">Premium SUV</option>
                <option value="Van / group travel">Van / group travel</option>
              </select>
            </label>
          </div>

          <div className="booking-v3__actions">
            <button onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
            <button className="booking-v3__primary-button" onClick={() => goNext(2)}>
              Build itinerary <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="booking-v3__form-section">
          <div className="booking-v3__section-heading">
            <p className="portal-v3__eyebrow">STEP 03 · DAILY ITINERARY</p>
            <h2>Plan your stay, one day at a time.</h2>
            <p>Exact details are welcome, but you can mark any plan as tentative.</p>
          </div>

          <div className="booking-v3__form-grid">
            <label className="full">
              <span>Purpose of visit</span>
              <input
                value={form.intake.purposeOfVisit}
                onChange={(event) => updateIntake("purposeOfVisit", event.target.value)}
                placeholder="Family visit, safari, conference, investment trip…"
              />
            </label>
          </div>

          <div className="booking-v3__itinerary-list">
            {form.intake.itinerary.map((day, index) => (
              <article className="booking-v3__itinerary-day" key={index}>
                <div>
                  <strong>Day {index + 1}</strong>
                  {form.intake.itinerary.length > 1 && (
                    <button type="button" onClick={() => removeDay(index)}>
                      <Trash2 size={15} /> Remove
                    </button>
                  )}
                </div>

                <div className="booking-v3__form-grid">
                  <label>
                    <span>Date</span>
                    <input
                      type="date"
                      min={form.intake.arrivalDate || undefined}
                      max={form.intake.departureDate || undefined}
                      value={day.date}
                      onChange={(event) => updateDay(index, "date", event.target.value)}
                    />
                  </label>

                  <label>
                    <span>Confirmed or tentative?</span>
                    <select
                      value={day.timing}
                      onChange={(event) => updateDay(index, "timing", event.target.value)}
                    >
                      <option value="tentative">Tentative</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </label>

                  <label>
                    <span>City or region</span>
                    <input
                      value={day.city}
                      onChange={(event) => updateDay(index, "city", event.target.value)}
                      placeholder="Nairobi, Maasai Mara, Mombasa…"
                    />
                  </label>

                  <label>
                    <span>Preferred pickup time</span>
                    <input
                      type="time"
                      value={day.pickupTime}
                      onChange={(event) => updateDay(index, "pickupTime", event.target.value)}
                    />
                  </label>

                  <label className="full">
                    <span>Pickup location</span>
                    <input
                      value={day.pickupLocation}
                      onChange={(event) => updateDay(index, "pickupLocation", event.target.value)}
                      placeholder="Hotel, airport, residence or venue"
                    />
                  </label>

                  <label className="full">
                    <span>Destination or route</span>
                    <input
                      value={day.destination}
                      onChange={(event) => updateDay(index, "destination", event.target.value)}
                      placeholder="Where would you like to go?"
                    />
                  </label>

                  <label className="full">
                    <span>Plans, stops or activity</span>
                    <input
                      value={day.activity}
                      onChange={(event) => updateDay(index, "activity", event.target.value)}
                      placeholder="Meeting, family visit, safari transfer, property viewing…"
                    />
                  </label>

                  <label className="full">
                    <span>Support you need</span>
                    <input
                      value={day.serviceNeed}
                      onChange={(event) => updateDay(index, "serviceNeed", event.target.value)}
                      placeholder="Airport transfer, driver on standby, luggage support, multi-stop route…"
                    />
                  </label>
                </div>
              </article>
            ))}

            <button type="button" className="booking-v3__text-button" onClick={addDay}>
              <Plus size={17} /> Add another day
            </button>
          </div>

          <div className="booking-v3__form-grid">
            <label>
              <span>Accommodation</span>
              <input
                value={form.intake.accommodationName}
                onChange={(event) => updateIntake("accommodationName", event.target.value)}
                placeholder="Hotel, residence or serviced apartment"
              />
            </label>

            <label>
              <span>Preferred contact</span>
              <select
                value={form.intake.communicationPreference}
                onChange={(event) => updateIntake("communicationPreference", event.target.value)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
              </select>
            </label>

            <label className="full">
              <span>Accessibility or comfort needs <small>Optional</small></span>
              <textarea
                rows="3"
                value={form.intake.accessibilityNeeds}
                onChange={(event) => updateIntake("accessibilityNeeds", event.target.value)}
                placeholder="Mobility support, child seats, accessibility needs or comfort preferences."
              />
            </label>

            <label className="full">
              <span>Anything else Wooven should know? <small>Optional</small></span>
              <textarea
                rows="3"
                value={form.specialRequests}
                onChange={(event) => update("specialRequests", event.target.value)}
                placeholder="Any details that will help the Wooven team prepare better."
              />
            </label>
          </div>

          <div className="booking-v3__actions">
            <button onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
            <button className="booking-v3__primary-button" onClick={() => goNext(3)}>
              Review booking <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {step === 3 && selectedPlan && (
        <section className="booking-v3__review-layout">
          <article className="booking-v3__review-card">
            <p className="portal-v3__eyebrow">YOUR TRIP SUMMARY</p>
            <h2>{selectedPlan.name}</h2>
            <p className="booking-v3__review-service">{selectedService?.name}</p>

            <div><span>Travel dates</span><strong>{form.intake.arrivalDate} to {form.intake.departureDate}</strong></div>
            <div><span>First route</span><strong>{form.pickupAddress} → {form.dropoffAddress}</strong></div>
            <div><span>Guests</span><strong>{form.passengerCount} guest(s), {form.luggageCount} luggage piece(s)</strong></div>
            <div><span>Itinerary days</span><strong>{form.intake.itinerary.length} day(s) planned</strong></div>
          </article>

          <aside className="booking-v3__payment-card">
            <CreditCard size={28} />
            <p className="portal-v3__eyebrow">SECURE PAYMENT</p>
            <strong>{money(selectedPlan.basePrice, selectedPlan.currency)}</strong>

            <p>
              <ShieldCheck size={16} />
              Payment reserves your planning slot. Wooven Kenya will confirm
              the final trip arrangement within 24 hours.
            </p>

            <button
              type="button"
              className="booking-v3__primary-button"
              disabled={creatingPayment}
              onClick={submitBooking}
            >
              {creatingPayment ? "Opening secure checkout…" : "Pay securely"}
              <ArrowRight size={17} />
            </button>

            <button type="button" className="booking-v3__text-button" onClick={() => setStep(2)}>
              <ArrowLeft size={15} /> Edit itinerary
            </button>
          </aside>
        </section>
      )}
    </div>
  );
}