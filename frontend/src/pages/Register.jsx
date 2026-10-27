import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }

    setBusy(true);
    try {
      await register(form);
      navigate("/rooms");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout">
      {/* Decorative Brand Side */}
      <div className="auth-art">
        <div className="auth-art-copy">
          <div className="section-kicker light">JOIN HOTELPRO PRIVILEGE</div>
          <h2>
            Make yourself<br />
            <em>at home.</em>
          </h2>
          <p>
            Create your guest account to reserve curated suites, manage booking folios, and enjoy exclusive member privileges.
          </p>

          <div className="register-perks">
            <div className="perk-item">
              <span className="perk-check"><Check size={14} /></span>
              <span>Instant booking confirmation with zero booking fees</span>
            </div>
            <div className="perk-item">
              <span className="perk-check"><Check size={14} /></span>
              <span>Complimentary late check-out on availability</span>
            </div>
            <div className="perk-item">
              <span className="perk-check"><Check size={14} /></span>
              <span>Online digital invoices & reservation receipts</span>
            </div>
          </div>
        </div>
        <div className="auth-art-bottom">THOUGHTFUL STAYS · MADE SIMPLE</div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="section-kicker">JOIN HOTELPRO</div>
          <h1>Create your account.</h1>
          <p className="muted">Enter your contact details to begin planning your stay.</p>

          <label>
            Full Name
            <input
              type="text"
              required
              minLength={2}
              placeholder="e.g. Priya Patel"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              required
              placeholder="priya@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Phone Number (Optional)
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <button type="submit" className="btn btn-dark auth-submit" disabled={busy}>
            {busy ? "Creating account…" : "Create Guest Account"} <ArrowUpRight size={16} />
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>

          <div className="secure-note">
            <ShieldCheck size={16} /> Your data is securely held and never shared.
          </div>
        </form>
      </div>
    </main>
  );
}
