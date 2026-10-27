import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BedDouble, Menu, X, LogOut, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="nav-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <BedDouble size={20} />
          </span>
          <span>
            hotel<span className="brand-light">pro</span>
            <small>STAY BEAUTIFULLY</small>
          </span>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={open ? "nav open" : "nav"}>
          <Link
            to="/rooms"
            className={isActive("/rooms") ? "nav-link active" : "nav-link"}
          >
            Explore Rooms
          </Link>

          {user?.role === "guest" && (
            <Link
              to="/my-bookings"
              className={isActive("/my-bookings") ? "nav-link active" : "nav-link"}
            >
              My Bookings
            </Link>
          )}

          {(user?.role === "staff" || user?.role === "admin") && (
            <Link
              to="/operations"
              className={isActive("/operations") ? "nav-link active" : "nav-link"}
            >
              Operations
            </Link>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className={isActive("/admin") ? "nav-link active" : "nav-link"}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/rooms"
                className={isActive("/admin/rooms") ? "nav-link active" : "nav-link"}
              >
                Inventory
              </Link>
              <Link
                to="/admin/users"
                className={isActive("/admin/users") ? "nav-link active" : "nav-link"}
              >
                Users
              </Link>
            </>
          )}

          {user ? (
            <div className="nav-user-area">
              <span className="user-chip">
                <span className="user-avatar">{user.name[0]?.toUpperCase()}</span>
                <span className="user-name">{user.name.split(" ")[0]}</span>
                <span className={`role-badge role-${user.role}`}>{user.role}</span>
              </span>
              <button
                className="btn btn-outline btn-small"
                onClick={signOut}
                title="Sign out of your account"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <div className="nav-auth-area">
              <Link to="/login" className="nav-login">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-dark btn-small">
                Get started <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
