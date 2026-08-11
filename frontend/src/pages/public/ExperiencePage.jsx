import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  ChevronRight,
  HeartHandshake,
  MapPin,
  PlaneLanding,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import heroImage from "../../assets/Tourist in the Back.png";
import arrivalImage from "../../assets/Arrivals.png";
import journeyImage from "../../assets/Landcruiser on Naivasha Rd.png";
import supportImage from "../../assets/Track_route.png";

const experienceSteps = [
  {
    number: "01",
    title: "Plan with a person",
    text: "A real Wooven concierge understands your itinerary, group and preferences before matching you with the right service.",
    icon: CalendarCheck,
  },
  {
    number: "02",
    title: "Arrive with ease",
    text: "Your Host Driver is prepared before you land, ready to make your first moments in Kenya calm and welcoming.",
    icon: PlaneLanding,
  },
  {
    number: "03",
    title: "Move at your pace",
    text: "Your plans can change. Your Wooven experience can change with them, without starting over every time.",
    icon: MapPin,
  },
];

const comparisonRows = [
  {
    label: "The person behind the wheel",
    rideshare: "A nearby driver, matched for one trip",
    wooven: "A vetted Host Driver, matched to your journey",
  },
  {
    label: "Your travel plans",
    rideshare: "You organise every trip separately",
    wooven: "One team understands the full picture",
  },
  {
    label: "When plans change",
    rideshare: "Start again and hope for availability",
    wooven: "Flexible support from people already involved",
  },
  {
    label: "Your arrival",
    rideshare: "Find your car, confirm your details",
    wooven: "A prepared welcome, from airport to destination",
  },
];

function ExperiencePage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="wooven-experience">
      <section className="wooven-experience__hero">
        <img
          className="wooven-experience__hero-image"
          src={heroImage}
          alt="Guest enjoying a comfortable journey with Wooven"
        />

        <div className="wooven-experience__hero-overlay" />

        <div className="site-container wooven-experience__hero-content">
          <p className="eyebrow eyebrow--gold">The Wooven experience</p>

          <h1>
            Kenya feels better
            <em> when someone is looking after you.</em>
          </h1>

          <p className="wooven-experience__hero-copy">
            Wooven brings together thoughtful planning, trusted Host Drivers
            and human support to make every journey feel calm, personal and
            beautifully simple.
          </p>

          <div className="wooven-experience__hero-actions">
            <a className="button button--gold button--large" href="#why-wooven">
              See the difference <ArrowRight size={18} />
            </a>

            <a className="wooven-experience__hero-link" href="#your-journey">
              Explore the experience <ChevronRight size={18} />
            </a>
          </div>
        </div>

        <div className="wooven-experience__hero-note">
          <span>MORE THAN A RIDE</span>
          <strong>Care, connection and confidence at every turn.</strong>
        </div>
      </section>

      <section className="wooven-experience__intro section">
        <div className="site-container wooven-experience__intro-grid">
          <div>
            <p className="eyebrow">Travel should feel effortless</p>
            <h2>
              You should be present
              <em> for the journey.</em>
            </h2>
          </div>

          <div>
            <p>
              The best service is often the one you do not have to think
              about. Wooven quietly takes care of the details behind your
              movement, so you have more room for family, work, discovery and
              the moments that brought you here.
            </p>

            <div className="wooven-experience__intro-line" />
            <strong>Thoughtful travel, shaped around real life.</strong>
          </div>
        </div>
      </section>

      <section id="why-wooven" className="wooven-experience__comparison section">
        <div className="site-container">
          <div className="wooven-experience__comparison-heading">
            <div>
              <p className="eyebrow eyebrow--gold">Why choose Wooven?</p>
              <h2>
                A rideshare gets you there.
                <em> Wooven looks after the journey.</em>
              </h2>
            </div>

            <p>
              Rideshare is useful for a quick trip. Wooven is for when your
              time, comfort, family, business or arrival deserves more care.
            </p>
          </div>

          <div className="wooven-experience__comparison-table">
            <div className="wooven-experience__comparison-head">
              <span>The difference</span>
              <span>Typical rideshare</span>
              <span>Wooven experience</span>
            </div>

            {comparisonRows.map((row) => (
              <article key={row.label} className="wooven-experience__comparison-row">
                <strong>{row.label}</strong>

                <p>
                  <span className="wooven-experience__comparison-dot" />
                  {row.rideshare}
                </p>

                <p className="wooven-experience__comparison-wooven">
                  <Check size={17} />
                  {row.wooven}
                </p>
              </article>
            ))}
          </div>

          <div className="wooven-experience__comparison-footer">
            <HeartHandshake size={22} />
            <p>
              Wooven is built for people who want to feel expected, understood
              and supported—not simply transported.
            </p>
          </div>
        </div>
      </section>

      <section id="your-journey" className="wooven-experience__journey section">
        <div className="site-container">
          <div className="wooven-experience__journey-heading">
            <p className="eyebrow">Your journey, held together</p>
            <h2>
              From the first message
              <em> to the final goodbye.</em>
            </h2>
          </div>

          <div className="wooven-experience__journey-layout">
            <div className="wooven-experience__step-buttons">
              {experienceSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={
                      activeStep === index
                        ? "wooven-experience__step-button wooven-experience__step-button--active"
                        : "wooven-experience__step-button"
                    }
                  >
                    <span>{step.number}</span>
                    <Icon size={21} />
                    <strong>{step.title}</strong>
                    <ChevronRight size={18} />
                  </button>
                );
              })}
            </div>

            <article className="wooven-experience__active-step">
              {experienceSteps.map((step, index) => {
                if (index !== activeStep) return null;

                const Icon = step.icon;

                return (
                  <div key={step.title}>
                    <span className="wooven-experience__active-number">{step.number}</span>
                    <Icon size={30} />
                    <p className="eyebrow">{step.title}</p>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>

                    <div className="wooven-experience__active-promise">
                      <Sparkles size={18} />
                      <span>Everything feels more seamless when it is connected.</span>
                    </div>
                  </div>
                );
              })}
            </article>

            <div className="wooven-experience__journey-image">
              <img src={arrivalImage} alt="Wooven airport welcome service" />
              <div />
              <span>YOUR TIME IN KENYA, MADE EASIER</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wooven-experience__trust section">
        <div className="site-container wooven-experience__trust-grid">
          <img src={journeyImage} alt="Wooven vehicle travelling through Kenya" />

          <div>
            <p className="eyebrow eyebrow--gold">The Wooven standard</p>
            <h2>
              Warm enough to feel personal.
              <em> Professional enough to trust completely.</em>
            </h2>

            <div className="wooven-experience__trust-list">
              <span>
                <UserRoundCheck size={20} />
                Carefully vetted and trained Host Drivers
              </span>
              <span>
                <ShieldCheck size={20} />
                Safety, privacy and comfort built into every service
              </span>
              <span>
                <HeartHandshake size={20} />
                Human support before, during and after your journey
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="wooven-experience__cta section">
        <div className="site-container wooven-experience__cta-card">
          <img src={supportImage} alt="Wooven concierge team member" />

          <div>
            <p className="eyebrow">Travel, made more personal</p>
            <h2>Tell us where you are going.</h2>
            <p>
              Whether you are arriving, returning home, travelling for work or
              exploring Kenya, we will help shape the right experience around you.
            </p>

            <a className="button button--gold button--large" href="#booking">
              Plan with Wooven <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ExperiencePage;