import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api";
import Loading from "./Loading";
import "../css/Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ date: "", duration: "", message: "" });
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user) return navigate("/login");

    setRole(user.role);

    const fetchBookings = async () => {
      try {
        const endpoint =
          user.role === "tutor" ? "/bookings/tutor" : "/bookings/my";
        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch {
        alert("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, token]);

  if (loading) return <Loading text="Loading bookings..." />;

  /* ================= STUDENT ACTIONS ================= */
  const deleteBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
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
      const res = await api.put(`/bookings/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
      setEditingId(null);
    } catch {
      alert("Failed to update booking");
    }
  };

  /* ================= TUTOR ACTIONS ================= */
  const updateStatus = async (id, status) => {
    const backendStatus =
      status === "accepted"
        ? "confirmed"
        : status === "rejected"
        ? "cancelled"
        : status;

    try {
      await api.patch(
        `/bookings/${id}/status`,
        { status: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: backendStatus } : b
        )
      );
    } catch {
      alert("Failed to update booking status");
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status !== "pending");

  const renderBookingCard = (b) => (
    <div key={b._id} className="booking-card">
      <h3>{role === "tutor" ? b.student?.name : b.tutor?.name}</h3>
      <p><strong>Date:</strong> {new Date(b.date).toLocaleString()}</p>
      <p><strong>Duration:</strong> {b.duration} minutes</p>
      <p><strong>Status:</strong> {b.status}</p>

      {role === "student" && b.status === "pending" && (
        editingId === b._id ? (
          <div className="edit-form">
            <input
              type="datetime-local"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
            <input
              type="number"
              value={editData.duration}
              onChange={(e) =>
                setEditData({ ...editData, duration: e.target.value })
              }
            />
            <textarea
              value={editData.message}
              onChange={(e) =>
                setEditData({ ...editData, message: e.target.value })
              }
            />
            <button onClick={() => saveUpdate(b._id)}>Save</button>
            <button onClick={() => setEditingId(null)}>Cancel</button>
          </div>
        ) : (
          <>
            <button onClick={() => startEdit(b)}>Edit</button>
            <button className="cancel" onClick={() => deleteBooking(b._id)}>
              Cancel
            </button>
          </>
        )
      )}

      {role === "tutor" && b.status === "pending" && (
        <div className="tutor-actions">
          <button onClick={() => updateStatus(b._id, "accepted")}>Accept</button>
          <button onClick={() => updateStatus(b._id, "rejected")}>Reject</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="booking-page">
      <button onClick={() => navigate("/")}>← Back</button>

      <h2>Pending</h2>
      {pendingBookings.length === 0 ? (
        <p>No pending bookings</p>
      ) : (
        pendingBookings.map(renderBookingCard)
      )}

      <h2>Completed</h2>
      {completedBookings.length === 0 ? (
        <p>No completed bookings</p>
      ) : (
        completedBookings.map(renderBookingCard)
      )}
    </div>
  );
};

export default Bookings;
