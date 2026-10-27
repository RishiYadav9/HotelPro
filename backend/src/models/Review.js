import mongoose from "mongoose";
import { isEmbedded } from "../config/db.js";
import { embeddedStore } from "../config/embeddedStore.js";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 }
}, { timestamps: true });

const MongooseReview = mongoose.models.Review || mongoose.model("Review", reviewSchema);
const EmbeddedReview = embeddedStore.createModel("reviews");

const Review = new Proxy({}, {
  get(_target, prop) {
    const active = isEmbedded() ? EmbeddedReview : MongooseReview;
    const value = active[prop];
    return typeof value === "function" ? value.bind(active) : value;
  }
});

export default Review;
