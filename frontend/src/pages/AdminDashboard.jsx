import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, BedDouble, CalendarDays, ChartNoAxesCombined, CheckCircle2, ArrowUpRight, Plus, ShieldCheck, TrendingUp, Layers } from "lucide-react";
import api from "../api";
import { formatMoney, formatDate } from "../utils/formatters";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/overview")
      .then((res) => setData(res.data))
      .catch((err) => toast.error("Could not load administrative overview."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Compiling real-time administrative analytics…</div>;
  }

  const statuses = data?.statuses || {};
  const categories = data?.categoryCounts || {};

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">EXECUTIVE MANAGEMENT CONSOLE</div>
          <h1>
            Admin <em>Dashboard</em>
          </h1>
          <p>Key hospitality performance indicators, revenue health, and real-time operations.</p>
        </div>
        <div className="heading-actions-bar">
          <Link to="/admin/rooms" className="btn btn-dark">
            <Plus size={16} /> Manage Suites
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <Users size={16} /> Accounts
          </Link>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-icon">
            <ChartNoAxesCombined size={19} />
          </span>
          <span className="metric-label">Paid Revenue</span>
          <strong>{formatMoney(data?.paidRevenue || 0)}</strong>
          <small>
            <TrendingUp size={12} /> Confirmed Collections
          </small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <Layers size={19} />
          </span>
          <span className="metric-label">Occupancy Rate</span>
          <strong>{data?.occupancyRate || 0}%</strong>
          <small>
            <CheckCircle2 size={12} /> {data?.checkedInCount || 0} Rooms In-House
          </small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <CalendarDays size={19} />
          </span>
          <span className="metric-label">Total Bookings</span>
          <strong>{data?.bookings || 0}</strong>
          <small>All-time reservations</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <Users size={19} />
          </span>
          <span className="metric-label">Registered Users</span>
          <strong>{data?.users || 0}</strong>
          <small>Across Guest & Staff</small>
        </div>
      </div>

      {/* Operational Breakdown Visuals */}
      <div className="admin-analytics-row">
        {/* Reservation Status Distribution */}
        <div className="analytics-card">
          <div className="analytics-header">
            <h3>Reservation Status Distribution</h3>
            <span className="badge-total">{data?.bookings || 0} Total</span>
          </div>

          <div className="status-bars-list">
            <div className="status-bar-item">
              <div className="bar-labels">
                <span>Confirmed (Upcoming)</span>
                <strong>{statuses.confirmed || 0}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-confirmed"
                  style={{ width: `${((statuses.confirmed || 0) / (data?.bookings || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="status-bar-item">
              <div className="bar-labels">
                <span>Currently In-House (Checked In)</span>
                <strong>{statuses.checked_in || 0}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-checked-in"
                  style={{ width: `${((statuses.checked_in || 0) / (data?.bookings || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="status-bar-item">
              <div className="bar-labels">
                <span>Completed Stays (Checked Out)</span>
                <strong>{statuses.checked_out || 0}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-checked-out"
                  style={{ width: `${((statuses.checked_out || 0) / (data?.bookings || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="status-bar-item">
              <div className="bar-labels">
                <span>Cancelled Reservations</span>
                <strong>{statuses.cancelled || 0}</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-cancelled"
                  style={{ width: `${((statuses.cancelled || 0) / (data?.bookings || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="analytics-card">
          <div className="analytics-header">
            <h3>Suites Inventory Mix</h3>
            <span className="badge-total">{data?.rooms || 0} Suites</span>
          </div>

          <div className="category-chips-list">
            {Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="category-stat-pill">
                <div className="cat-pill-header">
                  <span className="room-category">{cat}</span>
                  <strong>{count} {count === 1 ? "Suite" : "Suites"}</strong>
                </div>
                <div className="cat-pill-bar">
                  <div
                    className="cat-fill"
                    style={{ width: `${(count / (data?.rooms || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Activity Feed */}
      <section className="admin-section">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">LIVE ACTIVITY</div>
            <h2>Recent Hotel Bookings</h2>
          </div>
          <Link to="/operations" className="btn btn-outline btn-small">
            View All in Operations <ArrowUpRight size={14} />
          </Link>
        </div>

        {data?.recentBookings?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.user?.name || "Guest"}</strong>
                      <small>{b.user?.email}</small>
                    </td>
                    <td>
                      <strong>{b.room?.name || "Suite"}</strong>
                      <small>Room #{b.room?.number}</small>
                    </td>
                    <td>
                      <strong>{formatDate(b.checkIn)}</strong>
                      <small>to {formatDate(b.checkOut)}</small>
                    </td>
                    <td>{formatMoney(b.totalAmount)}</td>
                    <td>
                      <span className={`status status-${b.status}`}>
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-pill payment-${b.paymentStatus}`}>
                        {b.paymentStatus} · {b.paymentMethod || "Desk"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent bookings recorded.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
