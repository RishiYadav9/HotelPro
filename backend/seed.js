import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB, isEmbedded } from "./src/config/db.js";
import User from "./src/models/User.js";
import Room from "./src/models/Room.js";
import Booking from "./src/models/Booking.js";
import Review from "./src/models/Review.js";
import mongoose from "mongoose";

dotenv.config();

async function runSeed() {
  await connectDB();

  console.log("Seeding HotelPro database...");

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const staffPassword = await bcrypt.hash("Staff123!", 12);
  const guestPassword = await bcrypt.hash("Guest123!", 12);

  const upsertUser = async (data) => {
    return await User.findOneAndUpdate(
      { email: data.email },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  };

  const admin = await upsertUser({
    name: "HotelPro Admin",
    email: "admin@hotelpro.demo",
    password: adminPassword,
    role: "admin",
    phone: "+91 98765 43210"
  });

  const staff = await upsertUser({
    name: "Front Desk Staff",
    email: "staff@hotelpro.demo",
    password: staffPassword,
    role: "staff",
    phone: "+91 98765 43211"
  });

  const guest = await upsertUser({
    name: "Aarav Sharma",
    email: "guest@hotelpro.demo",
    password: guestPassword,
    role: "guest",
    phone: "+91 98765 43212"
  });

  const sampleRooms = [
    {
      name: "Comfort Standard Suite",
      number: "101",
      category: "Standard",
      description: "A calm, comfortable sanctuary with warm ambient lighting, premium linen, and an ergonomic workspace. Ideal for short business stays and peaceful getaways.",
      pricePerNight: 2499,
      capacity: 2,
      bedType: "Queen Bed",
      size: "280 sq ft",
      rating: 4.8,
      numReviews: 12,
      imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["High-speed Wi-Fi", "Air Conditioning", "HD Smart TV", "Work Desk", "Complimentary Water", "En-suite Bathroom"]
    },
    {
      name: "Deluxe City View Haven",
      number: "202",
      category: "Deluxe",
      description: "Floor-to-ceiling windows overlooking the skyline. Features handcrafted oak furniture, an Italian marble bathroom, and plush bathrobes.",
      pricePerNight: 4299,
      capacity: 2,
      bedType: "King Bed",
      size: "380 sq ft",
      rating: 4.9,
      numReviews: 24,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["Panoramic City View", "High-speed Wi-Fi", "Mini Fridge", "Espresso Machine", "Air Conditioning", "Rain Shower", "Safety Locker"]
    },
    {
      name: "Family Garden Retreat",
      number: "303",
      category: "Family",
      description: "Generously spaced family residence with two interconnected sleeping areas, a private garden balcony, and a child-safe lounge setup.",
      pricePerNight: 5899,
      capacity: 4,
      bedType: "1 King + 2 Twin Beds",
      size: "520 sq ft",
      rating: 4.9,
      numReviews: 18,
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["Private Balcony", "High-speed Wi-Fi", "Separate Lounge", "Dining Area", "2x Smart TV", "Mini Fridge", "Complimentary Breakfast"]
    },
    {
      name: "Royal Presidential Suite",
      number: "401",
      category: "Suite",
      description: "The pinnacle of bespoke luxury. An expansive living room, private bar, Jacuzzi soaking tub, dedicated butler service, and complimentary airport chauffeur.",
      pricePerNight: 9499,
      capacity: 3,
      bedType: "Super King Bed",
      size: "780 sq ft",
      rating: 5.0,
      numReviews: 31,
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["Jacuzzi Tub", "Private Bar", "Butler Service", "24/7 Room Service", "Airport Transfer", "Walk-in Wardrobe", "Balcony Lounge"]
    },
    {
      name: "Executive Horizon Deluxe",
      number: "205",
      category: "Deluxe",
      description: "Tailored for the discerning executive. Soundproofed walls, high-speed fiber internet, multi-port docking station, and access to the executive lounge.",
      pricePerNight: 4699,
      capacity: 2,
      bedType: "King Bed",
      size: "400 sq ft",
      rating: 4.7,
      numReviews: 9,
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["Executive Lounge Access", "High-speed Wi-Fi", "Coffee Bar", "Smart Climate Control", "Premium Toiletries", "Ironing Facilities"]
    },
    {
      name: "Serene Studio Standard",
      number: "105",
      category: "Standard",
      description: "Modern minimalist decor inspired by Scandinavian design. Efficient layout with cozy reading nook and quiet courtyard view.",
      pricePerNight: 2799,
      capacity: 2,
      bedType: "Queen Bed",
      size: "290 sq ft",
      rating: 4.6,
      numReviews: 14,
      imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
      status: "available",
      amenities: ["Quiet Courtyard View", "High-speed Wi-Fi", "Air Conditioning", "Work Station", "Electric Kettle", "Hair Dryer"]
    }
  ];

  const seededRooms = [];
  for (const r of sampleRooms) {
    const room = await Room.findOneAndUpdate({ number: r.number }, r, { upsert: true, new: true, setDefaultsOnInsert: true });
    seededRooms.push(room);
  }

  // Check if bookings already exist, if not create sample bookings
  const existingBookingsCount = await Booking.countDocuments();
  if (existingBookingsCount === 0 && seededRooms.length >= 3 && guest) {
    const today = new Date();
    const pastIn = new Date(today.getTime() - 4 * 86400000);
    const pastOut = new Date(today.getTime() - 1 * 86400000);
    const currIn = new Date(today.getTime() - 1 * 86400000);
    const currOut = new Date(today.getTime() + 2 * 86400000);
    const futIn = new Date(today.getTime() + 5 * 86400000);
    const futOut = new Date(today.getTime() + 8 * 86400000);

    const b1 = await Booking.create({
      user: guest._id,
      room: seededRooms[0]._id,
      checkIn: pastIn,
      checkOut: pastOut,
      guests: 2,
      totalAmount: 7497,
      status: "checked_out",
      paymentStatus: "paid",
      paymentMethod: "Credit Card",
      transactionId: "TXN-9824-A1",
      specialRequests: "Quiet corner room please."
    });

    const b2 = await Booking.create({
      user: guest._id,
      room: seededRooms[1]._id,
      checkIn: currIn,
      checkOut: currOut,
      guests: 2,
      totalAmount: 12897,
      status: "checked_in",
      paymentStatus: "paid",
      paymentMethod: "UPI",
      transactionId: "TXN-7132-B2",
      specialRequests: "Late check-in at 8 PM."
    });

    await Booking.create({
      user: guest._id,
      room: seededRooms[3]._id,
      checkIn: futIn,
      checkOut: futOut,
      guests: 2,
      totalAmount: 28497,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "Net Banking",
      transactionId: "TXN-5541-C3",
      specialRequests: "Anniversary stay, floral arrangement requested."
    });

    // Add reviews
    await Review.create({
      user: guest._id,
      room: seededRooms[0]._id,
      booking: b1._id,
      rating: 5,
      title: "Exceptional comfort and peace",
      comment: "The room was immaculately clean, the bed was divine, and the front desk staff went above and beyond. Will definitely stay here again!"
    });

    await Review.create({
      user: guest._id,
      room: seededRooms[1]._id,
      booking: b2._id,
      rating: 5,
      title: "Breathtaking skyline views",
      comment: "Watching sunrise over the city from the 2nd floor window was magic. The espresso machine in the room was a wonderful touch."
    });
  }

  console.log("------------------------------------------------------------");
  console.log("Seed complete! Demo accounts ready:");
  console.log("  Admin: admin@hotelpro.demo / Admin123!");
  console.log("  Staff: staff@hotelpro.demo / Staff123!");
  console.log("  Guest: guest@hotelpro.demo / Guest123!");
  console.log("------------------------------------------------------------");

  if (!isEmbedded()) {
    await mongoose.disconnect();
  }
}

runSeed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
