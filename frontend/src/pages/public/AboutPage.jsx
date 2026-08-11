import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Globe2,
  Handshake,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import heroImage from "../../assets/Chauffer with E250 infront of Hotel.png"
import driverImage from "../../assets/Chauffer Opening Door.png";
import teamImage from "../../assets/Chauffer helping Tourists.png";
import trustImage from "../../assets/Driver Inspecting Car.png";

const values = [
  {
    name: "Trust",
    text: "Building lasting relationships through reliability and transparency.",
    icon: ShieldCheck,
  },
  {
    name: "Hospitality",
    text: "Delivering warm, professional and personalised service.",
    icon: HeartHandshake,
  },
  {
    name: "Professionalism",
    text: "Maintaining the highest standards in conduct and service delivery.",
    icon: BadgeCheck,
  },
  {
    name: "Reliability",
    text: "Providing dependable support whenever and wherever it is needed.",
    icon: Sparkles,
  },
  {
    name: "Service Excellence",
    text: "Consistently exceeding client expectations.",
    icon: Award,
  },
  {
    name: "Respect",
    text: "Treating every guest, partner and employee with dignity.",
    icon: Handshake,
  },
];

const segments = [
  {
    name: "Diaspora Visitors",
    text: "Returning home for family visits, investment activities, celebrations and personal engagements.",
    icon: UsersRound,
  },
  {
    name: "Business Travellers",
    text: "Professionals attending meetings, conferences and corporate assignments.",
    icon: Briefcase,
  },
  {
    name: "International Visitors",
    text: "Guests seeking safe, comfortable and dependable travel support throughout Kenya.",
    icon: Globe2,
  },
  {
    name: "Families & Groups",
    text: "Travellers requiring coordinated mobility and concierge assistance.",
    icon: HeartHandshake,
  },
];

const hostDriverTraits = [
  "Professional driving expertise",
  "Customer service excellence",
  "Local knowledge",
  "Concierge support capabilities",
  "Safety awareness",
];

const difference = [
  { traditional: "Different drivers each trip", wooven: "Dedicated Host Driver" },
  { traditional: "Transaction-based service", wooven: "Relationship-based service" },
  { traditional: "Limited support", wooven: "Concierge assistance" },
  { traditional: "Focus on transport", wooven: "Focus on complete travel experience" },
  { traditional: "Reactive service", wooven: "Proactive journey management" },
  { traditional: "Variable quality", wooven: "Consistent standards" },
];

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-page__hero">
        <div className="about-page__hero-image">
          <img src={heroImage} alt="Wooven Host Driver with business travellers" />
        </div>

        <div className="about-page__hero-copy">
          <p className="eyebrow eyebrow--gold">About Wooven Kenya</p>

          <h1>
            Your journeys in Kenya,
            <em> thoughtfully woven.</em>
          </h1>

          <p>
            Wooven is a premium personal driver and travel concierge company,
            created for travellers who want to move through Kenya with more
            confidence, comfort and peace of mind.
          </p>

          <a className="button button--gold button--large" href="#our-story">
            Our story <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section id="our-story" className="about-page__story section">
        <div className="site-container about-page__story-grid">
          <div>
            <p className="eyebrow">Why we exist</p>
            <h2>
              Travel should be effortless.
              <em> It should never feel fragmented.</em>
            </h2>
          </div>

          <div className="about-page__story-copy">
            <p>
              Wooven Kenya is a premium personal driver and travel concierge
              company designed to provide travellers with a seamless, safe
              and personalised mobility experience across Kenya.
            </p>
            <p>
              We serve diaspora visitors, business travellers and
              international guests seeking a dependable alternative to
              fragmented transport arrangements, daily ride-hailing bookings
              and traditional car hire. Through dedicated Wooven Host
              Drivers, trusted vehicle partners and concierge-style support,
              we help clients navigate Kenya with confidence, comfort and
              peace of mind.
            </p>

            <div className="about-page__promise">
              <span>THE WOOVEN PROMISE</span>
              <strong>
                You focus on why you came. We take care of getting around.
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__purpose section">
        <div className="site-container about-page__purpose-grid">
          <div className="about-page__purpose-card">
            <span>OUR VISION</span>
            <h3>To become Kenya's most trusted personal driver and travel concierge service.</h3>
          </div>

          <div className="about-page__purpose-card about-page__purpose-card--gold">
            <span>OUR MISSION</span>
            <h3>
              To provide dependable personal driver and concierge services
              that enable travellers to experience Kenya with confidence,
              comfort and peace of mind.
            </h3>
          </div>
        </div>
      </section>

      <section className="about-page__serve section">
        <div className="site-container about-page__serve-grid">
          <div className="about-page__serve-image">
            <img src={trustImage} alt="Wooven Host Driver inspecting a vehicle before a trip" />
          </div>

          <div>
            <p className="eyebrow eyebrow--gold">Who we serve</p>
            <h2>
              Built for the way
              <em> today's traveller moves.</em>
            </h2>

            <div className="about-page__serve-list">
              {segments.map((segment) => {
                const Icon = segment.icon;
                return (
                  <article key={segment.name}>
                    <Icon size={22} />
                    <h3>{segment.name}</h3>
                    <p>{segment.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__model section">
        <div className="site-container about-page__model-grid">
          <div className="about-page__model-image">
            <img src={teamImage} alt="Wooven Host Driver supporting guests" />
          </div>

          <div>
            <p className="eyebrow">A concierge ecosystem</p>
            <h2>
              More than transportation.
              <em> A connected way to travel.</em>
            </h2>

            <p className="about-page__model-copy">
              Wooven coordinates travellers, professional Host Drivers, vehicle
              partners and service providers to deliver a reliable and
              personalised experience from first enquiry to final arrival.
            </p>

            <div className="about-page__model-list">
              <span><UsersRound size={20} /> Travellers with individual needs</span>
              <span><MapPinned size={20} /> Trusted drivers and vehicle partners</span>
              <span><HeartHandshake size={20} /> A concierge team coordinating it all</span>
              <span><ShieldCheck size={20} /> Safety, support and service monitoring</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__difference section">
        <div className="site-container">
          <div className="about-page__difference-heading">
            <p className="eyebrow eyebrow--gold">The Wooven difference</p>
            <h2>We are not a taxi service.</h2>
            <p className="about-page__difference-lede">
              We are a travel companion and mobility concierge partner —
              built around consistency, not just a single ride.
            </p>
          </div>

          <div className="about-page__difference-table">
            <div className="about-page__difference-row about-page__difference-row--head">
              <span>Traditional Transport</span>
              <span>Wooven Kenya</span>
            </div>
            {difference.map((row) => (
              <div className="about-page__difference-row" key={row.wooven}>
                <span className="about-page__difference-old">{row.traditional}</span>
                <span className="about-page__difference-new">
                  <CheckCircle2 size={16} /> {row.wooven}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__values section">
        <div className="site-container">
          <div className="about-page__values-heading">
            <p className="eyebrow eyebrow--gold">What guides us</p>
            <h2>The way we show up matters.</h2>
          </div>

          <div className="about-page__values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article key={value.name}>
                  <span>0{index + 1}</span>
                  <Icon size={25} />
                  <h3>{value.name}</h3>
                  <p>{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-page__host section">
        <div className="site-container about-page__host-grid">
          <div>
            <p className="eyebrow">Meet the Wooven Host Driver</p>
            <h2>
              More than a driver.
              <em> A trusted companion on the road.</em>
            </h2>

            <p>
              Every Wooven Host Driver combines professional driving expertise,
              local knowledge, safety awareness and genuine hospitality. They
              are there to help your time in Kenya feel calmer, easier and more
              connected.
            </p>

            <div className="about-page__host-traits">
              {hostDriverTraits.map((trait) => (
                <span key={trait}>
                  <CheckCircle2 size={16} /> {trait}
                </span>
              ))}
            </div>

            <a className="text-link" href="/ServicesPage">
              Explore our services <ArrowRight size={17} />
            </a>
          </div>

          <img src={driverImage} alt="A Wooven Host Driver opening a car door" />
        </div>
      </section>

      <section className="about-page__cta section">
        <div className="site-container">
          <p className="eyebrow">Travel with confidence</p>
          <h2>Wherever Kenya takes you, Wooven is ready.</h2>
          <a className="button button--gold button--large" href="#booking">
            Start planning <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;