import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Star, ArrowUpRight, Bed, Eye } from "lucide-react";
import { formatMoney } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function RoomCard({ room, index = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReserve = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info("Please sign in to make a reservation.");
      navigate("/login");
      return;
    }
    navigate(`/book/${room._id}`);
  };

  return (
    <article className="room-card" onClick={() => navigate(`/rooms/${room._id}`)}>
      <div className="room-image-wrap">
        {room.imageUrl ? (
          <img
            src={room.imageUrl}
            alt={room.name}
            className="room-img-tag"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`room-image-fallback room-palette-${index % 4}`}
          style={{ display: room.imageUrl ? "none" : "flex" }}
        >
          <div className="image-ornament">
            <Bed size={46} />
          </div>
        </div>

        <span className="room-category">{room.category}</span>
        <span className="room-number">ROOM {room.number}</span>

        {room.rating && (
          <span className="room-rating-badge">
            <Star size={13} fill="#d4af37" color="#d4af37" />
            <strong>{room.rating.toFixed(1)}</strong>
            <small>({room.numReviews || 0})</small>
          </span>
        )}
      </div>

      <div className="room-info">
        <div className="room-title-row">
          <h3>{room.name}</h3>
          <div className="room-specs-mini">
            <span className="capacity">
              <Users size={14} /> {room.capacity}
            </span>
          </div>
        </div>

        <p className="room-desc-short">
          {room.description || "A tranquil haven designed with refined finishes and considered comforts."}
        </p>

        <div className="room-amenities-tags">
          {(room.amenities?.length ? room.amenities.slice(0, 3) : ["High-speed Wi-Fi", "Air Conditioning", "HD Smart TV"]).map((amenity) => (
            <span key={amenity} className="amenity-tag">
              {amenity}
            </span>
          ))}
          {room.amenities?.length > 3 && (
            <span className="amenity-more">+{room.amenities.length - 3} more</span>
          )}
        </div>

        <div className="room-bottom">
          <div className="price-tag">
            <strong>{formatMoney(room.pricePerNight)}</strong>
            <small> / night</small>
          </div>

          <div className="card-actions">
            <Link
              to={`/rooms/${room._id}`}
              className="btn btn-outline btn-small view-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye size={14} /> Details
            </Link>
            <button
              className="btn btn-dark btn-small reserve-btn"
              onClick={handleReserve}
            >
              Reserve <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
