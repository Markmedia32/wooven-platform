import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import logo from "../../assets/Logo.png";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Services", "#services"],
      ["The Wooven experience", "#journey"],
      ["Destinations", "#destinations"],
      ["Trust & safety", "#safety"],
    ],
  },
  {
    title: "For travellers",
    links: [
      ["Plan a journey", "#booking"],
      ["Corporate travel", "#contact"],
      ["Travel partners", "#contact"],
      ["Frequently asked questions", "#contact"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Wooven", "#top"],
      ["Become a vehicle partner", "#contact"],
      ["Careers", "#contact"],
      ["Contact the concierge", "#contact"],
    ],
  },
];

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="site-container footer__top">
        <div className="footer__identity">
          <div className="footer__logo-shell">
            <img src={logo} alt="Wooven Kenya" />
          </div>

          <p>
            Personal driver and travel concierge services for guests who want
            Kenya to feel considered, connected and completely effortless.
          </p>

          <a className="footer__contact-link" href="#booking">
            <Mail size={17} />
            Speak with the concierge team
            <ArrowUpRight size={15} />
          </a>

          <span className="footer__location">
            <MapPin size={17} />
            Nairobi, Kenya
          </span>
        </div>

        <div className="footer__links">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>

              <ul>
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="site-container footer__newsletter">
        <div>
          <p className="eyebrow eyebrow--gold">Travel notes from Wooven</p>
          <h2>Stay close to the Kenya you want to experience.</h2>
        </div>

        <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="footer-email">
            Your email address
          </label>

          <input id="footer-email" type="email" placeholder="Your email address" required />

          <button type="submit" aria-label="Subscribe to updates">
            <ArrowUpRight size={19} />
          </button>
        </form>
      </div>

      <div className="site-container footer__bottom">
        <p>© {new Date().getFullYear()} Wooven Kenya Concierge Ltd.</p>

        <div className="footer__socials" aria-label="Social media">
          <a href="#top" aria-label="Instagram">IG</a>
          <a href="#top" aria-label="LinkedIn">IN</a>
          <a href="#top" aria-label="Facebook">FB</a>
        </div>

        <div className="footer__legal">
          <a href="#top">Privacy</a>
          <a href="#top">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;