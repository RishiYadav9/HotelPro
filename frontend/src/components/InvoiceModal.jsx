import React from "react";
import { X, Printer, BedDouble, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatMoney, formatDate, calculateNights } from "../utils/formatters";

export default function InvoiceModal({ booking, onClose }) {
  if (!booking) return null;

  const room = booking.room || {};
  const user = booking.user || {};
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const baseRate = room.pricePerNight || Math.round(booking.totalAmount / (nights || 1));
  const subtotal = nights * baseRate;
  const gstAmount = Math.round(subtotal * 0.12);
  const invoiceNumber = `HP-INV-${booking._id ? String(booking._id).slice(-6).toUpperCase() : "001"}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-bar no-print">
          <button className="btn btn-dark btn-small" onClick={handlePrint}>
            <Printer size={15} /> Print / Save PDF
          </button>
          <button className="modal-close" onClick={onClose} aria-label="Close invoice">
            <X size={20} />
          </button>
        </div>

        <div className="printable-invoice">
          {/* Invoice Header */}
          <div className="inv-header">
            <div className="inv-brand">
              <div className="brand">
                <span className="brand-mark">
                  <BedDouble size={20} />
                </span>
                <span>
                  hotel<span className="brand-light">pro</span>
                </span>
              </div>
              <p className="inv-hotel-details">
                HotelPro Luxury Stays & Suites<br />
                42 Grand Promenade, Central Avenue<br />
                GSTIN: 27AAAAH1234F1Z5 | Ph: +91 22 4500 8800
              </p>
            </div>

            <div className="inv-meta">
              <h2>TAX INVOICE</h2>
              <div className="meta-line">
                <span>Invoice No:</span>
                <strong>{invoiceNumber}</strong>
              </div>
              <div className="meta-line">
                <span>Booking Ref:</span>
                <strong>#{String(booking._id).slice(-8).toUpperCase()}</strong>
              </div>
              <div className="meta-line">
                <span>Date of Issue:</span>
                <span>{formatDate(booking.createdAt || new Date())}</span>
              </div>
            </div>
          </div>

          <hr className="inv-divider" />

          {/* Guest and Stay Details */}
          <div className="inv-grid-two">
            <div className="inv-block">
              <span className="inv-subtitle">GUEST INFORMATION</span>
              <h4>{user.name || "Valued Guest"}</h4>
              <p>{user.email || "—"}</p>
              <p>{user.phone || "+91 (Contact on file)"}</p>
            </div>

            <div className="inv-block">
              <span className="inv-subtitle">RESERVATION SUMMARY</span>
              <h4>{room.name || "Hotel Room"} ({room.category || "Standard"})</h4>
              <p>Room #{room.number} · {booking.guests} Guest{booking.guests > 1 ? "s" : ""}</p>
              <p>
                <strong>Check-In:</strong> {formatDate(booking.checkIn)} (from 2:00 PM)
              </p>
              <p>
                <strong>Check-Out:</strong> {formatDate(booking.checkOut)} (until 11:00 AM)
              </p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Nights</th>
                <th style={{ textAlign: "right" }}>Rate / Night</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{room.name || "Room Stay"}</strong>
                  <small>Room {room.number} · {nights} Night{nights > 1 ? "s" : ""} Accommodation</small>
                </td>
                <td style={{ textAlign: "center" }}>{nights}</td>
                <td style={{ textAlign: "right" }}>{formatMoney(baseRate)}</td>
                <td style={{ textAlign: "right" }}>{formatMoney(subtotal)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Hospitality & Amenities Package</strong>
                  <small>Complimentary high-speed Wi-Fi, swimming pool access, concierge</small>
                </td>
                <td style={{ textAlign: "center" }}>—</td>
                <td style={{ textAlign: "right" }}>Included</td>
                <td style={{ textAlign: "right" }}>₹0</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: "right" }}>Subtotal:</td>
                <td style={{ textAlign: "right" }}>{formatMoney(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: "right" }}>Applicable GST (12%):</td>
                <td style={{ textAlign: "right" }}>{formatMoney(gstAmount)}</td>
              </tr>
              <tr className="grand-total-row">
                <td colSpan="3" style={{ textAlign: "right" }}>
                  <strong>Grand Total:</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>{formatMoney(booking.totalAmount || (subtotal + gstAmount))}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Payment Status & Details */}
          <div className="inv-payment-box">
            <div className="payment-status-badge-area">
              <span className="inv-subtitle">PAYMENT STATUS</span>
              <div className={`inv-status-pill status-${booking.paymentStatus}`}>
                {booking.paymentStatus === "paid" && <CheckCircle2 size={16} />}
                {booking.paymentStatus === "pending" && <Clock size={16} />}
                {booking.paymentStatus === "refunded" && <AlertCircle size={16} />}
                <span>{booking.paymentStatus?.toUpperCase()}</span>
              </div>
            </div>

            <div className="payment-meta-details">
              <div>
                <span>Payment Mode:</span>
                <strong>{booking.paymentMethod || "Pay at Hotel"}</strong>
              </div>
              {booking.transactionId && (
                <div>
                  <span>Transaction ID:</span>
                  <strong>{booking.transactionId}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="inv-footer">
            <p>Thank you for choosing HotelPro. We wish you an inspiring and memorable stay.</p>
            <small>This is a computer-generated tax invoice. No physical signature is required.</small>
          </div>
        </div>
      </div>
    </div>
  );
}
