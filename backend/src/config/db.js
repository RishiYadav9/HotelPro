import mongoose from "mongoose";
import { embeddedStore } from "./embeddedStore.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let useEmbedded = false;

export function isEmbedded() {
  return useEmbedded;
}

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotelpro";
  const timeoutMs = uri.includes("mongodb+srv") ? 8000 : 2500;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs
    });
    console.log("Connected to MongoDB at:", uri.replace(/:[^:]*@/, ":****@"));
    useEmbedded = false;
  } catch (err) {
    console.log("------------------------------------------------------------");
    console.log("MongoDB is not available at", uri);
    console.log("Automatically switching to Autonomous Embedded Storage Engine.");
    console.log("Data will persist safely to backend/data/hotelpro_db.json");
    console.log("To connect real MongoDB, configure MONGO_URI in backend/.env");
    console.log("------------------------------------------------------------");
    useEmbedded = true;
    embeddedStore.init();
    await autoSeedIfNeeded();
  }
}

export async function autoSeedIfNeeded() {
  const users = embeddedStore.getCollection("users");
  if (users.length === 0) {
    console.log("Initializing default accounts and sample hotel rooms...");
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    const staffPassword = await bcrypt.hash("Staff123!", 12);
    const guestPassword = await bcrypt.hash("Guest123!", 12);

    const adminId = "64a1b2c3d4e5f6a7b8c90001";
    const staffId = "64a1b2c3d4e5f6a7b8c90002";
    const guestId = "64a1b2c3d4e5f6a7b8c90003";

    users.push(
      {
        _id: adminId,
        name: "HotelPro Admin",
        email: "admin@hotelpro.demo",
        password: adminPassword,
        role: "admin",
        phone: "+91 98765 43210",
        createdAt: new Date().toISOString()
      },
      {
        _id: staffId,
        name: "Front Desk Staff",
        email: "staff@hotelpro.demo",
        password: staffPassword,
        role: "staff",
        phone: "+91 98765 43211",
        createdAt: new Date().toISOString()
      },
      {
        _id: guestId,
        name: "Aarav Sharma",
        email: "guest@hotelpro.demo",
        password: guestPassword,
        role: "guest",
        phone: "+91 98765 43212",
        createdAt: new Date().toISOString()
      }
    );

    const rooms = embeddedStore.getCollection("rooms");
    const r1 = "64a1b2c3d4e5f6a7b8c91001";
    const r2 = "64a1b2c3d4e5f6a7b8c91002";
    const r3 = "64a1b2c3d4e5f6a7b8c91003";
    const r4 = "64a1b2c3d4e5f6a7b8c91004";
    const r5 = "64a1b2c3d4e5f6a7b8c91005";
    const r6 = "64a1b2c3d4e5f6a7b8c91006";

    rooms.push(
      {
        _id: r1,
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
        _id: r2,
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
        _id: r3,
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
        _id: r4,
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
        _id: r5,
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
        _id: r6,
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
    );

    // Seed some sample bookings so admin analytics and operations tables look populated right away!
    const bookings = embeddedStore.getCollection("bookings");
    const today = new Date();
    const pastDate = new Date(today.getTime() - 4 * 86400000);
    const pastOut = new Date(today.getTime() - 1 * 86400000);
    const currentIn = new Date(today.getTime() - 1 * 86400000);
    const currentOut = new Date(today.getTime() + 2 * 86400000);
    const futureIn = new Date(today.getTime() + 5 * 86400000);
    const futureOut = new Date(today.getTime() + 8 * 86400000);

    bookings.push(
      {
        _id: "64a1b2c3d4e5f6a7b8c92001",
        user: guestId,
        room: r1,
        checkIn: pastDate.toISOString(),
        checkOut: pastOut.toISOString(),
        guests: 2,
        totalAmount: 7497,
        status: "checked_out",
        paymentStatus: "paid",
        paymentMethod: "Credit Card",
        transactionId: "TXN-9824-A1",
        specialRequests: "Quiet corner room please.",
        createdAt: pastDate.toISOString()
      },
      {
        _id: "64a1b2c3d4e5f6a7b8c92002",
        user: guestId,
        room: r2,
        checkIn: currentIn.toISOString(),
        checkOut: currentOut.toISOString(),
        guests: 2,
        totalAmount: 12897,
        status: "checked_in",
        paymentStatus: "paid",
        paymentMethod: "UPI",
        transactionId: "TXN-7132-B2",
        specialRequests: "Late check-in at 8 PM.",
        createdAt: currentIn.toISOString()
      },
      {
        _id: "64a1b2c3d4e5f6a7b8c92003",
        user: guestId,
        room: r4,
        checkIn: futureIn.toISOString(),
        checkOut: futureOut.toISOString(),
        guests: 2,
        totalAmount: 28497,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "Net Banking",
        transactionId: "TXN-5541-C3",
        specialRequests: "Anniversary stay, floral arrangement requested.",
        createdAt: today.toISOString()
      }
    );

    // Seed reviews
    const reviews = embeddedStore.getCollection("reviews");
    reviews.push(
      {
        _id: "64a1b2c3d4e5f6a7b8c93001",
        user: guestId,
        room: r1,
        booking: "64a1b2c3d4e5f6a7b8c92001",
        rating: 5,
        title: "Exceptional comfort and peace",
        comment: "The room was immaculately clean, the bed was divine, and the front desk staff went above and beyond. Will definitely stay here again!",
        createdAt: pastOut.toISOString()
      },
      {
        _id: "64a1b2c3d4e5f6a7b8c93002",
        user: guestId,
        room: r2,
        booking: "64a1b2c3d4e5f6a7b8c92002",
        rating: 5,
        title: "Breathtaking skyline views",
        comment: "Watching sunrise over the city from the 2nd floor window was magic. The espresso machine in the room was a wonderful touch.",
        createdAt: today.toISOString()
      }
    );

    embeddedStore.save();
    console.log("Embedded database successfully populated with rich demo data!");
  }
}
