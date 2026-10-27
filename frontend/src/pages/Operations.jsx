import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, CheckCircle2, LogOut, ArrowRight, BedDouble, Sparkles, Wrench, Receipt } from "lucide-react";
import api from "../api";
import { formatMoney, formatDate } from "../utils/formatters";
import InvoiceModal from "../components/InvoiceModal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function Operations() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([
        api.get("/bookings", { params: { status: statusFilter, search } }),
        api.get("/rooms")
      ]);
      setBookings(bRes.data.bookings || []);
      setRooms(rRes.data.rooms || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load operations data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, { status: newStatus });
      toast.success(data.message || `Booking marked as ${newStatus.replace("_", " ")}.`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleRoomStatusToggle = async (roomId, currentStatus) => {
    const nextStatus = currentStatus === "available" ? "cleaning" : currentStatus === "cleaning" ? "available" : "available";
    try {
      const { data } = await api.patch(`/rooms/${roomId}/status`, { status: nextStatus });
      toast.success(data.message || "Room status updated.");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update room status.");
    }
  };

  // KPIs
  const checkedInCount = bookings.filter((b) => b.status === "checked_in").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingPaymentsCount = bookings.filter((b) => b.paymentStatus === "pending" && b.status !== "cancelled").length;

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">FRONT DESK & OPERATIONS</div>
          <h1>
            Hotel <em>Operations</em>
          </h1>
          <p>Real-time guest arrivals, room check-in / check-out management, and housekeeping status.</p>
        </div>
        <span className="heading-count">
          <ShieldCheck size={16} /> Staff & Admin Console
        </span>
      </div>

      {/* KPI Stats Strip */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-icon">
            <CheckCircle2 size={18} />
          </span>
          <span className="metric-label">In-House Guests</span>
          <strong>{checkedInCount}</strong>
          <small>Currently Checked In</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <ArrowRight size={18} />
          </span>
          <span className="metric-label">Confirmed Arrivals</span>
          <strong>{confirmedCount}</strong>
          <small>Upcoming Check-ins</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <BedDouble size={18} />
          </span>
          <span className="metric-label">Active Rooms</span>
          <strong>{rooms.length}</strong>
          <small>Listed Suites</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <Receipt size={18} />
          </span>
          <span className="metric-label">Desk Payments Due</span>
          <strong>{pendingPaymentsCount}</strong>
          <small>Pending Collections</small>
        </div>
      </div>

      {/* Housekeeping & Room Status Board */}
      <section className="admin-section housekeeping-section">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">REAL-TIME INVENTORY STATUS</div>
            <h2>Room Housekeeping & Availability Board</h2>
          </div>
          <span className="text-muted">{rooms.length} Suites Under Management</span>
        </div>

        <div className="housekeeping-grid">
          {rooms.map((r) => (
            <div key={r._id} className={`hk-card hk-${r.status || "available"}`}>
              <div className="hk-card-header">
                <strong>Room #{r.number}</strong>
                <span className={`status-dot dot-${r.status || "available"}`} />
              </div>
              <div className="hk-name">{r.name}</div>
              <div className="hk-cat">{r.category} · Up to {r.capacity} Guests</div>

              <div className="hk-actions">
                <span className={`status status-${r.status || "available"}`}>
                  {r.status || "available"}
                </span>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => handleRoomStatusToggle(r._id, r.status)}
                  title="Toggle cleaning / available status"
                >
                  {r.status === "cleaning" ? "Mark Ready" : r.status === "available" ? "Mark Clean" : "Set Ready"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guest Reservations Management */}
      <section className="admin-section">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">GUEST RESERVATIONS</div>
            <h2>Arrivals & Departure Roster</h2>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="ops-filter-bar">
          <form className="ops-search-form" onSubmit={handleSearchSubmit}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by guest name, room number, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-small btn-dark">
              Filter
            </button>
          </form>

          <div className="ops-tabs">
            {["all", "confirmed", "checked_in", "checked_out", "cancelled"].map((st) => (
              <button
                key={st}
                className={`ops-tab ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "all" ? "All Bookings" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Updating reservations table…</div>
        ) : bookings.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Guest Details</th>
                  <th>Suite</th>
                  <th>Stay Dates</th>
                  <th>Charges & Payment</th>
                  <th>Status</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.user?.name || "Guest"}</strong>
                      <small>{b.user?.email}</small>
                      {b.user?.phone && <small>Ph: {b.user.phone}</small>}
                    </td>
                    <td>
                      <strong>{b.room?.name || "Room"}</strong>
                      <small>Room #{b.room?.number} ({b.room?.category})</small>
                    </td>
                    <td>
                      <strong>{formatDate(b.checkIn)}</strong>
                      <small>to {formatDate(b.checkOut)}</small>
                    </td>
                    <td>
                      <strong>{formatMoney(b.totalAmount)}</strong>
                      <span className={`payment-pill payment-${b.paymentStatus}`}>
                        {b.paymentStatus} · {b.paymentMethod || "Desk"}
                      </span>
                    </td>
                    <td>
                      <span className={`status status-${b.status}`}>
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {b.status === "confirmed" && (
                          <button
                            className="btn btn-small btn-dark"
                            onClick={() => handleUpdateStatus(b._id, "checked_in")}
                          >
                            Check In
                          </button>
                        )}
                        {b.status === "checked_in" && (
                          <button
                            className="btn btn-small btn-outline"
                            onClick={() => handleUpdateStatus(b._id, "checked_out")}
                          >
                            Check Out
                          </button>
                        )}
                        <button
                          className="btn btn-small btn-outline"
                          onClick={() => setSelectedInvoice(b)}
                          title="View Guest Invoice"
                        >
                          <Receipt size={13} /> Folio
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <BedDouble size={36} />
            <h3>No reservations matching criteria</h3>
            <p>Try clearing your search query or switching status tabs.</p>
          </div>
        )}
      </section>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      <Footer />
    </main>
  );
}
