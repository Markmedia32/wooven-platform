import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Send,
  Sparkles,
} from "lucide-react";

import heroImage from "../../assets/Booking.png";
import driverImage from "../../assets/Tracking Route.png";

const channels = [
  {
    name: "Call Us",
    detail: "+254 700 000 000",
    text: "Speak directly with our concierge team.",
    icon: Phone,
    href: "tel:+254700000000",
    cta: "Call now",
    external: false,
  },
  {
    name: "WhatsApp",
    detail: "+254 700 000 000",
    text: "Fastest way to reach us - chat in real time.",
    icon: MessageCircle,
    href: "https://wa.me/254700000000",
    cta: "Start chat",
    external: true,
  },
  {
    name: "Email",
    detail: "hello@wooven.co.ke",
    text: "For bookings, partnerships and enquiries.",
    icon: Mail,
    href: "mailto:hello@wooven.co.ke",
    cta: "Send email",
    external: false,
  },
  {
    name: "Visit Us",
    detail: "Westlands, Nairobi",
    text: "By appointment - our team will confirm timing.",
    icon: MapPin,
    href: "#location",
    cta: "Get directions",
    external: false,
  },
];

const serviceOptions = [
  { label: "Airport Meet & Assist", icon: Plane },
  { label: "Dedicated Personal Driver", icon: Car },
  { label: "Extended Stay Package", icon: Building2 },
  { label: "Executive Chauffeur", icon: Sparkles },
  { label: "Upcountry & Long-Distance", icon: Compass },
  { label: "Something else", icon: MessageCircle },
];

const faqs = [
  {
    q: "How quickly will Wooven respond to my enquiry?",
    a: "Our concierge team responds within 2 hours during business hours (7am-8pm EAT), and within 12 hours outside those windows.",
  },
  {
    q: "Can I book a Host Driver for multiple days?",
    a: "Yes. Extended Stay Packages are built for multi-day and multi-week bookings, with the same dedicated Host Driver throughout your visit.",
  },
  {
    q: "Do you serve destinations outside Nairobi?",
    a: "We currently cover Nairobi, Naivasha, Nakuru, Nanyuki, Eldoret, Kisumu, Kisii, Mombasa, Diani, Amboseli and the Maasai Mara, with additional destinations available on request.",
  },
  {
    q: "Is airport pickup included in every package?",
    a: "Airport Meet & Assist can be added to any package, or booked as a standalone service for arrivals and departures.",
  },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectService = (label) => {
    setForm((prev) => ({
      ...prev,
      service: prev.service === label ? "" : label,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="contact-page">
      <section className="contact-page__hero">
        <div className="contact-page__hero-copy">
          <p className="eyebrow eyebrow--gold">Get in touch</p>

          <h1>
            Let's plan your
            <em> journey in Kenya.</em>
          </h1>

          <p>
            Whether you are arriving next week or planning months ahead, our
            concierge team is ready to design a mobility experience around
            your visit.
          </p>

          <div className="contact-page__hero-chips">
            <a href="tel:+254700000000">
              <Phone size={15} />
              <span>+254 700 000 000</span>
            </a>
            <a href="https://wa.me/254700000000">
              <MessageCircle size={15} />
              <span>WhatsApp us</span>
            </a>
            <a href="mailto:hello@wooven.co.ke">
              <Mail size={15} />
              <span>hello@wooven.co.ke</span>
            </a>
          </div>
        </div>

        <div className="contact-page__hero-visual">
          <img src={heroImage} alt="Wooven Host Driver ready for a client arrival" />
          <div className="contact-page__hero-visual-shade" />

          <div className="contact-page__hero-floating">
            <span>RESPONSE TIME</span>
            <strong>Under 2 hours</strong>
            <small>During business hours, 7am to 8pm EAT</small>
          </div>
        </div>
      </section>

      <section className="contact-page__channels">
        <div className="site-container">
          <div className="contact-page__channels-grid">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              const linkTarget = channel.external ? "_blank" : undefined;

              return (
                <a
                  key={channel.name}
                  className="contact-page__channel-card"
                  href={channel.href}
                  target={linkTarget}
                  rel="noreferrer"
                >
                  <span>0{index + 1}</span>
                  <Icon size={24} />
                  <h3>{channel.name}</h3>
                  <p className="contact-page__channel-detail">{channel.detail}</p>
                  <p className="contact-page__channel-text">{channel.text}</p>
                  <span className="contact-page__channel-cta">
                    {channel.cta}
                    <ArrowUpRight size={14} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="location" className="contact-page__main section">
        <div className="site-container contact-page__main-grid">
          <div className="contact-page__form-panel">
            <p className="eyebrow">Send an enquiry</p>
            <h2>
              Tell us about
              <em> your trip.</em>
            </h2>

            {submitted ? (
              <div className="contact-page__success">
                <CheckCircle2 size={34} />
                <h3>Thank you{form.name ? `, ${form.name.split(" ")[0]}` : ""}.</h3>
                <p>
                  Your enquiry has been received. A member of our concierge
                  team will reach out within 2 hours to confirm the details
                  of your journey.
                </p>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setSubmitted(false)}
                >
                  Send another enquiry
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form className="contact-page__form" onSubmit={handleSubmit}>
                <div className="contact-page__form-row">
                  <label>
                    <span>Full name</span>
                    <input
                      type="text"
                      placeholder="Jane Mwangi"
                      value={form.name}
                      onChange={handleChange("name")}
                      required
                    />
                  </label>
                  <label>
                    <span>Phone number</span>
                    <input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      required
                    />
                  </label>
                </div>

                <div className="contact-page__form-row">
                  <label>
                    <span>Email address</span>
                    <input
                      type="email"
                      placeholder="jane@email.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                    />
                  </label>
                  <label>
                    <span>Travel date</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={handleChange("date")}
                    />
                  </label>
                </div>

                <div className="contact-page__form-field">
                  <span>What do you need?</span>
                  <div className="contact-page__service-grid">
                    {serviceOptions.map((option) => {
                      const Icon = option.icon;
                      const active = form.service === option.label;
                      const chipClass = active
                        ? "contact-page__service-chip contact-page__service-chip--active"
                        : "contact-page__service-chip";

                      return (
                        <button
                          type="button"
                          key={option.label}
                          className={chipClass}
                          onClick={() => selectService(option.label)}
                        >
                          <Icon size={16} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="contact-page__form-field">
                  <span>Tell us more</span>
                  <textarea
                    rows={4}
                    placeholder="Arrival details, number of travellers, itinerary notes..."
                    value={form.message}
                    onChange={handleChange("message")}
                  />
                </label>

                <button className="button button--gold button--large" type="submit">
                  Send enquiry
                  <Send size={17} />
                </button>
              </form>
            )}
          </div>

          <aside className="contact-page__sidebar">
            <div className="contact-page__sidebar-card">
              <span className="contact-page__sidebar-label">OFFICE</span>
              <h3>Wooven Kenya HQ</h3>
              <p>Westlands, Nairobi, Kenya</p>

              <a
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=Westlands+Nairobi+Kenya"
                target="_blank"
                rel="noreferrer"
              >
                Get directions
                <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="contact-page__sidebar-card">
              <span className="contact-page__sidebar-label">HOURS</span>
              <ul className="contact-page__hours-list">
                <li>
                  <span>Mon - Fri</span>
                  <span>7:00am - 8:00pm</span>
                </li>
                <li>
                  <span>Saturday</span>
                  <span>8:00am - 6:00pm</span>
                </li>
                <li>
                  <span>Sunday</span>
                  <span>On-call for arrivals</span>
                </li>
              </ul>
            </div>

            <div className="contact-page__sidebar-card contact-page__sidebar-card--gold">
              <span className="contact-page__sidebar-label">FOLLOW WOOVEN</span>
              <div className="contact-page__social-row">
                <a href="#" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            <img
              className="contact-page__sidebar-image"
              src={driverImage}
              alt="A Wooven Host Driver ready to assist"
            />
          </aside>
        </div>
      </section>

      <section className="contact-page__faq section">
        <div className="site-container contact-page__faq-grid">
          <div>
            <p className="eyebrow eyebrow--gold">Before you reach out</p>
            <h2>
              Common
              <em> questions.</em>
            </h2>
          </div>

          <div className="contact-page__faq-list">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              const itemClass = open
                ? "contact-page__faq-item contact-page__faq-item--open"
                : "contact-page__faq-item";

              return (
                <div className={itemClass} key={item.q}>
                  <button type="button" onClick={() => setOpenFaq(open ? -1 : index)}>
                    <span>{item.q}</span>
                    <ChevronDown size={18} />
                  </button>
                  {open && <p>{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="contact-page__cta section">
        <div className="site-container">
          <p className="eyebrow">Ready when you are</p>
          <h2>Your journey deserves a Host Driver, not a stranger.</h2>
          <a className="button button--gold button--large" href="tel:+254700000000">
            Speak to our team
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;