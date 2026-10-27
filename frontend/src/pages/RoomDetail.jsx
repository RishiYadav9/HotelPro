import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BedDouble, ArrowLeft, Users, Star, Maximize2, Bed, Check, MessageSquareQuote, ArrowUpRight, ShieldCheck, Wifi, Coffee, Wind, Tv } from "lucide-react";
import api from "../api";
import { formatMoney, formatDate, calculateNights } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Booking calculator widget
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(({ data }) => {
        setRoom(data.room);
        setReviews(data.reviews || []);
      })
      .catch((err) => {
        toast.error("Could not load room details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const nights = calculateNights(checkIn, checkOut);
  const totalEstimated = nights > 0 ? nights * (room?.pricePerNight || 0) : 0;

  const handleBookNow = () => {
    if (!user) {
      toast.info("Please sign in to proceed with your reservation.");
      navigate("/login");
      return;
    }
    navigate(`/book/${room._id}${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ""}`);
  };

  if (loading) {
    return <div className="loading">Loading suite details…</div>;
  }

  if (!room) {
    return (
      <div className="empty-state">
        <BedDouble size={45} />
        <h3>Room Not Found</h3>
        <p>The room you are looking for does not exist or may have been unlisted.</p>
        <Link to="/rooms" className="btn btn-dark">
          Return to Rooms
        </Link>
      </div>
    );
  }

  return (
    <main className="page-shell room-detail-layout">
      <Link to="/rooms" className="back-link">
        <ArrowLeft size={16} /> Return to all rooms
      </Link>

      <div className="detail-hero-grid">
        {/* Gallery / Image showcase */}
        <div className="detail-gallery">
          <img
            src={room.imageUrl || "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"}
            alt={room.name}
            className="detail-main-img"
          />
          <div className="detail-badges">
            <span className="room-category">{room.category}</span>
            <span className="room-number">ROOM {room.number}</span>
          </div>
        </div>

        {/* Quick Booking Sticky Widget */}
        <div className="booking-sticky-widget">
          <div className="widget-price-header">
            <div>
              <span className="price-big">{formatMoney(room.pricePerNight)}</span>
              <small> / night</small>
            </div>
            {room.rating && (
              <span className="rating-pill">
                <Star size={14} fill="#d4af37" color="#d4af37" />
                <strong>{room.rating.toFixed(1)}</strong>
                <small>({reviews.length} reviews)</small>
              </span>
            )}
          </div>

          <div className="widget-dates-box">
            <label>
              <span>CHECK-IN</span>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>
            <label>
              <span>CHECK-OUT</span>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
          </div>

          {nights > 0 && (
            <div className="widget-calculation">
              <div className="calc-row">
                <span>
                  {formatMoney(room.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>{formatMoney(totalEstimated)}</span>
              </div>
              <div className="calc-row">
                <span>Estimated Taxes & Fees (12%)</span>
                <span>{formatMoney(Math.round(totalEstimated * 0.12))}</span>
              </div>
              <div className="calc-total">
                <strong>Estimated Total</strong>
                <strong>{formatMoney(Math.round(totalEstimated * 1.12))}</strong>
              </div>
            </div>
          )}

          <button className="btn btn-dark btn-full" onClick={handleBookNow}>
            Reserve This Suite <ArrowUpRight size={16} />
          </button>

          <p className="widget-guarantee">
            <ShieldCheck size={14} /> Instant confirmation · Flexible payment options
          </p>
        </div>
      </div>

      {/* Main Suite Information */}
      <div className="detail-content-area">
        <div className="detail-primary">
          <div className="detail-title-block">
            <div className="section-kicker">ROOM #{room.number}</div>
            <h1>{room.name}</h1>
          </div>

          {/* Quick Specifications */}
          <div className="specs-strip">
            <div className="spec-item">
              <Users size={18} />
              <div>
                <small>Accommodates</small>
                <strong>Up to {room.capacity} Guests</strong>
              </div>
            </div>

            <div className="spec-item">
              <Bed size={18} />
              <div>
                <small>Bed Configuration</small>
                <strong>{room.bedType || "King Bed"}</strong>
              </div>
            </div>

            <div className="spec-item">
              <Maximize2 size={18} />
              <div>
                <small>Floor Space</small>
                <strong>{room.size || "350 sq ft"}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="detail-section">
            <h3>About This Suite</h3>
            <p className="detail-long-desc">
              {room.description || "Designed to be an oasis of relaxation and refined simplicity. Featuring premium linens, bespoke furniture, and a private en-suite bathroom."}
            </p>
          </section>

          {/* Amenities Grid */}
          <section className="detail-section">
            <h3>Included Amenities</h3>
            <div className="amenities-checklist">
              {(room.amenities || [
                "High-speed Wi-Fi",
                "Air Conditioning",
                "HD Smart TV",
                "Rain Shower",
                "Espresso Machine",
                "Complimentary Mineral Water"
              ]).map((amenity) => (
                <div key={amenity} className="amenity-check-item">
                  <span className="check-bullet">
                    <Check size={14} />
                  </span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Guest Reviews Section */}
          <section className="detail-section reviews-section">
            <div className="section-title-row">
              <div>
                <div className="section-kicker">VERIFIED EXPERIENCES</div>
                <h3>Guest Reviews ({reviews.length})</h3>
              </div>
              {user && (
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => setShowReviewModal(true)}
                >
                  <MessageSquareQuote size={15} /> Write a Review
                </button>
              )}
            </div>

            {reviews.length ? (
              <div className="reviews-list">
                {reviews.map((rev) => (
                  <div key={rev._id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <strong>{rev.user?.name || "Verified Traveler"}</strong>
                        <small>{formatDate(rev.createdAt)}</small>
                      </div>
                      <div className="review-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? "#d4af37" : "none"}
                            color={i < rev.rating ? "#d4af37" : "#d8d3c9"}
                          />
                        ))}
                      </div>
                    </div>
                    <h4>{rev.title}</h4>
                    <p>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews-box">
                <p>No reviews yet for this room. Be the first guest to share your experience!</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          room={room}
          onClose={() => setShowReviewModal(false)}
          onReviewAdded={(newRev) => setReviews([newRev, ...reviews])}
        />
      )}

      <Footer />
    </main>
  );
}
