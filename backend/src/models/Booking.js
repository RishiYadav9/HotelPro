import mongoose from "mongoose";
import { isEmbedded } from "../config/db.js";
import { embeddedStore } from "../config/embeddedStore.js";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["confirmed", "cancelled", "checked_in", "checked_out"], default: "confirmed" },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "not_required"], default: "pending" },
  paymentMethod: { type: String, default: "Not specified" },
  transactionId: { type: String, default: "" },
  specialRequests: { type: String, default: "" }
}, { timestamps: true });

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });

const MongooseBooking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
const EmbeddedBooking = embeddedStore.createModel("bookings");

const Booking = new Proxy({}, {
  get(_target, prop) {
    const active = isEmbedded() ? EmbeddedBooking : MongooseBooking;
    const value = active[prop];
    return typeof value === "function" ? value.bind(active) : value;
  }
});

export default Booking;
