import { Router } from "express";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/admin/overview — Executive statistics & metrics
router.get("/overview", protect, allowRoles("admin"), async (_req, res, next) => {
  try {
    const [totalUsers, totalRooms, totalBookings, revenueAgg, statusAgg, allRooms, allBookings] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Room.find(),
      Booking.find().populate("user", "name email").populate("room", "name number").sort({ createdAt: -1 })
    ]);

    const paidRevenue = revenueAgg[0]?.total || 0;

    // Calculate occupied rooms (checked_in)
    const checkedInCount = allBookings.filter(b => b.status === "checked_in").length;
    const occupancyRate = totalRooms > 0 ? Math.round((checkedInCount / totalRooms) * 100) : 0;

    // Room categories count
    const categoryCounts = {};
    for (const r of allRooms) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }

    // Status map
    const statusMap = {
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      cancelled: 0
    };
    for (const s of statusAgg) {
      if (s._id) statusMap[s._id] = s.count;
    }

    // Recent 5 bookings
    const recentBookings = allBookings.slice(0, 5);

    res.json({
      users: totalUsers,
      rooms: totalRooms,
      bookings: totalBookings,
      paidRevenue,
      occupancyRate,
      checkedInCount,
      statuses: statusMap,
      categoryCounts,
      recentBookings
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/users — List all accounts
router.get("/users", protect, allowRoles("admin"), async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/users/:id/role — Change account role
router.patch("/users/:id/role", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["guest", "staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed roles: guest, staff, admin." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user, message: `Role updated to ${role}.` });
  } catch (e) {
    next(e);
  }
});

export default router;
