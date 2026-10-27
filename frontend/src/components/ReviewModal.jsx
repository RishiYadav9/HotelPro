import React, { useState } from "react";
import { X, Star, MessageSquareQuote } from "lucide-react";
import api from "../api";
import { toast } from "react-toastify";

export default function ReviewModal({ room, booking, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      return toast.error("Please fill in both a review title and your feedback.");
    }

    setSubmitting(true);
    try {
      const roomId = room?._id || booking?.room?._id || booking?.room;
      const { data } = await api.post(`/rooms/${roomId}/reviews`, {
        rating,
        title,
        comment,
        bookingId: booking?._id
      });
      toast.success(data.message || "Thank you for your feedback!");
      if (onReviewAdded) onReviewAdded(data.review);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const roomName = room?.name || booking?.room?.name || "your stay";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-kicker">GUEST EXPERIENCE</div>
            <h3>Share Your Stay Review</h3>
            <p className="muted">How was your time at {roomName}?</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="star-picker-wrap">
            <span className="picker-label">Your Rating</span>
            <div className="star-buttons">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? "#d4af37" : "none"}
                    color={(hoverRating || rating) >= star ? "#d4af37" : "#c5c0b6"}
                  />
                </button>
              ))}
            </div>
            <span className="rating-text-hint">
              {rating === 5 && "Flawless & exceptional"}
              {rating === 4 && "Very pleasant stay"}
              {rating === 3 && "Good stay, minor notes"}
              {rating === 2 && "Could have been better"}
              {rating === 1 && "Disappointing"}
            </span>
          </div>

          <label>
            Review Title
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Unforgettable comfort and beautiful views"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            Detailed Experience
            <textarea
              rows="4"
              required
              maxLength={1000}
              placeholder="Tell other travelers about the room quality, amenities, breakfast, or hospitality…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={submitting}>
              {submitting ? "Posting review…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
