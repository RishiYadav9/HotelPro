import React from "react";
import { Link } from "react-router-dom";
import { BedDouble, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-main">
        <div className="footer-col brand-col">
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">
              <BedDouble size={18} />
            </span>
            <span>
              hotel<span className="brand-light">pro</span>
            </span>
          </Link>
          <p className="footer-desc">
            A boutique hospitality management ecosystem crafted for modern travelers, hoteliers, and front-desk teams.
          </p>
          <div className="footer-trust">
            <ShieldCheck size={16} /> Certified Hospitality Management
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <Link to="/">Home Overview</Link>
          <Link to="/rooms">Suites & Rooms</Link>
          <Link to="/login">Account Portal</Link>
          <Link to="/register">Join Privilege Club</Link>
        </div>

        <div className="footer-col">
          <h4>Hotel Experience</h4>
          <span>24/7 In-Room Dining</span>
          <span>Wellness & Hydrotherapy Spa</span>
          <span>Valet & Airport Chauffeur</span>
          <span>Executive Business Lounge</span>
        </div>

        <div className="footer-col">
          <h4>Contact & Concierge</h4>
          <p className="contact-item">
            <MapPin size={14} /> 42 Grand Promenade, Central Avenue
          </p>
          <p className="contact-item">
            <Phone size={14} /> +91 (0) 22 4500 8800
          </p>
          <p className="contact-item">
            <Mail size={14} /> concierge@hotelpro.demo
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HotelPro Management System. All rights reserved.</span>
        <span>Crafted with MERN Fullstack Architecture.</span>
      </div>
    </footer>
  );
}
