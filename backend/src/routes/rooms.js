import { Router } from "express";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/rooms — List with search, category, price, date availability & sorting
router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "", minPrice, maxPrice, checkIn, checkOut, sort = "price_asc" } = req.query;
    const filter = { status: "available" };

    if (category && category !== "All") filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined && minPrice !== "") filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== "") filter.pricePerNight.$lte = Number(maxPrice);
    }

    let sortOption = { pricePerNight: 1 };
    if (sort === "price_desc") sortOption = { pricePerNight: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };

    let rooms = await Room.find(filter).sort(sortOption);

    if (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const overlaps = await Booking.find({
        status: { $in: ["confirmed", "checked_in"] },
        checkIn: { $lt: end },
        checkOut: { $gt: start }
      }).select("room");

      const busy = new Set(overlaps.map(b => String(typeof b.room === "object" ? b.room._id : b.room)));
      rooms = rooms.filter(room => !busy.has(String(room._id)));
    }

    res.json({ rooms, count: rooms.length });
  } catch (e) {
    next(e);
  }
});

// GET /api/rooms/:id — Room details with associated reviews
router.get("/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found." });

    const reviews = await Review.find({ room: room._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ room, reviews });
  } catch (e) {
    next(e);
  }
});

// POST /api/rooms — Admin create room
router.post("/", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { name, number, category, description, pricePerNight, capacity, bedType, size, imageUrl, amenities } = req.body;
    if (!name || !number || !pricePerNight) {
      return res.status(400).json({ message: "Name, room number, and price per night are required." });
    }

    const exists = await Room.exists({ number });
    if (exists) return res.status(409).json({ message: `Room number ${number} already exists.` });

    const room = await Room.create({
      name,
      number,
      category: category || "Standard",
      description: description || "",
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity) || 2,
      bedType: bedType || "Queen Bed",
      size: size || "300 sq ft",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: Array.isArray(amenities) ? amenities : ["High-speed Wi-Fi", "Air Conditioning", "HD Smart TV"]
    });

    res.status(201).json({ room, message: "Room created successfully." });
  } catch (e) {
    next(e);
  }
});

// PUT /api/rooms/:id — Admin update room
router.put("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json({ room, message: "Room updated successfully." });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/rooms/:id/status — Staff & Admin update room status (available, cleaning, maintenance)
router.patch("/:id/status", protect, allowRoles("staff", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["available", "cleaning", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed: available, cleaning, maintenance." });
    }
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json({ room, message: `Room status updated to ${status}.` });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/rooms/:id — Admin delete room
router.delete("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const linked = await Booking.exists({
      room: req.params.id,
      status: { $in: ["confirmed", "checked_in"] }
    });
    if (linked) return res.status(409).json({ message: "Room has active bookings and cannot be deleted." });

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully." });
  } catch (e) {
    next(e);
  }
});

// GET /api/rooms/:id/reviews — List reviews for room
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (e) {
    next(e);
  }
});

// POST /api/rooms/:id/reviews — Guest submit review
router.post("/:id/reviews", protect, allowRoles("guest"), async (req, res, next) => {
  try {
    const { rating, title, comment, bookingId } = req.body;
    if (!rating || !title || !comment) {
      return res.status(400).json({ message: "Rating, review title, and comments are required." });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found." });

    const review = await Review.create({
      user: req.user._id,
      room: room._id,
      booking: bookingId || null,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim()
    });

    // Update room average rating
    const allReviews = await Review.find({ room: room._id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Room.findByIdAndUpdate(room._id, {
      rating: Math.round(avg * 10) / 10,
      numReviews: allReviews.length
    });

    res.status(201).json({ review, message: "Thank you for your review!" });
  } catch (e) {
    next(e);
  }
});

export default router;
