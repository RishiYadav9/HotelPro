import mongoose from "mongoose";
import { isEmbedded } from "../config/db.js";
import { embeddedStore } from "../config/embeddedStore.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["guest", "staff", "admin"], default: "guest" },
  phone: { type: String, default: "" }
}, { timestamps: true });

const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);
const EmbeddedUser = embeddedStore.createModel("users");

const User = new Proxy({}, {
  get(_target, prop) {
    const active = isEmbedded() ? EmbeddedUser : MongooseUser;
    const value = active[prop];
    return typeof value === "function" ? value.bind(active) : value;
  }
});

export default User;
