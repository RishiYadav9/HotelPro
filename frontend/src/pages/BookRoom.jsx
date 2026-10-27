import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { BedDouble, ArrowLeft, ArrowUpRight, ShieldCheck, CheckCircle2, CreditCard, Building2 } from "lucide-react";
import api from "../api";
import { formatMoney, calculateNights } from "../utils/formatters";
import PaymentModal from "../components/PaymentModal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function BookRoom() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    checkIn: searchParams.get("checkIn") || todayStr,
    checkOut: searchParams.get("checkOut") || tomorrowStr,
    guests: 1,
    specialRequests: "",
    paymentMethod: "Pay at Hotel"
  });

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(({ data }) => setRoom(data.room))
      .catch(() => toast.error("Could not load room information."))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = calculateNights(form.checkIn, form.checkOut);
  const totalAmount = nights > 0 ? nights * (room?.pricePerNight || 0) : 0;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!nights || nights < 1) {
      return toast.error("Please select a check-out date after check-in.");
    }

    if (form.paymentMethod === "Pay Online (Card / UPI)") {
      setShowPaymentModal(true);
    } else {
      executeBooking("Pay at Hotel");
    }
  };

  const executeBooking = async (chosenPaymentMethod) => {
    setBusy(true);
    try {
      const payload = {
        roomId: id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        specialRequests: form.specialRequests,
        paymentMethod: chosenPaymentMethod
      };

      const { data } = await api.post("/bookings", payload);
      toast.success(data.message || "Reservation confirmed successfully!");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking reservation failed.");
    } finally {
      setBusy(false);
      setShowPaymentModal(false);
    }
  };

  if (loading) {
    return <div className="loading">Preparing reservation portal…</div>;
  }

  if (!room) {
    return (
      <div className="empty-state">
        <BedDouble size={40} />
        <h3>Room Not Found</h3>
        <Link to="/rooms" className="btn btn-dark">
          Explore Other Rooms
        </Link>
      </div>
    );
  }

  return (
    <main className="page-shell booking-layout">
      <div>
        <Link to={`/rooms/${id}`} className="back-link">
          <ArrowLeft size={15} /> Back to Room Details
        </Link>

        <div className="section-kicker">CONFIRM YOUR RESERVATION</div>
        <h1>
          Reserve your <em>stay.</em>
        </h1>
        <p className="muted">Review details, customize preferences, and confirm your accommodation.</p>

        {/* Selected Room Card Preview */}
        <div className="booking-room-card">
          <div className="booking-room-visual">
            {room.imageUrl ? (
              <img src={room.imageUrl} alt={room.name} className="booking-thumb-img" />
            ) : (
              <BedDouble size={45} />
            )}
          </div>
          <div className="booking-card-info">
            <span className="room-category inline-cat">{room.category}</span>
            <h3>{room.name}</h3>
            <p>
              Room #{room.number} · Up to {room.capacity} Guests · {room.bedType || "King Bed"}
            </p>
            <strong>
              {formatMoney(room.pricePerNight)} <small>/ night</small>
            </strong>
          </div>
        </div>
      </div>

      {/* Reservation Form */}
      <form className="booking-form" onSubmit={handleFormSubmit}>
        <h2>Stay Details</h2>

        <div className="form-row-two">
          <label>
            Check-in Date
            <input
              type="date"
              required
              min={todayStr}
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            />
          </label>

          <label>
            Check-out Date
            <input
              type="date"
              required
              min={form.checkIn || todayStr}
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            />
          </label>
        </div>

        <label>
          Number of Guests
          <select
            value={form.guests}
            onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
          >
            {Array.from({ length: room.capacity }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} {i === 0 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Payment Option
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            <option value="Pay at Hotel">Pay at Hotel Desk (Cash / Card at Check-in)</option>
            <option value="Pay Online (Card / UPI)">Pay Online Now (Card / UPI instant checkout)</option>
          </select>
        </label>

        <label>
          Special Requests (Optional)
          <textarea
            rows="3"
            placeholder="e.g. Early check-in, high floor preference, airport taxi transfer…"
            value={form.specialRequests}
            onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
          />
        </label>

        {/* Pricing Summary */}
        <div className="price-summary-box">
          <div className="summary-line">
            <span>
              {nights} night{nights !== 1 ? "s" : ""} × {formatMoney(room.pricePerNight)}
            </span>
            <span>{formatMoney(totalAmount)}</span>
          </div>
          <div className="summary-line">
            <span>Taxes & Service GST (Included)</span>
            <span>{formatMoney(0)}</span>
          </div>
          <div className="summary-total-line">
            <strong>Total Amount</strong>
            <strong className="total-highlight">{formatMoney(totalAmount)}</strong>
          </div>
        </div>

        <button type="submit" className="btn btn-dark auth-submit" disabled={busy}>
          {busy
            ? "Confirming Reservation…"
            : form.paymentMethod === "Pay Online (Card / UPI)"
            ? "Proceed to Payment →"
            : "Confirm Reservation"}
        </button>

        <div className="secure-note">
          <ShieldCheck size={15} /> Your reservation is backed by HotelPro Best Rate Guarantee.
        </div>
      </form>

      {showPaymentModal && (
        <PaymentModal
          totalAmount={totalAmount}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={(method) => executeBooking(method)}
        />
      )}

      <Footer />
    </main>
  );
}
