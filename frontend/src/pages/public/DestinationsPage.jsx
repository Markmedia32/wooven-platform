import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  MapPin,
  Route,
  Sparkles,
} from "lucide-react";

import nairobiImage from "../../assets/Nairobi_Skyscrappers.png";
import dianiImage from "../../assets/diani.png";
import maraImage from "../../assets/Maasai_Mara.png";
import amboseliImage from "../../assets/Amboseli National Park.png";
import naivashaImage from "../../assets/Landcruiser on Naivasha Rd.png";
import kisumuImage from "../../assets/Kisumu Lake.png";

const destinations = [
  {
    name: "Nairobi",
    type: "The city, connected",
    image: nairobiImage,
    description:
      "From airport arrivals and boardroom schedules to family visits and evenings out, Nairobi moves better with a trusted Host Driver beside you.",
    services: ["Airport welcome", "Executive mobility", "Daily personal driver"],
  },
  {
    name: "Diani",
    type: "The coast, unhurried",
    image: dianiImage,
    description:
      "A softer pace, beautifully coordinated. Wooven helps you move between airport, hotel, coast and every plan in between.",
    services: ["Airport transfers", "Resort stays", "Flexible day travel"],
  },
  {
    name: "Maasai Mara",
    type: "The journey, considered",
    image: maraImage,
    description:
      "Long-distance travel should feel as considered as the destination itself. We coordinate the road ahead with comfort and care.",
    services: ["Upcountry journeys", "Route coordination", "Group travel"],
  },
  {
    name: "Amboseli",
    type: "Travel with perspective",
    image: amboseliImage,
    description:
      "A quieter way to reach one of Kenya's most remarkable landscapes, with thoughtful planning from departure to arrival.",
    services: ["Private transfers", "Travel planning", "Dedicated Host Driver"],
  },
  {
    name: "Naivasha",
    type: "Just beyond the city",
    image: naivashaImage,
    description:
      "For weekends away, celebrations and business retreats, Wooven makes the transition from Nairobi feel entirely seamless.",
    services: ["Weekend journeys", "Event travel", "Flexible scheduling"],
  },
  {
    name: "Kisumu",
    type: "A familiar welcome",
    image: kisumuImage,
    description:
      "Whether returning home or visiting for the first time, enjoy dependable travel support shaped around your time in western Kenya.",
    services: ["Airport support", "Family visits", "Extended stays"],
  },
];

const coverage = [
  "Nairobi",
  "Naivasha",
  "Nakuru",
  "Nanyuki",
  "Eldoret",
  "Kisii",
  "Kisumu",
  "Mombasa",
  "Diani",
  "Amboseli",
  "Maasai Mara",
];

function DestinationsPage() {
  const [activeDestination, setActiveDestination] = useState(0);
  const selected = destinations[activeDestination];

  return (
    <main className="destinations-page">
      <section className="destinations-page__hero">
        <div className="site-container destinations-page__hero-grid">
          <div className="destinations-page__hero-copy">
            <p className="eyebrow eyebrow--gold">Explore Kenya with Wooven</p>

            <h1>
              Every destination
              <em> deserves a better way to arrive.</em>
            </h1>

            <p>
              From Nairobi's pace to the stillness of the Mara, Wooven connects
              each part of Kenya with trusted Host Drivers, thoughtful planning
              and concierge support that stays with you.
            </p>

            <a className="button button--gold button--large" href="#destinations">
              Explore destinations <ArrowRight size={18} />
            </a>

            <div className="destinations-page__hero-route">
              <Route size={18} />
              <span>Kenya-wide journeys, coordinated around you.</span>
            </div>
          </div>

          <div className="destinations-page__hero-visual">
            <img src={naivashaImage} alt="A Wooven journey through Kenya" />
            <div className="destinations-page__hero-visual-shade" />

            <div className="destinations-page__hero-location">
              <MapPin size={19} />
              <span>
                <small>TRAVEL THAT CONNECTS</small>
                Kenya, one thoughtful journey at a time.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-page__intro section">
        <div className="site-container destinations-page__intro-grid">
          <p className="eyebrow">More than a destination</p>

          <div>
            <h2>
              Kenya is never
              <em> just one story.</em>
            </h2>
            <p>
              It is the meeting you travelled for, the family waiting at home,
              the coast you have been dreaming of, and the road that takes you
              there. Wooven coordinates the movement so you can stay close to
              the reason for your journey.
            </p>
          </div>
        </div>
      </section>

      <section id="destinations" className="destinations-page__explorer section">
        <div className="site-container">
          <div className="destinations-page__heading">
            <div>
              <p className="eyebrow">Where Wooven takes you</p>
              <h2>Choose a place. We will hold the journey.</h2>
            </div>
            <p>
              Select a destination to discover how Wooven helps you arrive,
              move and feel at ease while you are there.
            </p>
          </div>

          <div className="destinations-page__explorer-layout">
            <div className="destinations-page__selector">
              {destinations.map((destination, index) => (
                <button
                  key={destination.name}
                  type="button"
                  onClick={() => setActiveDestination(index)}
                  className={
                    activeDestination === index
                      ? "destinations-page__selector-button destinations-page__selector-button--active"
                      : "destinations-page__selector-button"
                  }
                >
                  <span>0{index + 1}</span>
                  <strong>{destination.name}</strong>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>

            <article className="destinations-page__selected" key={selected.name}>
              <div className="destinations-page__selected-image">
                <img src={selected.image} alt={selected.name} />
                <div />
                <span>{selected.type}</span>
              </div>

              <div className="destinations-page__selected-copy">
                <p className="eyebrow">{selected.type}</p>
                <h3>{selected.name}, with Wooven.</h3>
                <p>{selected.description}</p>

                <div className="destinations-page__selected-services">
                  {selected.services.map((service) => (
                    <span key={service}>
                      <Check size={15} />
                      {service}
                    </span>
                  ))}
                </div>

                <a href="#plan" className="text-link">
                  Plan this journey <ArrowUpRight size={17} />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="destinations-page__coverage section">
        <div className="site-container destinations-page__coverage-grid">
          <div>
            <p className="eyebrow eyebrow--gold">Coverage that keeps growing</p>
            <h2>
              Kenya is our home.
              <em> The road is always opening.</em>
            </h2>
            <p>
              Wooven currently connects clients across major towns and tourism
              destinations, with additional locations available upon request.
            </p>
          </div>

          <div className="destinations-page__coverage-list">
            {coverage.map((place, index) => (
              <span key={place}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {place}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="plan" className="destinations-page__cta section">
        <div className="site-container destinations-page__cta-card">
          <Compass size={35} />
          <p className="eyebrow">A journey made for you</p>
          <h2>Going somewhere not listed?</h2>
          <p>
            Share your plans with us. Wooven can coordinate a journey that fits
            the way you want to travel.
          </p>
          <a className="button button--gold button--large" href="#contact">
            Speak to our concierge <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default DestinationsPage;