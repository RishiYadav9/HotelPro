import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Plus, Edit2, Trash2, ArrowLeft, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import api from "../api";
import { formatMoney } from "../utils/formatters";
import EditRoomModal from "../components/EditRoomModal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const initialRoom = {
    name: "",
    number: "",
    category: "Standard",
    description: "",
    pricePerNight: "",
    capacity: 2,
    bedType: "Queen Bed",
    size: "300 sq ft",
    imageUrl: "",
    amenities: "High-speed Wi-Fi, Air Conditioning, HD Smart TV"
  };

  const [form, setForm] = useState(initialRoom);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rooms");
      setRooms(data.rooms || []);
    } catch (err) {
      toast.error("Failed to load rooms inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity),
        amenities: form.amenities
          ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : []
      };

      const { data } = await api.post("/rooms", payload);
      toast.success(data.message || "Room added to inventory!");
      setForm(initialRoom);
      setShowAddForm(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add room.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room? This cannot be undone.")) return;
    try {
      const { data } = await api.delete(`/rooms/${id}`);
      toast.success(data.message || "Room deleted.");
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete room.");
    }
  };

  const handleToggleStatus = async (room) => {
    const nextStatus = room.status === "available" ? "maintenance" : "available";
    try {
      const { data } = await api.patch(`/rooms/${room._id}/status`, { status: nextStatus });
      toast.success(data.message || "Room status updated.");
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change status.");
    }
  };

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">HOTELPRO INVENTORY</div>
          <h1>
            Room <em>Management</em>
          </h1>
          <p>Create, update, maintain, and configure pricing for all hotel accommodations.</p>
        </div>

        <div className="heading-actions-bar">
          <Link to="/admin" className="btn btn-outline">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <button
            className="btn btn-dark"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} /> {showAddForm ? "Cancel" : "Add New Room"}
          </button>
        </div>
      </div>

      {/* Add New Room Accordion */}
      {showAddForm && (
        <form className="add-room-form" onSubmit={handleAddSubmit}>
          <div className="section-kicker">NEW SUITE CREATION</div>
          <h3>Add Suite to Inventory</h3>

          <div className="form-grid">
            <label>
              Suite Name
              <input
                required
                type="text"
                placeholder="e.g. Celestial Skyline Deluxe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Room Number
              <input
                required
                type="text"
                placeholder="e.g. 502"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
              </select>
            </label>

            <label>
              Price per Night (₹)
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 3999"
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
              />
            </label>

            <label>
              Max Occupancy
              <input
                required
                type="number"
                min="1"
                max="10"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </label>

            <label>
              Bed Type
              <input
                type="text"
                placeholder="King Bed, Twin Beds"
                value={form.bedType}
                onChange={(e) => setForm({ ...form, bedType: e.target.value })}
              />
            </label>

            <label>
              Floor Space
              <input
                type="text"
                placeholder="350 sq ft"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />
            </label>

            <label>
              Image URL
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </label>

            <label className="span-two">
              Description
              <input
                placeholder="Short poetic description of room character and view…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label className="span-two">
              Amenities (comma-separated)
              <input
                placeholder="Wi-Fi, Air Conditioning, Smart TV, Mini Bar, Balcony"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={submitting}>
              {submitting ? "Saving Suite…" : "Save Suite to Inventory"}
            </button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      <section className="admin-section">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">ALL LISTED SUITES</div>
            <h2>Inventory Table ({rooms.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading rooms inventory…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Room Name & Number</th>
                  <th>Category</th>
                  <th>Rate / Night</th>
                  <th>Specs</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id}>
                    <td style={{ width: 70 }}>
                      <div className="table-room-thumb">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.name} />
                        ) : (
                          <BedDouble size={20} />
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{r.name}</strong>
                      <small>Room #{r.number}</small>
                    </td>
                    <td>
                      <span className="room-category inline-cat">{r.category}</span>
                    </td>
                    <td>
                      <strong>{formatMoney(r.pricePerNight)}</strong>
                    </td>
                    <td>
                      <div>{r.capacity} Guests · {r.bedType || "King Bed"}</div>
                      <small>{r.size || "300 sq ft"}</small>
                    </td>
                    <td>
                      <button
                        className={`status status-clickable status-${r.status || "available"}`}
                        onClick={() => handleToggleStatus(r)}
                        title="Click to toggle status"
                      >
                        {r.status || "available"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/rooms/${r._id}`}
                          className="btn btn-small btn-outline"
                          title="Preview public room view"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <button
                          className="btn btn-small btn-outline"
                          onClick={() => setEditingRoom(r)}
                          title="Edit Room Details"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="text-button danger"
                          onClick={() => handleDelete(r._id)}
                          title="Delete room"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onUpdated={() => {
            fetchRooms();
            setEditingRoom(null);
          }}
        />
      )}

      <Footer />
    </main>
  );
}
