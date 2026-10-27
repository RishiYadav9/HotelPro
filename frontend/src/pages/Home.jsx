import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, BedDouble, CalendarDays, Star, Sparkles, Wifi, Coffee, Utensils, Waves, CheckCircle2 } from "lucide-react";
import RoomCard from "../components/RoomCard";
import Footer from "../components/Footer";
import api from "../api";

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/rooms")
      .then(({ data }) => {
        setFeaturedRooms(data.rooms?.slice(0, 3) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> BOUTIQUE HOSPITALITY AT ITS FINEST
          </div>
          <h1>
            Find your place<br />
            to <em>slow down.</em>
          </h1>
          <p className="hero-desc">
            Thoughtfully designed sanctuaries, effortless reservations, and subtle touches of luxury that turn any stay into an unforgettable memory.
          </p>

          <div className="hero-actions">
            <Link to="/rooms" className="btn btn-gold">
              Explore Stays <ArrowUpRight size={17} />
            </Link>
            <span className="trust">
              <ShieldCheck size={16} /> Best Rate Guarantee · Instant Confirmation
            </span>
          </div>

          <div className="hero-stats">
            <div>
              <strong>24/7</strong>
              <span>Dedicated Concierge</span>
            </div>
            <div>
              <strong>4.9<span className="star"> ★</span></strong>
              <span>Guest Experience</span>
            </div>
            <div>
              <strong>1,200+</strong>
              <span>Seamless Stays</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-photo">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              alt="HotelPro Luxury Experience"
              className="hero-main-img"
            />
            <div className="photo-label">
              <span>THE HOTELPRO COLLECTION</span>
              <strong>Quiet luxury, made personal.</strong>
            </div>
          </div>

          <div className="floating-card">
            <span className="float-icon">
              <Star size={18} fill="currentColor" />
            </span>
            <div>
              <strong>Signature Hospitality</strong>
              <small>Refined suites & suites</small>
            </div>
          </div>
          <div className="art-circle" />
        </div>

        <div className="hero-index">
          01 <span></span> 03
        </div>
      </section>

      {/* Featured Suites Showcase */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-head-split">
            <div>
              <div className="section-kicker">CURATED COLLECTION</div>
              <h2>Featured Suites & Stays</h2>
              <p className="muted">Handpicked rooms designed for unparalleled comfort and tranquility.</p>
            </div>
            <Link to="/rooms" className="btn btn-outline">
              View All Rooms <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="loading">Curating featured accommodations…</div>
          ) : (
            <div className="room-grid">
              {featuredRooms.map((room, idx) => (
                <RoomCard key={room._id} room={room} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The HotelPro Difference */}
      <section className="benefits">
        <div className="section-kicker">THE HOTELPRO STANDARD</div>
        <h2 className="section-center-heading">Every detail, meticulously considered.</h2>
        <div className="benefit-grid">
          <div>
            <span className="benefit-icon">
              <BedDouble size={22} />
            </span>
            <h3>Architectural Serenity</h3>
            <p>Spacious floorplans, acoustic insulation, and custom organic mattresses for deep rest.</p>
          </div>

          <div>
            <span className="benefit-icon">
              <CalendarDays size={22} />
            </span>
            <h3>Seamless Reservations</h3>
            <p>Real-time room availability, flexible booking schedules, and immediate verified invoices.</p>
          </div>

          <div>
            <span className="benefit-icon">
              <ShieldCheck size={22} />
            </span>
            <h3>Privileged Care</h3>
            <p>Round-the-clock front desk assistance, secure payment options, and luggage storage.</p>
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="amenities-spotlight">
        <div className="section-container">
          <div className="section-kicker">WORLD-CLASS AMENITIES</div>
          <h2>Everything you need for an inspiring stay</h2>

          <div className="amenities-cards-row">
            <div className="amenity-card">
              <Wifi className="amenity-ico" />
              <h4>Ultra-Fast Fiber Wi-Fi</h4>
              <p>Gigabit wireless throughout every suite, lounge, and courtyard.</p>
            </div>
            <div className="amenity-card">
              <Coffee className="amenity-ico" />
              <h4>Artisanal Coffee & Tea</h4>
              <p>In-room espresso machines and signature handpicked herbal blends.</p>
            </div>
            <div className="amenity-card">
              <Utensils className="amenity-ico" />
              <h4>Gourmet In-Room Dining</h4>
              <p>Farm-to-table seasonal breakfast and fine dining delivered to your suite.</p>
            </div>
            <div className="amenity-card">
              <Waves className="amenity-ico" />
              <h4>Heated Infinity Pool</h4>
              <p>Rooftop wellness deck overlooking the skyline with heated water.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Band */}
      <section className="cta-band">
        <div>
          <div className="section-kicker light">READY TO ESCAPE?</div>
          <h2>
            Good days begin<br />
            with a good stay.
          </h2>
        </div>
        <Link to="/rooms" className="btn btn-light">
          Find Your Sanctuary <ArrowUpRight size={17} />
        </Link>
      </section>

      <Footer />
    </>
  );
}
