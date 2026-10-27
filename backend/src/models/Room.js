import mongoose from "mongoose";
import { isEmbedded } from "../config/db.js";
import { embeddedStore } from "../config/embeddedStore.js";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  number: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ["Standard", "Deluxe", "Suite", "Family"], default: "Standard" },
  description: { type: String, default: "" },
  pricePerNight: { type: Number, required: true, min: 0 },
  capacity: { type: Number, default: 2, min: 1 },
  bedType: { type: String, default: "Queen Bed" },
  size: { type: String, default: "300 sq ft" },
  rating: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  imageUrl: { type: String, default: "" },
  status: { type: String, enum: ["available", "maintenance", "cleaning"], default: "available" },
  amenities: [{ type: String }]
}, { timestamps: true });

const MongooseRoom = mongoose.models.Room || mongoose.model("Room", roomSchema);
const EmbeddedRoom = embeddedStore.createModel("rooms");

const Room = new Proxy({}, {
  get(_target, prop) {
    const active = isEmbedded() ? EmbeddedRoom : MongooseRoom;
    const value = active[prop];
    return typeof value === "function" ? value.bind(active) : value;
  }
});

export default Room;
