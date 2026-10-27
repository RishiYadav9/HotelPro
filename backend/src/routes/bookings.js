import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// POST /api/bookings — Guest create reservation
router.post("/", protect, allowRoles("guest"), async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests = 1, specialRequests = "", paymentMethod = "Pay at Hotel" } = req.body;
    const start = new Date(checkIn), end = new Date(checkOut);

    if (!roomId || !checkIn || !checkOut || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
      return res.status(400).json({ message: "Please choose valid check-in and check-out dates." });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (start < todayStart) {
      return res.status(400).json({ message: "Check-in date cannot be in the past." });
    }

    const room = await Room.findById(roomId);
    if (!room || room.status !== "available") {
      return res.status(404).json({ message: "Selected room is not currently available." });
    }

    if (Number(guests) < 1 || Number(guests) > room.capacity) {
      return res.status(400).json({ message: `This room accommodates 1 to ${room.capacity} guests.` });
    }

    const overlap = await Booking.exists({
      room: room._id,
      status: { $in: ["confirmed", "checked_in"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (overlap) {
      return res.status(409).json({ message: "This room is already reserved for the selected dates. Please pick alternative dates or another room." });
    }

    const nights = Math.max(1, Math.ceil((end - start) / 86400000));
    const totalAmount = nights * room.pricePerNight;

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn: start,
      checkOut: end,
      guests: Number(guests),
      totalAmount,
      specialRequests: specialRequests.trim(),
      paymentStatus: paymentMethod === "Pay at Hotel" ? "pending" : "paid",
      paymentMethod,
      transactionId: paymentMethod === "Pay at Hotel" ? "" : `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "confirmed"
    });

    const populated = await booking.populate("room");
    res.status(201).json({ booking: populated, message: "Reservation confirmed successfully!" });
  } catch (e) {
    next(e);
  }
});

// GET /api/bookings/mine — Guest view their bookings
router.get("/mine", protect, allowRoles("guest"), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) {
    next(e);
  }
});

// GET /api/bookings/:id — Get single booking details for invoice / receipt
router.get("/:id", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("user", "name email phone");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const isOwner = String(typeof booking.user === "object" ? booking.user._id : booking.user) === String(req.user._id);
    const isStaffOrAdmin = ["staff", "admin"].includes(req.user.role);

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: "You do not have permission to view this booking invoice." });
    }

    res.json({ booking });
  } catch (e) {
    next(e);
  }
});

// POST /api/bookings/:id/pay — Process simulated payment
router.post("/:id/pay", protect, async (req, res, next) => {
  try {
    const { paymentMethod = "Credit Card" } = req.body;
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const isOwner = String(typeof booking.user === "object" ? booking.user._id : booking.user) === String(req.user._id);
    const isStaffOrAdmin = ["staff", "admin"].includes(req.user.role);
    if (!isOwner && !isStaffOrAdmin) return res.status(403).json({ message: "Unauthorized." });

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "This booking is already paid." });
    }

    const transactionId = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "paid",
        paymentMethod,
        transactionId,
        status: booking.status === "cancelled" ? "confirmed" : booking.status
      },
      { new: true }
    ).populate("room").populate("user", "name email");

    res.json({
      booking: updated,
      message: "Payment processed successfully! Your booking receipt is ready."
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/bookings — Staff & Admin overview with status filter & search
router.get("/", protect, allowRoles("staff", "admin"), async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    let bookings = await Booking.find(filter)
      .populate("room")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b => {
        const guestName = b.user?.name?.toLowerCase() || "";
        const guestEmail = b.user?.email?.toLowerCase() || "";
        const roomNum = b.room?.number?.toLowerCase() || "";
        const roomName = b.room?.name?.toLowerCase() || "";
        const txn = b.transactionId?.toLowerCase() || "";
        return guestName.includes(q) || guestEmail.includes(q) || roomNum.includes(q) || roomName.includes(q) || txn.includes(q);
      });
    }

    res.json({ bookings, count: bookings.length });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/bookings/:id/cancel — Guest (owner) or Admin cancel
router.patch("/:id/cancel", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const isOwner = String(typeof booking.user === "object" ? booking.user._id : booking.user) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "You cannot cancel this booking." });
    }

    if (!["confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "Only confirmed bookings can be cancelled." });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        paymentStatus: booking.paymentStatus === "paid" ? "refunded" : booking.paymentStatus
      },
      { new: true }
    ).populate("room");

    res.json({
      booking: updated,
      message: "Booking has been cancelled. If payment was made, refund status has been marked as refunded."
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/bookings/:id/status — Staff & Admin update check-in, check-out, confirmed
router.patch("/:id/status", protect, allowRoles("staff", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "checked_in", "checked_out", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid booking status." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("room").populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // If checked out, update room status to cleaning
    if (status === "checked_out" && booking.room?._id) {
      await Room.findByIdAndUpdate(booking.room._id, { status: "cleaning" });
    }

    res.json({ booking, message: `Booking status updated to ${status.replace("_", " ")}.` });
  } catch (e) {
    next(e);
  }
});

export default router;
