import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api";
import "../css/Bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  // Fetch bookings when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my"); // token automatically added via api interceptor
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings");
      }
    };

    fetchBookings();
  }, [navigate]);

  // Delete booking
  const deleteBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      alert("Booking cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
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
              <h3>{b.tutor.name}</h3>
              <p>{b.tutor.course}</p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(b.date).toLocaleString()}
              </p>

              <p>
                <strong>Duration:</strong> {b.duration} minutes
              </p>

              {b.message && (
                <p className="message">
                  <strong>Message:</strong> {b.message}
                </p>
              )}

              <button
                className="cancel"
                onClick={() => deleteBooking(b._id)}
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
