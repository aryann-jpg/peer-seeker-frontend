import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../api";
import "../css/TutorProfile.css";

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState("");

  /* ================= FETCH TUTOR ================= */

  useEffect(() => {
    api
      .get(`/tutors/${id}`)
      .then((res) => {
        setTutor(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load tutor:", err);
        setLoading(false);
      });
  }, [id]);

  /* ================= BOOKMARK ================= */

  const handleBookmark = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      await api.post(`/bookmarks/${tutor._id}`);
      setBookmarked((prev) => !prev);
    } catch (err) {
      console.error("Bookmark error:", err);
      alert("Failed to bookmark tutor");
    }
  };

  /* ================= CREATE BOOKING ================= */

  const handleCreateBooking = async () => {
    if (!date) return alert("Please select a date and time");

    try {
      await api.post("/bookings", {
        tutor: tutor._id,              // ✅ FIXED
        date,
        duration: Number(duration),    // ✅ ensure number
        message,
      });

      alert("Booking created 🎉");
      setShowBooking(false);
      setDate("");
      setDuration(60);
      setMessage("");
    } catch (err) {
      console.error("Create booking error:", err.response?.data || err);
      alert("Failed to create booking");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!tutor) return <p style={{ padding: 40 }}>Tutor not found</p>;

  return (
    <div className="profile">
      <div className="profile-wrapper">
        <div className="profile-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <button className="bookmark-btn" onClick={handleBookmark}>
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>

          <button className="book-btn" onClick={() => setShowBooking(true)}>
            📅 Book Session
          </button>
        </div>

        <div className="profile-card">
          <img
            className="profile-avatar"
            src={`https://ui-avatars.com/api/?name=${tutor.name}&background=2563eb&color=fff`}
            alt={tutor.name}
          />

          <h1>{tutor.name}</h1>

          <p className="profile-course">
            {tutor.course} — Year {tutor.year}
          </p>

          {tutor.skills?.length > 0 && (
            <div className="profile-skills">
              <h3>Skills</h3>
              <ul>
                {tutor.skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {tutor.bio && (
            <div className="profile-bio">
              <h3>About</h3>
              <p>{tutor.bio}</p>
            </div>
          )}
        </div>
      </div>

      {showBooking && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <h2>Book a Session</h2>

            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label>Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>

            <label>Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowBooking(false)}>Cancel</button>
              <button className="confirm" onClick={handleCreateBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfile;
