import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Compass,
  Headphones,
  MapPin,
  PlaneLanding,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import heroImage from "../../assets/Chauffer Viewing.png";
import planningImage from "../../assets/Booking.png";
import arrivalImage from "../../assets/Arrivals.png";
import mobilityImage from "../../assets/Chauffer_Groceries.png";
import supportImage from "../../assets/Support Agent.png";

const ecosystemServices = [
  {
    number: "01",
    title: "Travel Planning & Booking",
    shortTitle: "Planning",
    icon: CalendarDays,
    image: planningImage,
    description:
      "Creating a seamless experience before the journey even begins. We understand what you need, shape the right service and coordinate the details in advance.",
    includes: [
      "Travel consultation",
      "Service selection and package design",
      "Booking management",
      "Travel itinerary coordination",
      "Airport transfer planning",
      "Special requests management",
    ],
    outcome: "A confident, well-prepared journey before arrival.",
  },
  {
    number: "02",
    title: "Driver & Service Management",
    shortTitle: "Matching",
    icon: UsersRound,
    image: heroImage,
    description:
      "Matching every client with the right Wooven Host Driver, vehicle and travel support plan for the journey ahead.",
    includes: [
      "Host Driver assignment",
      "Vehicle allocation",
      "Schedule coordination",
      "Service quality standards",
      "Driver training and certification",
      "Travel support planning",
    ],
    outcome: "The right person, vehicle and service for every guest.",
  },
  {
    number: "03",
    title: "Arrival & Concierge Support",
    shortTitle: "Welcome",
    icon: PlaneLanding,
    image: arrivalImage,
    description:
      "Ensuring that every arrival feels calm, cared for and genuinely welcoming from the airport through to the final destination.",
    includes: [
      "Airport meet and greet",
      "Luggage assistance",
      "Accommodation transfers",
      "Local travel orientation",
      "Concierge support",
      "Emergency assistance coordination",
    ],
    outcome: "A stress-free arrival experience from the first moment.",
  },
  {
    number: "04",
    title: "Mobility Operations",
    shortTitle: "Movement",
    icon: MapPin,
    image: mobilityImage,
    description:
      "Managing day-to-day movement throughout a guest’s stay with flexibility, professionalism and local knowledge.",
    includes: [
      "Dedicated personal driver services",
      "Business travel support",
      "Family visit coordination",
      "Errand assistance",
      "Event transportation",
      "Long-distance travel planning",
    ],
    outcome: "Seamless mobility throughout every stay.",
  },
  {
    number: "05",
    title: "Journey Monitoring & Customer Care",
    shortTitle: "Monitoring",
    icon: Compass,
    image: planningImage,
    description:
      "Delivering reliability, safety and peace of mind while a journey is in motion and when plans need to change.",
    includes: [
      "Real-time trip monitoring",
      "Driver support",
      "Customer assistance",
      "Service adjustments",
      "Safety oversight",
      "Issue resolution",
    ],
    outcome: "Reliable, dependable service at every stage.",
  },
  {
    number: "06",
    title: "Client Relationship Management",
    shortTitle: "Relationships",
    icon: Headphones,
    image: supportImage,
    description:
      "Building relationships that continue beyond a single booking, through attentive service and meaningful follow-up.",
    includes: [
      "Feedback collection",
      "Repeat booking management",
      "Referral programmes",
      "Loyalty benefits",
      "Future travel planning",
      "Corporate account management",
    ],
    outcome: "Long-term relationships, not one-off transactions.",
  },
  {
    number: "07",
    title: "Trust, Safety & Governance",
    shortTitle: "Trust",
    icon: ShieldCheck,
    image: heroImage,
    description:
      "Maintaining the highest standards of professionalism, safety, privacy and accountability across the Wooven experience.",
    includes: [
      "Driver vetting and verification",
      "Vehicle compliance checks",
      "Service protocols",
      "Customer privacy protection",
      "Insurance and risk management",
      "Quality assurance monitoring",
    ],
    outcome: "Confidence built into every service decision.",
  },
  {
    number: "08",
    title: "Performance & Business Management",
    shortTitle: "Excellence",
    icon: Sparkles,
    image: mobilityImage,
    description:
      "Using insight, measurement and partner collaboration to keep the Wooven experience improving with every journey.",
    includes: [
      "Booking analytics",
      "Service performance tracking",
      "Customer satisfaction measurement",
      "Driver performance reviews",
      "Revenue and profitability management",
      "Partnership development",
    ],
    outcome: "A service that learns, improves and grows responsibly.",
  },
];

function ServicesPage() {
  const [activeService, setActiveService] = useState(0);
  const selected = ecosystemServices[activeService];
  const SelectedIcon = selected.icon;

  return (
    <main className="services-page-v3">
      <a className="services-v3-expert-fab" href="#expert">
        <span>
          <Headphones size={21} />
        </span>

        <div>
          <small>Need help planning?</small>
          Speak to an expert
        </div>
      </a>

      <section className="services-v3-hero">
        <div className="services-v3-hero__copy">
          <p className="eyebrow">The Wooven concierge ecosystem</p>

          <span className="services-v3-hero__number">08</span>

          <h1>
            Every journey is held
            <em> by a system that cares.</em>
          </h1>

          <p>
            Wooven is not simply a driver service. It is an end-to-end
            concierge ecosystem designed to plan, welcome, move, monitor and
            support every traveller through Kenya.
          </p>

          <div className="services-v3-hero__actions">
            <a className="button button--gold button--large" href="#ecosystem">
              Explore the ecosystem <ArrowRight size={18} />
            </a>

            <a className="services-v3-hero__link" href="#expert">
              Speak to our concierge <Headphones size={18} />
            </a>
          </div>

          <div className="services-v3-hero__keywords">
            <span>Plan</span>
            <i />
            <span>Welcome</span>
            <i />
            <span>Move</span>
            <i />
            <span>Care</span>
          </div>
        </div>

        <div className="services-v3-hero__visual">
          <div className="services-v3-hero__gold-block" />

          <div className="services-v3-hero__image-frame">
            <img
              src={heroImage}
              alt="Wooven Host Driver providing concierge support"
            />

            <div className="services-v3-hero__image-label">
              <span>WOOVEN HOST DRIVER</span>
              <strong>Prepared for every detail.</strong>
            </div>
          </div>

          <div className="services-v3-hero__orbit">
            <span>TRAVEL</span>
            <span>CARE</span>
            <span>TRUST</span>
            <span>MOVEMENT</span>
          </div>

          <div className="services-v3-hero__system-card">
            <Sparkles size={19} />

            <span>
              <small>ONE CONNECTED EXPERIENCE</small>
              Eight disciplines, working as one.
            </span>
          </div>
        </div>
      </section>

      <section className="services-v3-intro section">
        <div className="site-container services-v3-intro__grid">
          <div>
            <p className="eyebrow">More than transportation</p>

            <h2>
              The road is only
              <br />
              one part of the experience.
            </h2>
          </div>

          <div>
            <p>
              The best journeys are prepared before they begin, thoughtfully
              managed while they happen and remembered long after they end.
              That is why Wooven brings together eight connected disciplines
              under one trusted concierge experience.
            </p>

            <a className="text-link" href="#ecosystem">
              See how it all connects <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="site-container services-v3-flow">
          <div>
            <CalendarDays size={22} />
            <span>
              <strong>Before the journey</strong>
              Planning, matching and preparation
            </span>
          </div>

          <div>
            <PlaneLanding size={22} />
            <span>
              <strong>At every arrival</strong>
              Welcome, comfort and coordination
            </span>
          </div>

          <div>
            <MapPin size={22} />
            <span>
              <strong>During every stay</strong>
              Daily movement and live care
            </span>
          </div>

          <div>
            <Sparkles size={22} />
            <span>
              <strong>Beyond the booking</strong>
              Relationships, insight and improvement
            </span>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="services-v3-ecosystem section">
        <div className="site-container">
          <div className="services-v3-heading">
            <div>
              <p className="eyebrow">Eight disciplines. One seamless experience.</p>

              <h2>
                Select a discipline to see the care behind every Wooven journey.
              </h2>
            </div>

            <p>
              Each discipline has a distinct role, yet each one works together
              to ensure the traveller feels supported from first contact to
              future travel.
            </p>
          </div>

          <div className="services-v3-ecosystem__layout">
            <div className="services-v3-ecosystem__rail">
              {ecosystemServices.map((service, index) => {
                const Icon = service.icon;

                return (
                  <button
                    key={service.title}
                    type="button"
                    className={`services-v3-rail-button ${
                      activeService === index
                        ? "services-v3-rail-button--active"
                        : ""
                    }`}
                    onClick={() => setActiveService(index)}
                  >
                    <span>{service.number}</span>
                    <Icon size={18} />

                    <div>
                      <small>{service.shortTitle}</small>
                      <strong>{service.title}</strong>
                    </div>

                    <ChevronRight size={17} />
                  </button>
                );
              })}
            </div>

            <article className="services-v3-detail" key={selected.title}>
              <div className="services-v3-detail__image">
                <img src={selected.image} alt={selected.title} />
                <div />

                <span>{selected.number}</span>
                <SelectedIcon size={25} />
              </div>

              <div className="services-v3-detail__content">
                <p className="eyebrow">{selected.shortTitle}</p>

                <h3>{selected.title}</h3>

                <p>{selected.description}</p>

                <div className="services-v3-detail__includes">
                  <small>What this discipline covers</small>

                  <div>
                    {selected.includes.map((item) => (
                      <span key={item}>
                        <CheckCircle2 size={16} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="services-v3-detail__outcome">
                  <Sparkles size={18} />

                  <span>
                    <small>OUTCOME</small>
                    {selected.outcome}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="services-v3-standard section">
        <div className="site-container services-v3-standard__grid">
          <div>
            <p className="eyebrow eyebrow--gold">The Wooven standard</p>

            <h2>
              Every discipline is held to the same promise:
              <em> you are looked after.</em>
            </h2>

            <p>
              Every role within the ecosystem exists to remove uncertainty from
              travel. From verified drivers and compliant vehicles to real-time
              support and continuous quality review, care is built into the
              operating model.
            </p>
          </div>

          <div className="services-v3-standard__list">
            <span>
              <ShieldCheck size={21} />
              Carefully vetted drivers and vehicle partners
            </span>

            <span>
              <MapPin size={21} />
              Clear journey coordination and location visibility
            </span>

            <span>
              <Headphones size={21} />
              Support before, during and after every trip
            </span>

            <span>
              <UsersRound size={21} />
              A relationship-led service, not a transaction
            </span>
          </div>
        </div>
      </section>

      <section id="expert" className="services-v3-expert section">
        <div className="site-container services-v3-expert__card">
          <img
            src={supportImage}
            alt="Wooven concierge support specialist"
          />

          <div>
            <p className="eyebrow">Let us help shape the journey</p>

            <h2>Tell us what brings you to Kenya.</h2>

            <p>
              A Wooven travel expert can help you understand the right service,
              vehicle, route and level of support for your arrival, stay or
              next destination.
            </p>

            <div className="services-v3-expert__actions">
              <a className="button button--gold button--large" href="#contact">
                Speak to an expert <Headphones size={19} />
              </a>

              <span>
                <CheckCircle2 size={17} />
                Personal support from first enquiry
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServicesPage;