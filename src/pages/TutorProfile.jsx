import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../api";
import Loading from "./Loading";
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

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) return navigate("/login");

      try {
        const tutorRes = await api.get(`/tutors/${id}`);
        setTutor(tutorRes.data);

        if (user.role === "student") {
          const bookmarksRes = await api.get("/bookmarks");
          setBookmarked(
            bookmarksRes.data.some((b) => b._id === tutorRes.data._id)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token, user]);

  if (loading) return <Loading text="Loading tutor profile..." />;
  if (!tutor) return <p style={{ padding: 40 }}>Tutor not found</p>;


  /* ================= FETCH TUTOR ================= */
  useEffect(() => {
    const fetchTutorAndBookmarks = async () => {
      if (!token || !user) {
        navigate("/login");
        return;
      }

      try {
        // 1️⃣ Fetch tutor
        const resTutor = await api.get(`/tutors/${id}`);
        setTutor(resTutor.data);

        // 2️⃣ Fetch bookmarks if student
        if (user.role === "student") {
          const resBookmarks = await api.get("/bookmarks", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const isBookmarked = resBookmarks.data.some(
            (b) => b._id === resTutor.data._id
          );
          setBookmarked(isBookmarked);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch tutor error:", err.response?.data || err);
        setLoading(false);
      }
    };

    fetchTutorAndBookmarks();
  }, [id, navigate, token, user]);

  /* ================= BOOKMARK ================= */
  const handleBookmark = async () => {
    if (!user || !token) return navigate("/login");

    try {
      await api.post(`/bookmarks/${tutor._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Toggle local state
      setBookmarked((prev) => !prev);
    } catch (err) {
      console.error("Bookmark error:", err.response?.data || err);
      alert("Failed to bookmark tutor");
    }
  };

  /* ================= CREATE BOOKING ================= */
  const handleCreateBooking = async () => {
    if (!date) return alert("Please select a date and time");

    try {
      await api.post("/bookings", {
        tutorId: tutor._id,
        date,
        duration,
        message,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Booking request sent 🎉");
      setShowBooking(false);
      setDate("");
      setMessage("");
    } catch (err) {
      console.error("Create booking error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to create booking");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!tutor) return <p style={{ padding: 40 }}>Tutor not found</p>;

  return (
    <div className="profile">
      <div className="profile-wrapper">
        <div className="profile-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {user?.role === "student" && (
            <button className="bookmark-btn" onClick={handleBookmark}>
              {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          )}

          {user?.role === "student" && (
            <button className="book-btn" onClick={() => setShowBooking(true)}>
              📅 Book Session
            </button>
          )}
        </div>

        <div className="profile-card">
          <img
            className="profile-avatar"
            src={`https://ui-avatars.com/api/?name=${tutor.name}&background=2563eb&color=fff`}
            alt={tutor.name}
          />
          <h1>{tutor.name}</h1>
          <p className="profile-course">{tutor.course} — Year {tutor.year}</p>

          {tutor.skills?.length > 0 && (
            <div className="profile-skills">
              <h3>Skills</h3>
              <ul>{tutor.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
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
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />

            <label>Duration</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>

            <label>Message (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} />

            <div className="modal-actions">
              <button onClick={() => setShowBooking(false)}>Cancel</button>
              <button className="confirm" onClick={handleCreateBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfile;
