import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Headphones,
  MapPin,
  PlaneLanding,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";

import heroImage from "../../assets/hero.png";
import welcomeImage from "../../assets/Chauffer Plackard.png";
import cityImage from "../../assets/Chauffer opening for Business Man.png";
import stayImage from "../../assets/Diaspora Family in the Back of a Car.png";
import journeyImage from "../../assets/Landcruiser on Naivasha Rd.png";
import executiveImage from "../../assets/Chauffer with E250 infront of Hotel.png";
import hostImage from "../../assets/Chauffer Opening Door.png";
import airportImage from "../../assets/Arrivals.png";
import maraImage from "../../assets/Maasai_Mara.png";
import dianiImage from "../../assets/diani.png";
import nairobiImage from "../../assets/Nairobi_Skyscrappers.png";

const services = [
  {
    number: "01",
    title: "Wooven Welcome",
    label: "Airport arrivals",
    description:
      "Airport meet-and-greet, luggage assistance and a calm, assured welcome into Kenya.",
    details: ["Meet-and-greet", "Airport transfer", "Luggage assistance"],
    image: welcomeImage,
  },
  {
    number: "02",
    title: "Wooven City",
    label: "Daily city mobility",
    description:
      "A trusted Host Driver for meetings, errands, family visits and a day that moves with you.",
    details: ["Business meetings", "Errands & visits", "Flexible scheduling"],
    image: cityImage,
  },
  {
    number: "03",
    title: "Wooven Stay",
    label: "Extended stays",
    description:
      "Flexible daily mobility for extended stays, returning families and guests finding their rhythm.",
    details: ["Dedicated driver", "Daily coordination", "Personalised support"],
    image: stayImage,
  },
  {
    number: "04",
    title: "Wooven Journey",
    label: "Beyond the city",
    description:
      "Comfortable long-distance and upcountry travel, carefully coordinated from route to arrival.",
    details: ["Upcountry travel", "Route planning", "Travel adjustments"],
    image: journeyImage,
  },
  {
    number: "05",
    title: "Wooven Executive",
    label: "Business & protocol",
    description:
      "Discreet, polished chauffeur service for executives, corporate teams and exceptional occasions.",
    details: ["Executive vehicle", "Professional host", "Priority coordination"],
    image: executiveImage,
  },
];

const ecosystemStages = [
  {
    number: "01",
    title: "Pre-arrival",
    icon: CalendarDays,
    items: [
      "Service selection",
      "Travel consultation",
      "Booking confirmation",
      "Driver assignment",
      "Journey planning",
    ],
    outcome: "Peace of mind before arrival",
  },
  {
    number: "02",
    title: "Arrival",
    icon: PlaneLanding,
    items: [
      "Airport meet & greet",
      "Luggage assistance",
      "Real-time driver coordination",
      "Safe transfer to destination",
    ],
    outcome: "Stress-free arrival experience",
  },
  {
    number: "03",
    title: "During the stay",
    icon: UsersRound,
    items: [
      "Dedicated personal driver",
      "Daily travel coordination",
      "Family visits & errands",
      "Business meeting support",
      "Flexible scheduling",
      "Upcountry travel planning",
    ],
    outcome: "Seamless mobility throughout the stay",
  },
  {
    number: "04",
    title: "Journey management",
    icon: Compass,
    items: [
      "Driver monitoring",
      "GPS-enabled journeys",
      "Route optimisation",
      "Customer support",
      "Travel adjustments",
      "Safety assurance",
    ],
    outcome: "Reliable and dependable service",
  },
  {
    number: "05",
    title: "Departure & retention",
    icon: Sparkles,
    items: [
      "Airport transfer",
      "Client feedback",
      "Future travel planning",
      "Referral programme",
      "Repeat booking management",
    ],
    outcome: "Long-term client relationships",
  },
];

const destinations = [
  "Nairobi",
  "Mombasa",
  "Diani",
  "Naivasha",
  "Nakuru",
  "Nanyuki",
  "Kisumu",
  "Kisii",
  "Eldoret",
  "Amboseli",
  "Maasai Mara",
];

function HomePage() {
  const [activeService, setActiveService] = useState(0);
  const selectedService = services[activeService];

  return (
    <div id="top" className="homepage">
      <a className="expert-fab" href="#contact">
        <span className="expert-fab__icon">
          <Headphones size={21} />
        </span>

        <span className="expert-fab__content">
          <small>Need help planning?</small>
          Speak to an expert
        </span>
      </a>

      <section className="hero">
        <img
          className="hero__background"
          src={heroImage}
          alt="Wooven Host Driver welcoming a guest at Jomo Kenyatta International Airport"
        />

        <div className="hero__overlay" />
        <div className="hero__grain" />

        <div className="hero__content site-container">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--hero">
              <span className="eyebrow__dot" />
              Personal driver & travel concierge
            </p>

            <h1>
              Kenya begins
              <span>the moment</span>
              <em>you arrive.</em>
            </h1>

            <p>
              Travel with a dedicated Wooven Host Driver and a concierge team
              that holds every detail together—so you can focus on being
              present for what brought you here.
            </p>

            <div className="hero__actions">
              <a className="button button--gold button--large" href="#booking">
                Plan your journey <ArrowUpRight size={19} />
              </a>

              <a className="hero__text-link" href="#journey">
                Discover the Wooven experience <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <aside className="hero__trip-preview">
            <div className="trip-preview__top">
              <span>
                <i /> Concierge coordination
              </span>
              <small>LIVE</small>
            </div>

            <div className="trip-preview__route">
              <div className="route-markers">
                <span />
                <i />
                <b />
              </div>

              <div>
                <strong>Airport arrival</strong>
                <small>Jomo Kenyatta International Airport</small>

                <strong>Destination confirmed</strong>
                <small>Karen, Nairobi</small>
              </div>
            </div>

            <div className="trip-preview__host">
              <div>WK</div>

              <span>
                <strong>Your Host Driver is ready</strong>
                <small>Meet-and-greet arranged</small>
              </span>

              <CheckCircle2 size={19} />
            </div>
          </aside>
        </div>

        <div className="hero__bottom site-container">
          <div className="hero__trust">
            <span>
              <ShieldCheck size={18} /> Vetted Host Drivers
            </span>

            <span>
              <Clock3 size={18} /> Concierge support
            </span>

            <span>
              <MapPin size={18} /> Live trip visibility
            </span>
          </div>

          <a className="hero__scroll" href="#introduction">
            Scroll to explore <ArrowDown size={17} />
          </a>
        </div>
      </section>

      <section id="introduction" className="introduction section">
        <div className="site-container introduction__grid">
          <div>
            <p className="eyebrow">The Wooven promise</p>

            <h2>
              More than transport.
              <br />
              <em>A more thoughtful way to move.</em>
            </h2>
          </div>

          <div className="introduction__content">
            <p>
              Wooven is for the traveller who wants more than a car at the
              curb. It is the confidence of a familiar face at the airport, a
              professional who knows the road ahead, and a team that has
              already considered the details you should not need to.
            </p>

            <a className="text-link" href="#services">
              Explore our services <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="site-container information-bar">
          <div>
            <PlaneLanding size={24} />

            <span>
              <strong>Arrivals, elevated</strong>
              Meet-and-greet through to your destination
            </span>
          </div>

          <div>
            <UsersRound size={24} />

            <span>
              <strong>A Host Driver, not just a driver</strong>
              Professional, local and guest-focused
            </span>
          </div>

          <div>
            <Headphones size={24} />

            <span>
              <strong>Real people, real support</strong>
              Before, during and after your journey
            </span>
          </div>
        </div>
      </section>

      <section id="services" className="services section">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Services curated for every travel need</p>
              <h2>Choose the way you would like Kenya to feel.</h2>
            </div>

            <p>
              From a single airport welcome to a multi-week stay, Wooven adapts
              to the shape of your visit.
            </p>
          </div>

          <div className="service-showcase">
            <div className="service-selector">
              {services.map((service, index) => (
                <button
                  key={service.title}
                  type="button"
                  className={`service-option ${
                    activeService === index ? "service-option--active" : ""
                  }`}
                  onClick={() => setActiveService(index)}
                >
                  <span>{service.number}</span>

                  <div>
                    <small>{service.label}</small>
                    <strong>{service.title}</strong>
                  </div>

                  <ChevronRight size={18} />
                </button>
              ))}
            </div>

            <article className="service-stage">
              <img src={selectedService.image} alt={selectedService.title} />
              <div className="service-stage__overlay" />

              <div className="service-stage__content">
                <p>{selectedService.label}</p>
                <h3>{selectedService.title}</h3>
                <span>{selectedService.description}</span>

                <div className="service-stage__details">
                  {selectedService.details.map((detail) => (
                    <small key={detail}>
                      <CheckCircle2 size={15} />
                      {detail}
                    </small>
                  ))}
                </div>

                <a className="button button--gold" href="#booking">
                  Explore this service <ArrowUpRight size={17} />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="journey" className="journey section">
        <div className="site-container journey__heading">
          <div>
            <p className="eyebrow">The Wooven Journey Ecosystem</p>
            <h2>
              A seamless concierge ecosystem designed to support every stage
              of the traveller journey.
            </h2>
          </div>

          <p>
            Wooven coordinates the experience before arrival, through every
            moment of your stay, and long after your journey is complete.
          </p>
        </div>

        <div className="site-container ecosystem-grid">
          {ecosystemStages.map((stage) => {
            const Icon = stage.icon;

            return (
              <article className="ecosystem-card" key={stage.number}>
                <div className="ecosystem-card__top">
                  <span>{stage.number}</span>
                  <Icon size={21} />
                </div>

                <h3>{stage.title}</h3>

                <ul>
                  {stage.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div className="ecosystem-card__outcome">
                  <small>Outcome</small>
                  <strong>{stage.outcome}</strong>
                </div>
              </article>
            );
          })}
        </div>

        <div className="site-container journey__feature">
          <img
            src={hostImage}
            alt="A Wooven Host Driver opening a vehicle door for a client"
          />

          <div>
            <p className="eyebrow eyebrow--gold">The human detail</p>

            <h3>Travel works better when someone is expecting you.</h3>

            <p>
              Your Host Driver is selected to meet your needs, your plans and
              the kind of welcome you deserve. That is the difference between
              being transported and being looked after.
            </p>

            <a className="button button--gold" href="#booking">
              Create your itinerary <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <section id="destinations" className="destinations section">
        <div className="site-container">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow eyebrow--gold">Kenya, connected with care</p>
              <h2>Wherever the journey leads, Wooven is ready.</h2>
            </div>

            <a className="text-link text-link--light" href="#booking">
              Discuss your route <ArrowRight size={18} />
            </a>
          </div>

          <div className="destination-gallery">
            <article className="destination destination--large">
              <img src={nairobiImage} alt="Nairobi skyline" />

              <div>
                <span>City rhythm</span>
                <h3>Nairobi</h3>
              </div>
            </article>

            <article className="destination">
              <img src={maraImage} alt="Maasai Mara landscape" />

              <div>
                <span>Into the wild</span>
                <h3>Maasai Mara</h3>
              </div>
            </article>

            <article className="destination">
              <img src={dianiImage} alt="Diani beach" />

              <div>
                <span>Coastal escape</span>
                <h3>Diani</h3>
              </div>
            </article>
          </div>

          <div className="destination-list">
            {destinations.map((destination) => (
              <span key={destination}>
                <MapPin size={14} />
                {destination}
              </span>
            ))}

            <span className="destination-list__request">
              Additional destinations on request
            </span>
          </div>
        </div>
      </section>

      <section id="safety" className="safety section">
        <div className="site-container safety__grid">
          <div className="safety__visual">
            <img
              src={airportImage}
              alt="Thoughtful airport arrival support from Wooven"
            />

            <div className="safety__seal">
              <ShieldCheck size={28} />
              <span>TRUST IS</span>
              <strong>
                built into
                <br />
                every trip
              </strong>
            </div>
          </div>

          <div className="safety__content">
            <p className="eyebrow">Trust, safety & reliability</p>

            <h2>Carefully selected people. Clearly managed journeys.</h2>

            <p>
              Confidence is not a feature added at the end. It is built into
              how Wooven works—from driver verification and vehicle standards
              to live journey updates and responsive support.
            </p>

            <div className="safety__checks">
              <span>
                <CheckCircle2 size={19} />
                Driver background and licence verification
              </span>

              <span>
                <CheckCircle2 size={19} />
                Vehicle compliance and insurance checks
              </span>

              <span>
                <CheckCircle2 size={19} />
                Clear confirmations and live GPS visibility
              </span>

              <span>
                <CheckCircle2 size={19} />
                Support and service monitoring throughout
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="booking section">
        <div className="site-container booking__card">
          <div className="booking__copy">
            <p className="eyebrow eyebrow--gold">Start with the essentials</p>
            <h2>Tell us where your Kenya begins.</h2>

            <p>
              Share the outline of your journey and our concierge team will
              guide you to the right Wooven experience.
            </p>
          </div>

          <div className="booking__panel">
            <div className="booking__field">
              <MapPin size={19} />

              <span>
                <small>Pickup or arrival point</small>
                Where should we meet you?
              </span>

              <ChevronRight size={18} />
            </div>

            <div className="booking__field">
              <CalendarDays size={19} />

              <span>
                <small>When are you travelling?</small>
                Choose your date and time
              </span>

              <ChevronRight size={18} />
            </div>

            <a className="button button--gold button--wide" href="#contact">
              Continue to booking <ArrowUpRight size={18} />
            </a>

            <p className="booking__note">
              <WalletCards size={15} />
              Secure payments, flexible plans and concierge support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;