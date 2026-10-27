import React, { useState, useEffect } from "react";
import { X, Save, BedDouble } from "lucide-react";
import api from "../api";
import { toast } from "react-toastify";

export default function EditRoomModal({ room, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    category: "Standard",
    pricePerNight: "",
    capacity: 2,
    bedType: "Queen Bed",
    size: "300 sq ft",
    imageUrl: "",
    status: "available",
    description: "",
    amenities: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        number: room.number || "",
        category: room.category || "Standard",
        pricePerNight: room.pricePerNight || "",
        capacity: room.capacity || 2,
        bedType: room.bedType || "Queen Bed",
        size: room.size || "300 sq ft",
        imageUrl: room.imageUrl || "",
        status: room.status || "available",
        description: room.description || "",
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : ""
      });
    }
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        capacity: Number(formData.capacity),
        amenities: formData.amenities
          ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : []
      };

      const { data } = await api.put(`/rooms/${room._id}`, payload);
      toast.success(data.message || "Room updated successfully!");
      if (onUpdated) onUpdated(data.room);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-kicker">INVENTORY MANAGEMENT</div>
            <h3>Edit Room #{room?.number}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-room-form">
          <div className="form-grid">
            <label>
              Room Name
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label>
              Room Number
              <input
                required
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </label>

            <label>
              Category
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
              />
            </label>

            <label>
              Capacity (Guests)
              <input
                required
                type="number"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </label>

            <label>
              Bed Type
              <input
                type="text"
                value={formData.bedType}
                onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                placeholder="e.g. King Bed, Twin Beds"
              />
            </label>

            <label>
              Room Size
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g. 350 sq ft"
              />
            </label>

            <label>
              Status
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>

            <label className="span-two">
              Image URL
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            <label className="span-two">
              Description
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </label>

            <label className="span-two">
              Amenities (comma-separated)
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Wi-Fi, Air Conditioning, City View, Mini Fridge"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={saving}>
              <Save size={15} /> {saving ? "Saving Changes…" : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
