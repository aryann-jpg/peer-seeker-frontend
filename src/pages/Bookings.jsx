import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "../css/Bookings.css";


const Bookings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          "/bookings/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(res.data);
      } catch {
        alert("Failed to load bookings");
      }
    };

    fetchBookings();
  }, [navigate, token]);

  const deleteBooking = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirm) return;

    await axios.delete(`/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back
        </button>
        <h1> My Bookings</h1>
      </div>

      {bookings.length === 0 && (
        <p className="empty">No bookings yet</p>
      )}

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
    </div>
  );
};

export default Bookings;
