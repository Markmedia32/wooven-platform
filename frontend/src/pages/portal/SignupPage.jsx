import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/Logo.png";
import welcomeImage from "../../assets/Hero.png";

function passwordScore(password) {
  const conditions = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  return conditions.filter(Boolean).length;
}

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordScore(form.password), [form.password]);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (strength < 3) {
      setError("Please use a stronger password with letters, numbers and 8+ characters.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the privacy terms to create your account.");
      return;
    }

    setSubmitting(true);

    try {
      await signup({ ...form, marketingOptIn });
      navigate("/portal/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "We could not create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-auth portal-auth--signup">
      <aside className="portal-auth__visual">
        <img src={welcomeImage} alt="" />
        <div className="portal-auth__overlay" />

        <Link className="portal-auth__back" to="/">
          <ChevronLeft size={17} />
          Back to Wooven
        </Link>

        <div className="portal-auth__visual-copy">
          <span className="portal-auth__eyebrow">
            <Sparkles size={14} />
            YOUR JOURNEY, PERSONALISED
          </span>

          <h2>
            Kenya, with
            <em> a familiar welcome.</em>
          </h2>

          <p>
            Create your private client profile for an easier way to plan,
            book and manage travel across Kenya.
          </p>
        </div>

        <div className="portal-auth__benefits">
          <span><Check size={14} /> Dedicated Host Driver matching</span>
          <span><Check size={14} /> Bookings and travel details in one place</span>
          <span><Check size={14} /> Concierge support when plans change</span>
        </div>
      </aside>

      <section className="portal-auth__form-side">
        <div className="portal-auth__form-shell">
          <Link className="portal-auth__brand" to="/">
            <img src={logo} alt="Wooven Kenya" />
          </Link>

          <header className="portal-auth__heading">
            <p className="portal-auth__label">CREATE YOUR ACCOUNT</p>
            <h1>Travel better, from here.</h1>
            <p>Set up your client profile in a moment. Your first journey can follow whenever you are ready.</p>
          </header>

          {error && <div className="portal-auth__alert">{error}</div>}

          <form className="portal-auth__form" onSubmit={handleSubmit}>
            <div className="portal-auth__two-columns">
              <label className="portal-auth__field">
                <span>First name</span>
                <div>
                  <UserRound size={18} />
                  <input
                    value={form.firstName}
                    onChange={updateField("firstName")}
                    placeholder="Jane"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </label>

              <label className="portal-auth__field">
                <span>Last name</span>
                <div>
                  <UserRound size={18} />
                  <input
                    value={form.lastName}
                    onChange={updateField("lastName")}
                    placeholder="Mwangi"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </label>
            </div>

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
              <span>Phone number</span>
              <div>
                <Phone size={18} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={updateField("phone")}
                  placeholder="+254 7XX XXX XXX"
                  autoComplete="tel"
                  required
                />
              </div>
            </label>

            <div className="portal-auth__two-columns">
              <label className="portal-auth__field">
                <span>Password</span>
                <div>
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={updateField("password")}
                    placeholder="Create password"
                    autoComplete="new-password"
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

              <label className="portal-auth__field">
                <span>Confirm password</span>
                <div>
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            </div>

            {form.password && (
              <div className="portal-auth__strength">
                <div>
                  <span>Password security</span>
                  <strong>{strengthLabel}</strong>
                </div>
                <i>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <b key={item} className={item <= strength ? "is-active" : ""} />
                  ))}
                </i>
              </div>
            )}

            <label className="portal-auth__check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                I agree to Wooven’s Privacy Policy and Terms of Service, and
                consent to the use of my details for travel coordination.
              </span>
            </label>

            <label className="portal-auth__check portal-auth__check--optional">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
              />
              <span>Send me occasional Wooven travel updates and offers.</span>
            </label>

            <button className="portal-auth__submit" disabled={submitting}>
              {submitting ? "Creating your account..." : "Create client account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="portal-auth__switch">
            Already have an account?
            <Link to="/portal/login">Sign in to your portal</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;