import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api";
import "../css/Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ date: "", duration: "", message: "" });
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user) return navigate("/login");

    setRole(user.role);

    const fetchBookings = async () => {
      try {
        const endpoint = user.role === "tutor" ? "/bookings/tutor" : "/bookings/my";
        const res = await api.get(endpoint);
        setBookings(res.data);
      } catch {
        alert("Failed to load bookings");
      }
    };
    fetchBookings();
  }, [navigate]);

  /* ================= STUDENT ACTIONS ================= */

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      alert("Booking cancelled");
    } catch {
      alert("Failed to cancel booking");
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setEditData({
      date: b.date.substring(0, 16),
      duration: b.duration,
      message: b.message || "",
    });
  };

  const saveUpdate = async (id) => {
    try {
      const res = await api.put(`/bookings/${id}`, editData);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data : b)));
      setEditingId(null);
      alert("Booking updated successfully!");
    } catch {
      alert("Failed to update booking");
    }
  };

  /* ================= TUTOR ACTIONS ================= */

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });

      const backendStatus = status === "accepted" ? "confirmed" : status === "rejected" ? "cancelled" : status;

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: backendStatus } : b))
      );
    } catch (err) {
      console.error("Update status failed:", err.response || err);
      alert("Failed to update booking status");
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button onClick={() => navigate("/")} className="back-btn">← Back</button>
        <h1>{role === "tutor" ? "Booking Requests" : "My Bookings"}</h1>
      </div>

      {bookings.length === 0 ? (
        <p className="empty">No bookings yet</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="booking-card">
              <h3>{role === "tutor" ? b.student?.name || "Student" : b.tutor?.name || "Tutor"}</h3>
              {role === "student" && <p className="tutor-course">{b.tutor?.course}</p>}
              <p><strong>Date:</strong> {new Date(b.date).toLocaleString()}</p>
              <p><strong>Duration:</strong> {b.duration} minutes</p>
              <p><strong>Status:</strong> {b.status}</p>
              {b.message && <p className="message"><strong>Message:</strong> {b.message}</p>}

              {/* STUDENT VIEW */}
              {role === "student" && b.status === "pending" && (
                editingId === b._id ? (
                  <div className="edit-form">
                    <label>Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    />
                    <label>Duration (mins):</label>
                    <input
                      type="number"
                      value={editData.duration}
                      onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                    />
                    <label>Message:</label>
                    <textarea
                      value={editData.message}
                      onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveUpdate(b._id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEdit(b)}>Edit Booking</button>
                    <button className="cancel" onClick={() => deleteBooking(b._id)}>Cancel Booking</button>
                  </>
                )
              )}

              {/* TUTOR VIEW */}
              {role === "tutor" && b.status === "pending" && (
                <div className="tutor-actions">
                  <button onClick={() => updateStatus(b._id, "accepted")}>Accept</button>
                  <button onClick={() => updateStatus(b._id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
