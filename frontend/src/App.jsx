import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";

// Pages
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import BookRoom from "./pages/BookRoom";
import MyBookings from "./pages/MyBookings";
import Operations from "./pages/Operations";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRooms from "./pages/AdminRooms";
import AdminUsers from "./pages/AdminUsers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Checking authorization…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Guest Protected Routes */}
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute roles={["guest"]}>
                <BookRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute roles={["guest"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Staff & Admin Operations */}
          <Route
            path="/operations"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <Operations />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AuthProvider>
  );
}
