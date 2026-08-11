import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminLogin } from "../../lib/api";
import logo from "../../assets/Logo.png";
import visual from "../../assets/Support Image.png";
import "../../styles/global.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await adminLogin(form);
      setSession(response.user, response.accessToken);
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "We could not sign you in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <aside className="admin-login__visual">
        <img src={visual} alt="" />
        <div className="admin-login__shade" />

        <Link to="/" className="admin-login__back">← Back to Wooven</Link>

        <div className="admin-login__story">
          <span>WOOVEN KENYA · OPERATIONS</span>
          <h1>Every great journey begins with a considered detail.</h1>
          <p>
            One private space to coordinate bookings, support guests and deliver
            exceptional service across Kenya.
          </p>
        </div>

        <div className="admin-login__trust">
          <ShieldCheck size={18} />
          Secure access for authorised Wooven team members
        </div>
      </aside>

      <section className="admin-login__panel">
        <div className="admin-login__form-wrap">
          <Link to="/" className="admin-login__brand">
            <img src={logo} alt="Wooven Kenya" />
          </Link>

          <header>
            <p>ADMIN PORTAL</p>
            <h2>Welcome back.</h2>
            <span>Sign in to manage today’s Wooven operations.</span>
          </header>

          {error && <div className="admin-login__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>
              Work email
              <div>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="name@wooven.co.ke"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              Password
              <div>
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label="Show or hide password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button className="admin-login__submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Enter Admin Portal"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="admin-login__note">
            Access is monitored and restricted to authorised Wooven staff.
          </p>
        </div>
      </section>
    </main>
  );
}