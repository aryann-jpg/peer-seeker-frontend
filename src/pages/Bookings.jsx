import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api";
import "../css/Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ date: "", duration: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings");
      }
    };
    fetchBookings();
  }, [navigate]);

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      alert("Booking cancelled");
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  // Start Editing Mode
  const startEdit = (b) => {
    setEditingId(b._id);
    setEditData({
      date: b.date.substring(0, 16), // Format for datetime-local input
      duration: b.duration,
      message: b.message || ""
    });
  };

  // Save Updates
  const saveUpdate = async (id) => {
    try {
      const res = await api.put(`/bookings/${id}`, editData);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data : b)));
      setEditingId(null);
      alert("Booking updated successfully!");
    } catch (err) {
      alert("Failed to update booking");
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back
        </button>
        <h1>My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <p className="empty">No bookings yet</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="booking-card">
              {/* Tutor's Name */}
              <h3>{b.tutor?.name || "Tutor Name"}</h3>
              <p className="tutor-course">{b.tutor?.course}</p>

              {editingId === b._id ? (
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
                    <button className="save-btn" onClick={() => saveUpdate(b._id)}>Save Changes</button>
                    <button className="cancel-edit-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>Date:</strong> {new Date(b.date).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {b.duration} minutes</p>
                  {b.message && (
                    <p className="message"><strong>Message:</strong> {b.message}</p>
                  )}
                  
                  <button className="edit-btn" onClick={() => startEdit(b)}>
                    Edit Booking
                  </button>
                  <button className="cancel" onClick={() => deleteBooking(b._id)}>
                    Cancel Booking
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;