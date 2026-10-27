import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, BedDouble, Receipt, CreditCard, MessageSquareQuote, XCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import api from "../api";
import { formatMoney, formatDate, calculateNights } from "../utils/formatters";
import InvoiceModal from "../components/InvoiceModal";
import PaymentModal from "../components/PaymentModal";
import ReviewModal from "../components/ReviewModal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      toast.success(data.message || "Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const handlePaymentSuccess = async (method) => {
    if (!payingBooking) return;
    try {
      const { data } = await api.post(`/bookings/${payingBooking._id}/pay`, {
        paymentMethod: method
      });
      toast.success(data.message || "Payment completed!");
      setPayingBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed.");
    }
  };

  const filtered = statusFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">GUEST PORTAL</div>
          <h1>
            My <em>Bookings</em>
          </h1>
          <p>Review current reservations, track stays, download invoices, or submit reviews.</p>
        </div>
        <Link to="/rooms" className="btn btn-dark">
          Book Another Room <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tab-bar">
        {[
          { key: "all", label: "All Reservations" },
          { key: "confirmed", label: "Confirmed" },
          { key: "checked_in", label: "Checked In" },
          { key: "checked_out", label: "Completed" },
          { key: "cancelled", label: "Cancelled" }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`status-tab-btn ${statusFilter === tab.key ? "active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Retrieving your reservation history…</div>
      ) : filtered.length ? (
        <div className="bookings-grid">
          {filtered.map((b) => {
            const nights = calculateNights(b.checkIn, b.checkOut);
            return (
              <article key={b._id} className="booking-card-item">
                <div className="booking-card-top">
                  <div className="booking-room-meta">
                    <span className="room-category">{b.room?.category || "Suite"}</span>
                    <h3>{b.room?.name || "Hotel Room"}</h3>
                    <p className="room-sub">
                      Room #{b.room?.number} · {b.guests} Guest{b.guests > 1 ? "s" : ""} · {nights} Night{nights > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="booking-status-tag">
                    <span className={`status status-${b.status}`}>
                      {b.status?.replace("_", " ")}
                    </span>
                    <span className={`payment-pill payment-${b.paymentStatus}`}>
                      {b.paymentStatus === "paid" && <CheckCircle2 size={12} />}
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="stay-dates-info">
                    <div>
                      <small>CHECK-IN</small>
                      <strong>{formatDate(b.checkIn)}</strong>
                    </div>
                    <div className="date-arrow">→</div>
                    <div>
                      <small>CHECK-OUT</small>
                      <strong>{formatDate(b.checkOut)}</strong>
                    </div>
                  </div>

                  <div className="booking-total-box">
                    <small>TOTAL AMOUNT</small>
                    <strong>{formatMoney(b.totalAmount)}</strong>
                  </div>
                </div>

                {b.specialRequests && (
                  <p className="booking-notes">
                    <strong>Special Requests:</strong> {b.specialRequests}
                  </p>
                )}

                <div className="booking-card-actions">
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => setSelectedInvoice(b)}
                  >
                    <Receipt size={14} /> Tax Invoice
                  </button>

                  {b.paymentStatus === "pending" && b.status !== "cancelled" && (
                    <button
                      className="btn btn-gold btn-small"
                      onClick={() => setPayingBooking(b)}
                    >
                      <CreditCard size={14} /> Pay Now
                    </button>
                  )}

                  {b.status === "checked_out" && (
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => setReviewBooking(b)}
                    >
                      <MessageSquareQuote size={14} /> Leave Review
                    </button>
                  )}

                  {b.status === "confirmed" && (
                    <button
                      className="text-button danger"
                      onClick={() => handleCancel(b._id)}
                    >
                      Cancel Stay
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarDays size={42} />
          <h3>No reservations found</h3>
          <p>
            {statusFilter === "all"
              ? "You haven't made any hotel reservations yet."
              : `You have no ${statusFilter.replace("_", " ")} bookings.`}
          </p>
          <Link to="/rooms" className="btn btn-dark">
            Find Your Next Stay
          </Link>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Payment Modal */}
      {payingBooking && (
        <PaymentModal
          booking={payingBooking}
          totalAmount={payingBooking.totalAmount}
          onClose={() => setPayingBooking(null)}
          onConfirm={handlePaymentSuccess}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          room={reviewBooking.room}
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}

      <Footer />
    </main>
  );
}
