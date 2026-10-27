import React, { useState } from "react";
import { X, CreditCard, QrCode, Building2, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { formatMoney } from "../utils/formatters";

export default function PaymentModal({ booking, totalAmount, onClose, onConfirm }) {
  const [method, setMethod] = useState("Credit Card");
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    name: "Aarav Sharma",
    number: "4532 •••• •••• 8892",
    expiry: "09/28",
    cvv: "•••"
  });
  const [upiId, setUpiId] = useState("guest@okaxis");

  const amount = totalAmount || booking?.totalAmount || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate authentic payment gateway processing delay
    setTimeout(() => {
      setProcessing(false);
      onConfirm(method);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-kicker">SECURE CHECKOUT</div>
            <h3>Complete Reservation Payment</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="payment-summary-band">
          <div>
            <span className="summary-label">Total Payable Amount</span>
            <strong className="summary-amount">{formatMoney(amount)}</strong>
          </div>
          <div className="summary-badge">
            <ShieldCheck size={16} /> 256-bit Encrypted
          </div>
        </div>

        <div className="payment-method-selector">
          <button
            type="button"
            className={`method-tab ${method === "Credit Card" ? "active" : ""}`}
            onClick={() => setMethod("Credit Card")}
          >
            <CreditCard size={18} />
            <span>Cards</span>
          </button>

          <button
            type="button"
            className={`method-tab ${method === "UPI" ? "active" : ""}`}
            onClick={() => setMethod("UPI")}
          >
            <QrCode size={18} />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            className={`method-tab ${method === "Pay at Hotel" ? "active" : ""}`}
            onClick={() => setMethod("Pay at Hotel")}
          >
            <Building2 size={18} />
            <span>Pay at Desk</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {method === "Credit Card" && (
            <div className="card-fields">
              <label>
                Cardholder Name
                <input
                  type="text"
                  required
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  placeholder="Name on card"
                />
              </label>

              <label>
                Card Number
                <input
                  type="text"
                  required
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  placeholder="16-digit card number"
                />
              </label>

              <div className="form-row-two">
                <label>
                  Expiry Date
                  <input
                    type="text"
                    required
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    placeholder="MM/YY"
                  />
                </label>
                <label>
                  CVV / CVC
                  <input
                    type="password"
                    maxLength="4"
                    required
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    placeholder="CVV"
                  />
                </label>
              </div>
            </div>
          )}

          {method === "UPI" && (
            <div className="upi-fields">
              <label>
                Virtual Payment Address (UPI ID)
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                />
              </label>
              <div className="upi-apps-row">
                <span>Google Pay</span>
                <span>PhonePe</span>
                <span>Paytm</span>
                <span>BHIM UPI</span>
              </div>
            </div>
          )}

          {method === "Pay at Hotel" && (
            <div className="pay-at-hotel-note">
              <p>
                You can complete your payment via cash, card, or UPI directly at the front desk upon check-in.
                Your room reservation will remain guaranteed.
              </p>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 size={16} className="spin" /> Processing…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Pay {formatMoney(amount)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
