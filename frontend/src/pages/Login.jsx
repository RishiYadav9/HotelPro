import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, KeyRound, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await signIn(form);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/operations");
      else navigate("/rooms");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    setBusy(true);
    try {
      const user = await signIn({ email, password });
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/operations");
      else navigate("/rooms");
    } catch (err) {
      toast.error(err.response?.data?.message || "Demo login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout">
      {/* Decorative Brand Showcase Side */}
      <div className="auth-art">
        <div className="auth-art-copy">
          <div className="section-kicker light">WELCOME TO HOTELPRO</div>
          <h2>
            Arrive as you are.<br />
            <em>Leave refreshed.</em>
          </h2>
          <p>
            Experience considered hospitality, curated suites, and seamless reservation management.
          </p>
        </div>
        <div className="auth-art-bottom">THOUGHTFUL STAYS · EFFORTLESS MANAGEMENT</div>
      </div>

      {/* Auth Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          {/* Quick Demo Login Assistant */}
          <div className="demo-login-box">
            <div className="demo-header">
              <Sparkles size={16} />
              <span>Instant Demo Accounts (1-Click Login)</span>
            </div>
            <div className="demo-buttons-row">
              <button
                type="button"
                className="demo-btn demo-admin"
                onClick={() => handleQuickDemoLogin("admin@hotelpro.demo", "Admin123!")}
                disabled={busy}
              >
                <strong>Admin</strong>
                <small>Full Dashboard</small>
              </button>

              <button
                type="button"
                className="demo-btn demo-staff"
                onClick={() => handleQuickDemoLogin("staff@hotelpro.demo", "Staff123!")}
                disabled={busy}
              >
                <strong>Staff</strong>
                <small>Front Desk Ops</small>
              </button>

              <button
                type="button"
                className="demo-btn demo-guest"
                onClick={() => handleQuickDemoLogin("guest@hotelpro.demo", "Guest123!")}
                disabled={busy}
              >
                <strong>Guest</strong>
                <small>Bookings & Reviews</small>
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="section-kicker">SIGN IN TO YOUR ACCOUNT</div>
            <h1>Welcome back.</h1>
            <p className="muted">Enter your registered credentials to access your portal.</p>

            <label>
              Email Address
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                required
                placeholder="Your secret password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <button type="submit" className="btn btn-dark auth-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In to Portal"} <ArrowUpRight size={16} />
            </button>

            <p className="auth-switch">
              New to HotelPro? <Link to="/register">Create an account</Link>
            </p>

            <div className="secure-note">
              <ShieldCheck size={16} /> Industry-standard encrypted credentials
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
