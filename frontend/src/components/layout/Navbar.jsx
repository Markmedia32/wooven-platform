import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import logo from "../../assets/Logo.png";

const navLinks = [
  { label: "About Wooven", href: "/AboutPage" },
  { label: "Services", href: "/ServicesPage" },
  { label: "The experience", href: "/ExperiencePage" },
  { label: "Destinations", href: "/DestinationsPage" },
  { label: "Contact", href: "/ContactPage" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  return (
    <header className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}>
      
      {/* =====================================================
          DESKTOP / MAIN NAVBAR
          ===================================================== */}

      <div className="navbar__inner site-container">

        {/* Logo */}
        <a
          className="brand"
          href="/"
          onClick={closeMenu}
          aria-label="Wooven Kenya home"
        >
          <span className="brand__logo-shell">
            <img src={logo} alt="Wooven Kenya" />
          </span>
        </a>


        {/* Desktop Navigation Links */}
        <nav
          className="navbar__links"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>


        {/* Desktop Actions */}
        <div className="navbar__actions">

          {/* Staff Login */}
          <a
            className="navbar__login"
            href="/admin/login"
          >
            Staff login
          </a>


          {/* Book A Journey */}
          <a
            className="button button--gold button--nav"
            href="/LoginPage"
          >
            Book A Journey
            <ArrowUpRight size={16} />
          </a>

        </div>


        {/* Mobile Menu Button */}
        <button
          className="menu-button"
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>


      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      <div
        className={`mobile-menu ${
          isMenuOpen ? "mobile-menu--open" : ""
        }`}
      >
        <div className="mobile-menu__inner">

          {/* Mobile Menu Heading */}
          <p>Explore Wooven</p>


          {/* Mobile Navigation Links */}
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              style={{
                transitionDelay: `${index * 60}ms`,
              }}
            >
              <span>
                0{index + 1}
              </span>

              {link.label}

              <ArrowUpRight size={19} />
            </a>
          ))}


          {/* =================================================
              MOBILE ACTIONS
              ================================================= */}

          <div className="mobile-menu__actions">

            {/* Staff Login */}
            <a
              className="mobile-menu__login"
              href="/admin/login"
              onClick={closeMenu}
            >
              <span>Staff login</span>

              <ArrowUpRight size={18} />
            </a>


            {/* Book A Journey */}
            <a
              className="button button--gold mobile-menu__button"
              href="/LoginPage"
              onClick={closeMenu}
            >
              <span>Book A Journey</span>

              <ArrowUpRight size={18} />
            </a>

          </div>

        </div>
      </div>

    </header>
  );
}

export default Navbar;