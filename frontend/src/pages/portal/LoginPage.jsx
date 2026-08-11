import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/Logo.png";
import journeyImage from "../../assets/Chauffer Carrying Luggage.png";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);

      if (!remember) {
        sessionStorage.setItem("wooven_short_session", "true");
      }

      navigate("/portal/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "We could not sign you in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-auth">
      <aside className="portal-auth__visual">
        <img src={journeyImage} alt="" />
        <div className="portal-auth__overlay" />

        <Link className="portal-auth__back" to="/">
          <ChevronLeft size={17} />
          Back to Wooven
        </Link>

        <div className="portal-auth__visual-copy">
          <span className="portal-auth__eyebrow">
            <Sparkles size={14} />
            THE PRIVATE CLIENT PORTAL
          </span>

          <h2>
            Your next journey,
            <em> already considered.</em>
          </h2>

          <p>
            Manage your bookings, save your travel preferences and stay
            connected to every Wooven journey in one calm, private space.
          </p>
        </div>

        <div className="portal-auth__visual-footer">
          <ShieldCheck size={19} />
          <span>Trusted personal driver and concierge support across Kenya.</span>
        </div>
      </aside>

      <section className="portal-auth__form-side">
        <div className="portal-auth__form-shell">
          <Link className="portal-auth__brand" to="/">
            <img src={logo} alt="Wooven Kenya" />
          </Link>

          <header className="portal-auth__heading">
            <p className="portal-auth__label">CLIENT PORTAL</p>
            <h1>Welcome back.</h1>
            <p>Sign in to continue planning, managing and enjoying your journeys.</p>
          </header>

          {error && <div className="portal-auth__alert">{error}</div>}

          <form className="portal-auth__form" onSubmit={handleSubmit}>
            <label className="portal-auth__field">
              <span>Email address</span>
              <div>
                <Mail size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="portal-auth__field">
              <span>Password</span>
              <div>
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="portal-auth__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Keep me signed in on this device</span>
            </label>

            <button className="portal-auth__submit" disabled={submitting}>
              {submitting ? "Signing you in..." : "Enter client portal"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="portal-auth__switch">
            New to Wooven?
            <Link to="/portal/signup">Create your client account</Link>
          </p>

          <p className="portal-auth__security">
            <ShieldCheck size={16} />
            Your details are protected and handled securely.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;