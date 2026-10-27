import React, { useState, useEffect } from "react";
import { Search, BedDouble, SlidersHorizontal, RotateCcw, Calendar, Users } from "lucide-react";
import RoomCard from "../components/RoomCard";
import Footer from "../components/Footer";
import api from "../api";
import { toast } from "react-toastify";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [sort, setSort] = useState("price_asc");

  const todayStr = new Date().toISOString().slice(0, 10);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rooms", {
        params: {
          search,
          category,
          minPrice,
          maxPrice,
          checkIn,
          checkOut,
          sort
        }
      });
      setRooms(data.rooms || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not fetch rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      return toast.error("Check-out date must be after check-in date.");
    }
    fetchRooms();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCheckIn("");
    setCheckOut("");
    setSort("price_asc");
    setTimeout(fetchRooms, 50);
  };

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">AVAILABLE ACCOMMODATIONS</div>
          <h1>
            Rooms & <em>Suites</em>
          </h1>
          <p>Carefully appointed spaces designed for restful slumbers and serene mornings.</p>
        </div>
        <div className="heading-actions-bar">
          <span className="heading-count">
            <BedDouble size={16} /> {rooms.length} Suites Available
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      <form className="filter-panel" onSubmit={handleSearchSubmit}>
        <label className="filter-search">
          <span>KEYWORD SEARCH</span>
          <div>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by suite name, view, or amenity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>SUITE CATEGORY</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Family">Family</option>
          </select>
        </label>

        <label>
          <span>CHECK-IN</span>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>

        <label>
          <span>CHECK-OUT</span>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>

        <label>
          <span>SORT BY</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Guest Rating</option>
          </select>
        </label>

        <button type="submit" className="btn btn-dark filter-button">
          <Search size={16} /> Find Stays
        </button>

        <details className="price-details">
          <summary>Filter by Budget / Night</summary>
          <div className="price-inputs">
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <button className="btn btn-small btn-dark" type="submit">
              Apply
            </button>
            {(search || category || minPrice || maxPrice || checkIn || checkOut) && (
              <button
                type="button"
                className="btn btn-small btn-outline"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </details>
      </form>

      {/* Room Grid */}
      {loading ? (
        <div className="loading">Checking suite availability…</div>
      ) : rooms.length ? (
        <div className="room-grid">
          {rooms.map((room, idx) => (
            <RoomCard key={room._id} room={room} index={idx} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BedDouble size={40} />
          <h3>No suites match your criteria</h3>
          <p>Try adjusting your search terms, dates, or clearing your filters.</p>
          <button className="btn btn-outline" onClick={handleResetFilters}>
            <RotateCcw size={14} /> Clear All Filters
          </button>
        </div>
      )}

      <Footer />
    </main>
  );
}
