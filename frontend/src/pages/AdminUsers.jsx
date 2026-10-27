import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, ArrowLeft, Search, UserCheck } from "lucide-react";
import api from "../api";
import { formatDate } from "../utils/formatters";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(data.message || `Role updated to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Role change failed.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <div className="section-kicker">ACCESS CONTROL & PRIVILEGES</div>
          <h1>
            User & Staff <em>Accounts</em>
          </h1>
          <p>Manage system roles, staff permissions, and guest accounts across the platform.</p>
        </div>

        <div className="heading-actions-bar">
          <Link to="/admin" className="btn btn-outline">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <span className="heading-count">
            <Users size={16} /> {users.length} Total Accounts
          </span>
        </div>
      </div>

      <section className="admin-section">
        {/* Search Bar */}
        <div className="ops-filter-bar">
          <div className="ops-search-form">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search accounts by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading accounts registry…</div>
        ) : filteredUsers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Assigned Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-profile-cell">
                        <span className="user-avatar-sm">{u.name[0]?.toUpperCase()}</span>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "—"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <select
                        className={`status-select role-select role-select-${u.role}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="guest">Guest</option>
                        <option value="staff">Staff (Front Desk)</option>
                        <option value="admin">Admin (Full Control)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Users size={36} />
            <h3>No users found</h3>
            <p>No user accounts matched your search keyword.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
